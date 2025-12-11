import { db, storage } from "../firebase";
import { doc, getDoc, setDoc, updateDoc, increment, collection, addDoc, query, where, getDocs, runTransaction } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import type { TravelPlace } from "../types/TravelPlace";

// User Collection
const USERS_COLLECTION = "users";
const REVIEWS_COLLECTION = "reviews";
const PLACES_COLLECTION = "places";
const REDEMPTIONS_COLLECTION = "redemptions";

export interface FirestoreUser {
  userId: string;
  displayName: string;
  pictureUrl: string | null;
  totalCoins: number;
  likedPlaces: string[]; // Array of place IDs
  hasAddedShortcut?: boolean; // Track if user has added home screen shortcut
}

export interface Review {
  id?: string;
  userId: string;
  placeId: string;
  text: string;
  photoUrl: string;
  timestamp: any;
  userName: string;
  userPhoto: string;
}

export const UserService = {
  async syncUser(userId: string, displayName: string, pictureUrl: string | null) {
    const userRef = doc(db, USERS_COLLECTION, userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      // Create new user
      const newUser: FirestoreUser = {
        userId,
        displayName,
        pictureUrl,
        totalCoins: 0,
        likedPlaces: []
      };
      await setDoc(userRef, newUser);
      return newUser;
    } else {
      // Update existing user info if changed
      await updateDoc(userRef, {
        displayName,
        pictureUrl
      });
      return userSnap.data() as FirestoreUser;
    }
  },

  async getUser(userId: string) {
    const userRef = doc(db, USERS_COLLECTION, userId);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      return userSnap.data() as FirestoreUser;
    }
    return null;
  },

  async addCoins(userId: string, amount: number) {
    const userRef = doc(db, USERS_COLLECTION, userId);
    await updateDoc(userRef, {
      totalCoins: increment(amount)
    });
  },

  async getCoins(userId: string): Promise<number> {
    const user = await this.getUser(userId);
    return user ? user.totalCoins : 0;
  },

  async redeemReward(userId: string, rewardId: string, cost: number, rewardDetails: any) {
    const userRef = doc(db, USERS_COLLECTION, userId);
    
    try {
      const result = await runTransaction(db, async (transaction) => {
        const userDoc = await transaction.get(userRef);
        if (!userDoc.exists()) {
          throw new Error("User does not exist!");
        }

        const userData = userDoc.data() as FirestoreUser;
        const currentCoins = userData.totalCoins || 0;

        if (currentCoins < cost) {
          throw new Error("Insufficient coins!");
        }

        // Deduct coins
        transaction.update(userRef, {
          totalCoins: increment(-cost)
        });

        // Create redemption record
        const redemptionRef = doc(collection(db, REDEMPTIONS_COLLECTION));
        const redemptionData = {
          id: redemptionRef.id,
          userId,
          rewardId,
          cost,
          rewardDetails,
          redeemedAt: new Date().toISOString(),
          status: 'active', // active, used, expired
          qrCodeData: `REDEEM:${redemptionRef.id}:${userId}:${rewardId}`
        };
        
        transaction.set(redemptionRef, redemptionData);
        
        return redemptionData;
      });

      return result;
    } catch (e) {
      console.error("Redemption failed: ", e);
      throw e;
    }
  },

  async getUserRedemptions(userId: string) {
    const q = query(collection(db, REDEMPTIONS_COLLECTION), where("userId", "==", userId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data());
  },

  // Liked Places Management
  async getLikedPlaces(userId: string): Promise<string[]> {
    const user = await this.getUser(userId);
    return user?.likedPlaces || [];
  },

  async addLikedPlace(userId: string, placeId: string) {
    const userRef = doc(db, USERS_COLLECTION, userId);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      const userData = userSnap.data() as FirestoreUser;
      const currentLikedPlaces = userData.likedPlaces || [];
      
      // Only add if not already liked
      if (!currentLikedPlaces.includes(placeId)) {
        await updateDoc(userRef, {
          likedPlaces: [...currentLikedPlaces, placeId]
        });
      }
    }
  },

  async removeLikedPlace(userId: string, placeId: string) {
    const userRef = doc(db, USERS_COLLECTION, userId);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      const userData = userSnap.data() as FirestoreUser;
      const currentLikedPlaces = userData.likedPlaces || [];
      
      await updateDoc(userRef, {
        likedPlaces: currentLikedPlaces.filter(id => id !== placeId)
      });
    }
  },

  async clearLikedPlaces(userId: string) {
    const userRef = doc(db, USERS_COLLECTION, userId);
    await updateDoc(userRef, {
      likedPlaces: []
    });
  },

  async setLikedPlaces(userId: string, placeIds: string[]) {
    const userRef = doc(db, USERS_COLLECTION, userId);
    await updateDoc(userRef, {
      likedPlaces: placeIds
    });
  },

  // Shortcut tracking
  async hasAddedShortcut(userId: string): Promise<boolean> {
    const user = await this.getUser(userId);
    return user?.hasAddedShortcut || false;
  },

  async setShortcutAdded(userId: string) {
    const userRef = doc(db, USERS_COLLECTION, userId);
    await updateDoc(userRef, {
      hasAddedShortcut: true
    });
  }
};

export const ReviewService = {
  async addReview(userId: string, placeId: string, text: string, photoFile: File, userName: string, userPhoto: string) {
    // 1. Upload Photo
    const storageRef = ref(storage, `reviews/${userId}/${Date.now()}_${photoFile.name}`);
    await uploadBytes(storageRef, photoFile);
    const photoUrl = await getDownloadURL(storageRef);

    // 2. Add Review to Firestore
    const reviewData: Omit<Review, 'id'> = {
      userId,
      placeId,
      text,
      photoUrl,
      timestamp: new Date(),
      userName,
      userPhoto
    };
    
    await addDoc(collection(db, REVIEWS_COLLECTION), reviewData);

    // 3. Award Coins (e.g., 50 coins for a review)
    await UserService.addCoins(userId, 50);

    return photoUrl;
  },

  async getReviewsForPlace(placeId: string) {
    const q = query(collection(db, REVIEWS_COLLECTION), where("placeId", "==", placeId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() } as Review));
  }
};

export const PlaceService = {
  // Function to seed places if needed, or fetch them
  async getAllPlaces(): Promise<TravelPlace[]> {
    const querySnapshot = await getDocs(collection(db, PLACES_COLLECTION));
    return querySnapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() } as TravelPlace));
  },
  
  async savePlace(place: TravelPlace) {
      await setDoc(doc(db, PLACES_COLLECTION, place.id), place);
  }
};
