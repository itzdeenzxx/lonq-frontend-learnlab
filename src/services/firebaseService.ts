import { storage } from "../firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import type { TravelPlace } from "../types/TravelPlace";

// User Collection
const USERS_COLLECTION = "users";
const REVIEWS_COLLECTION = "reviews";
const PLACES_COLLECTION = "places";
const REDEMPTIONS_COLLECTION = "redemptions";

// Firebase REST API Configuration
const PROJECT_ID = import.meta.env.VITE_FIREBASE_PROJECT_ID;
const API_KEY = import.meta.env.VITE_FIREBASE_API_KEY;
const FIRESTORE_BASE_URL = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;

// REST API Helper Functions
async function restGetDocument(collectionName: string, docId: string): Promise<any | null> {
  try {
    const response = await fetch(`${FIRESTORE_BASE_URL}/${collectionName}/${docId}?key=${API_KEY}`);
    if (response.status === 404) return null;
    if (!response.ok) {
      console.error("REST GET error:", response.status);
      return null;
    }
    const data = await response.json();
    return firestoreDocToObject(data);
  } catch (e) {
    console.error("REST GET fetch error:", e);
    return null;
  }
}

async function restSetDocument(collectionName: string, docId: string, data: any): Promise<boolean> {
  try {
    const firestoreData = objectToFirestoreDoc(data);
    const response = await fetch(`${FIRESTORE_BASE_URL}/${collectionName}/${docId}?key=${API_KEY}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fields: firestoreData })
    });
    if (!response.ok) {
      console.error("REST SET error:", response.status);
    }
    return response.ok;
  } catch (e) {
    console.error("REST SET fetch error:", e);
    return false;
  }
}

async function restAddDocument(collectionName: string, data: any): Promise<string | null> {
  try {
    const firestoreData = objectToFirestoreDoc(data);
    const response = await fetch(`${FIRESTORE_BASE_URL}/${collectionName}?key=${API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fields: firestoreData })
    });
    if (!response.ok) {
      console.error("REST ADD error:", response.status);
      return null;
    }
    const result = await response.json();
    // Extract document ID from name (format: projects/.../documents/collection/docId)
    const name = result.name as string;
    return name.split('/').pop() || null;
  } catch (e) {
    console.error("REST ADD fetch error:", e);
    return null;
  }
}

async function restQueryDocuments(collectionName: string, field: string, value: string): Promise<any[]> {
  try {
    const response = await fetch(`${FIRESTORE_BASE_URL}:runQuery?key=${API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        structuredQuery: {
          from: [{ collectionId: collectionName }],
          where: {
            fieldFilter: {
              field: { fieldPath: field },
              op: 'EQUAL',
              value: { stringValue: value }
            }
          }
        }
      })
    });
    if (!response.ok) {
      console.error("REST QUERY error:", response.status);
      return [];
    }
    const results = await response.json();
    return results
      .filter((r: any) => r.document)
      .map((r: any) => {
        const doc = firestoreDocToObject(r.document);
        const name = r.document.name as string;
        doc.id = name.split('/').pop();
        return doc;
      });
  } catch (e) {
    console.error("REST QUERY fetch error:", e);
    return [];
  }
}

async function restGetAllDocuments(collectionName: string): Promise<any[]> {
  try {
    const response = await fetch(`${FIRESTORE_BASE_URL}/${collectionName}?key=${API_KEY}`);
    if (!response.ok) {
      console.error("REST GET ALL error:", response.status);
      return [];
    }
    const data = await response.json();
    if (!data.documents) return [];
    return data.documents.map((doc: any) => {
      const obj = firestoreDocToObject(doc);
      const name = doc.name as string;
      obj.id = name.split('/').pop();
      return obj;
    });
  } catch (e) {
    console.error("REST GET ALL fetch error:", e);
    return [];
  }
}

// Convert Firestore document to plain object
function firestoreDocToObject(doc: any): any {
  if (!doc || !doc.fields) return null;
  const result: any = {};
  for (const [key, value] of Object.entries(doc.fields)) {
    result[key] = firestoreValueToJS(value as any);
  }
  return result;
}

// Convert Firestore value to JavaScript value
function firestoreValueToJS(value: any): any {
  if (value.stringValue !== undefined) return value.stringValue;
  if (value.integerValue !== undefined) return parseInt(value.integerValue);
  if (value.doubleValue !== undefined) return value.doubleValue;
  if (value.booleanValue !== undefined) return value.booleanValue;
  if (value.nullValue !== undefined) return null;
  if (value.timestampValue !== undefined) return new Date(value.timestampValue);
  if (value.arrayValue) {
    return (value.arrayValue.values || []).map(firestoreValueToJS);
  }
  if (value.mapValue) {
    return firestoreDocToObject({ fields: value.mapValue.fields });
  }
  return null;
}

// Convert JavaScript object to Firestore document format
function objectToFirestoreDoc(obj: any): any {
  const result: any = {};
  for (const [key, value] of Object.entries(obj)) {
    result[key] = jsValueToFirestore(value);
  }
  return result;
}

// Convert JavaScript value to Firestore value format
function jsValueToFirestore(value: any): any {
  if (value === null || value === undefined) return { nullValue: null };
  if (typeof value === 'string') return { stringValue: value };
  if (typeof value === 'number') {
    if (Number.isInteger(value)) return { integerValue: value.toString() };
    return { doubleValue: value };
  }
  if (typeof value === 'boolean') return { booleanValue: value };
  if (value instanceof Date) return { timestampValue: value.toISOString() };
  if (Array.isArray(value)) {
    return { arrayValue: { values: value.map(jsValueToFirestore) } };
  }
  if (typeof value === 'object') {
    return { mapValue: { fields: objectToFirestoreDoc(value) } };
  }
  return { nullValue: null };
}

export interface FirestoreUser {
  userId: string;
  displayName: string;
  pictureUrl: string | null;
  totalCoins: number;
  likedPlaces: string[];
  hasAddedShortcut?: boolean;
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
  async syncUser(userId: string, displayName: string, pictureUrl: string | null): Promise<FirestoreUser> {
    let user = await restGetDocument(USERS_COLLECTION, userId);
    
    if (!user) {
      const newUser: FirestoreUser = {
        userId,
        displayName,
        pictureUrl,
        totalCoins: 0,
        likedPlaces: []
      };
      await restSetDocument(USERS_COLLECTION, userId, newUser);
      return newUser;
    } else {
      user.displayName = displayName;
      user.pictureUrl = pictureUrl;
      await restSetDocument(USERS_COLLECTION, userId, user);
      return user as FirestoreUser;
    }
  },

  async getUser(userId: string): Promise<FirestoreUser | null> {
    return await restGetDocument(USERS_COLLECTION, userId) as FirestoreUser | null;
  },

  async addCoins(userId: string, amount: number): Promise<void> {
    const user = await restGetDocument(USERS_COLLECTION, userId);
    if (user) {
      user.totalCoins = (user.totalCoins || 0) + amount;
      await restSetDocument(USERS_COLLECTION, userId, user);
    }
  },

  async getCoins(userId: string): Promise<number> {
    const user = await this.getUser(userId);
    return user ? user.totalCoins : 0;
  },

  async redeemReward(userId: string, rewardId: string, cost: number, rewardDetails: any): Promise<any> {
    const user = await restGetDocument(USERS_COLLECTION, userId);
    if (!user) throw new Error("User does not exist!");
    
    const currentCoins = user.totalCoins || 0;
    if (currentCoins < cost) throw new Error("Insufficient coins!");
    
    // Deduct coins
    user.totalCoins = currentCoins - cost;
    await restSetDocument(USERS_COLLECTION, userId, user);
    
    // Create redemption record
    const redemptionId = `${userId}_${Date.now()}`;
    const redemptionData = {
      id: redemptionId,
      userId,
      rewardId,
      cost,
      rewardDetails,
      redeemedAt: new Date().toISOString(),
      status: 'active',
      qrCodeData: `REDEEM:${redemptionId}:${userId}:${rewardId}`
    };
    
    await restSetDocument(REDEMPTIONS_COLLECTION, redemptionId, redemptionData);
    return redemptionData;
  },

  async getUserRedemptions(userId: string): Promise<any[]> {
    return await restQueryDocuments(REDEMPTIONS_COLLECTION, 'userId', userId);
  },

  async getLikedPlaces(userId: string): Promise<string[]> {
    const user = await this.getUser(userId);
    return user?.likedPlaces || [];
  },

  async addLikedPlace(userId: string, placeId: string): Promise<void> {
    const user = await restGetDocument(USERS_COLLECTION, userId);
    if (user) {
      const currentLikedPlaces = user.likedPlaces || [];
      if (!currentLikedPlaces.includes(placeId)) {
        user.likedPlaces = [...currentLikedPlaces, placeId];
        await restSetDocument(USERS_COLLECTION, userId, user);
      }
    }
  },

  async removeLikedPlace(userId: string, placeId: string): Promise<void> {
    const user = await restGetDocument(USERS_COLLECTION, userId);
    if (user) {
      const currentLikedPlaces = user.likedPlaces || [];
      user.likedPlaces = currentLikedPlaces.filter((id: string) => id !== placeId);
      await restSetDocument(USERS_COLLECTION, userId, user);
    }
  },

  async clearLikedPlaces(userId: string): Promise<void> {
    const user = await restGetDocument(USERS_COLLECTION, userId);
    if (user) {
      user.likedPlaces = [];
      await restSetDocument(USERS_COLLECTION, userId, user);
    }
  },

  async setLikedPlaces(userId: string, placeIds: string[]): Promise<void> {
    const user = await restGetDocument(USERS_COLLECTION, userId);
    if (user) {
      user.likedPlaces = placeIds;
      await restSetDocument(USERS_COLLECTION, userId, user);
    }
  },

  async hasAddedShortcut(userId: string): Promise<boolean> {
    try {
      const user = await this.getUser(userId);
      return user?.hasAddedShortcut || false;
    } catch {
      return false;
    }
  },

  async setShortcutAdded(userId: string): Promise<void> {
    const user = await restGetDocument(USERS_COLLECTION, userId);
    if (user) {
      user.hasAddedShortcut = true;
      await restSetDocument(USERS_COLLECTION, userId, user);
    }
  }
};

export const ReviewService = {
  async addReview(userId: string, placeId: string, text: string, photoFile: File, userName: string, userPhoto: string): Promise<string> {
    // 1. Upload Photo (Storage still works via SDK)
    const storageRef = ref(storage, `reviews/${userId}/${Date.now()}_${photoFile.name}`);
    await uploadBytes(storageRef, photoFile);
    const photoUrl = await getDownloadURL(storageRef);

    // 2. Add Review to Firestore via REST
    const reviewData = {
      userId,
      placeId,
      text,
      photoUrl,
      timestamp: new Date(),
      userName,
      userPhoto
    };
    
    await restAddDocument(REVIEWS_COLLECTION, reviewData);

    // 3. Award Coins
    await UserService.addCoins(userId, 50);

    return photoUrl;
  },

  async getReviewsForPlace(placeId: string): Promise<Review[]> {
    return await restQueryDocuments(REVIEWS_COLLECTION, 'placeId', placeId) as Review[];
  }
};

export const PlaceService = {
  async getAllPlaces(): Promise<TravelPlace[]> {
    return await restGetAllDocuments(PLACES_COLLECTION) as TravelPlace[];
  },
  
  async savePlace(place: TravelPlace): Promise<void> {
    await restSetDocument(PLACES_COLLECTION, place.id, place);
  }
};
