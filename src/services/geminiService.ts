import { GoogleGenAI } from "@google/genai";
import type { TravelPlace } from '../types/TravelPlace';

const ai = new GoogleGenAI({ apiKey: "AIzaSyBjbtI0MnYxefrPgUvWToOkHtuJybnRdwI" });

export interface DayItinerary {
  day: number;
  title: string;
  activities: Activity[];
}

export interface Activity {
  time: string;
  placeId: string;
  placeName: string;
  duration: string;
  description: string;
  tips: string;
  transportToNext?: string;
  activityType?: 'main' | 'restaurant' | 'cafe' | 'market' | 'shop' | 'attraction' | 'nightlife';
  isNearbyRecommendation?: boolean;
}

export interface NearbyPlace {
  name: string;
  type: 'restaurant' | 'cafe' | 'market' | 'shop' | 'attraction' | 'other';
  description: string;
  walkingTime?: string;
}

export interface AIItinerary {
  tripName: string;
  totalDays: number;
  personality: string;
  summary: string;
  days: DayItinerary[];
  packingTips: string[];
  budgetEstimate: string;
  isOffline?: boolean; // Flag to indicate if this is a fallback itinerary
}

// Helper function to calculate distance between two coordinates
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of Earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Helper to sort places by proximity (nearest neighbor algorithm)
function sortByProximity(places: TravelPlace[]): TravelPlace[] {
  if (places.length <= 1) return places;
  
  const sorted: TravelPlace[] = [places[0]];
  const remaining = places.slice(1);
  
  while (remaining.length > 0) {
    const last = sorted[sorted.length - 1];
    let nearestIdx = 0;
    let minDist = Infinity;
    
    for (let i = 0; i < remaining.length; i++) {
      const dist = calculateDistance(last.lat, last.long, remaining[i].lat, remaining[i].long);
      if (dist < minDist) {
        minDist = dist;
        nearestIdx = i;
      }
    }
    
    sorted.push(remaining.splice(nearestIdx, 1)[0]);
  }
  
  return sorted;
}

// Generate offline/fallback itinerary when API is unavailable
function generateOfflineItinerary(
  places: TravelPlace[],
  personality: string,
  duration: string
): AIItinerary {
  const numDays = duration === '1 วัน ไม่ค้างคืน' ? 1 : 
                  duration === '2 วัน 1 คืน' ? 2 : 
                  duration === '3 วัน 2 คืน' ? 3 : 1;
  
  // Sort places by proximity for optimal routing
  const sortedPlaces = sortByProximity(places);
  const placesPerDay = Math.ceil(sortedPlaces.length / numDays);
  const days: DayItinerary[] = [];
  
  // Personality-based tips
  const personalityTips: { [key: string]: string[] } = {
    'introvert mode': [
      'Visit early morning to avoid crowds',
      'Bring headphones for relaxing music',
      'Find quiet spots to recharge'
    ],
    'extrovert mode': [
      'Chat with locals for insider tips',
      'Share your experiences with friends',
      'Try multiple local food spots'
    ],
    'adventure mode': [
      'Wear comfortable walking shoes',
      'Bring water and snacks',
      'Start early to beat the heat'
    ],
    'default': [
      'Bring sunscreen and a hat',
      'Carry umbrella or rain jacket',
      'Charge your phone fully'
    ]
  };
  
  const dayTitles = [
    'Adventure Begins 🌅',
    'Discover Hidden Gems 🌿',
    'Northern Charm 🏔️'
  ];
  
  for (let d = 0; d < numDays; d++) {
    const dayPlaces = sortedPlaces.slice(d * placesPerDay, (d + 1) * placesPerDay);
    const activities: Activity[] = dayPlaces.map((place, idx) => {
      const startHour = 9 + idx * 3; // Space out activities by 3 hours
      return {
        time: `${startHour.toString().padStart(2, '0')}:00`,
        placeId: place.id,
        placeName: place.name,
        duration: '2-3 hrs',
        description: place.description || `Explore ${place.name}, a must-visit spot in Chiang Mai`,
        tips: place.tags?.includes('Culture') 
          ? 'Dress modestly for temples' 
          : place.tags?.includes('Green')
          ? 'Bring water and sunscreen'
          : 'Visit early to avoid crowds',
        transportToNext: idx < dayPlaces.length - 1 
          ? '15-20 min by car or Grab' 
          : undefined
      };
    });
    
    days.push({
      day: d + 1,
      title: dayTitles[d] || `วันที่ ${d + 1}`,
      activities
    });
  }
  
  const tips = personalityTips[personality] || personalityTips['default'];
  
  return {
    tripName: '🌿 Your Chiang Mai Adventure',
    totalDays: numDays,
    personality,
    summary: `${numDays}-day trip with ${sortedPlaces.length} stops. Optimized route for ${personality} travelers.`,
    days,
    packingTips: tips,
    budgetEstimate: numDays === 1 
      ? '~500-1,500 THB/person' 
      : numDays === 2 
      ? '~2,000-4,000 THB/person (incl. stay)' 
      : '~3,500-6,000 THB/person (incl. stay)',
    isOffline: true
  };
}

export async function generateItinerary(
  places: TravelPlace[],
  personality: string,
  duration: string,
  customPreferences?: string
): Promise<AIItinerary> {
  const placesInfo = places.map(p => ({
    id: p.id,
    name: p.name,
    description: p.description || '',
    rating: p.rating || 0,
    tags: p.tags || [],
    lat: p.lat,
    long: p.long
  }));

  const systemPrompt = `You are LonQ AI, an expert travel planner specializing in Chiang Mai, Thailand. 
You create personalized, detailed travel itineraries based on user preferences.
Always respond with valid JSON only, no markdown or extra text.
ALL text content MUST be in English and kept short and concise.

Key guidelines:
- For "introvert mode": Focus on peaceful, less crowded places, temples, nature spots
- For "extrovert mode": Focus on social spots, markets, popular attractions, restaurants
- For "adventure mode": Focus on outdoor activities, hiking, water activities
- For "culture mode": Focus on temples, museums, historical sites, local traditions
- For "foodie mode": Focus on local food spots, cooking classes, markets

Consider the duration:
- "1 วัน ไม่ค้างคืน" (1 day, no overnight): Plan 5-7 activities total including meals and nearby spots
- "2 วัน 1 คืน" (2 days, 1 night): Plan 8-12 activities total per day
- "3 วัน 2 คืน" (3 days, 2 nights): Plan 6-8 activities per day
- Custom duration: Adjust accordingly

IMPORTANT - Include Nearby Places in Main Timeline:
For a complete trip experience, INSERT real nearby places BETWEEN the user's selected places.
These should be added as FULL activities in the main timeline with specific times:
- Breakfast/Lunch/Dinner spots near attractions (use activityType: "restaurant")
- Coffee breaks at local cafes (use activityType: "cafe")
- Night markets for evening activities (use activityType: "market" or "nightlife")
- Local shops or hidden gems (use activityType: "shop" or "attraction")

These nearby places should be REAL places in Chiang Mai and marked with isNearbyRecommendation: true.
The user's selected places should have isNearbyRecommendation: false or omitted.

Optimize routes based on geographical proximity to minimize travel time.
Include realistic time estimates and transportation suggestions.
Keep all descriptions SHORT (1-2 sentences max).`;

  const userPrompt = `Create a travel itinerary for Chiang Mai trip.

Selected Places:
${JSON.stringify(placesInfo, null, 2)}

Travel Style: ${personality}
Duration: ${duration}
${customPreferences ? `Additional Preferences: ${customPreferences}` : ''}

Generate a JSON response with this exact structure:
{
  "tripName": "Creative short trip name (e.g. 'Chiang Mai Adventure')",
  "totalDays": number,
  "personality": "${personality}",
  "summary": "Brief 1-sentence trip summary",
  "days": [
    {
      "day": 1,
      "title": "Short day theme (e.g. 'Temple Discovery')",
      "activities": [
        {
          "time": "09:00",
          "placeId": "place id from the list (use 'nearby-X' for recommended places)",
          "placeName": "place name",
          "duration": "2 hrs",
          "description": "Brief what to do (1 sentence)",
          "tips": "Short useful tip",
          "transportToNext": "Brief transport info (optional)",
          "activityType": "main|restaurant|cafe|market|shop|attraction|nightlife",
          "isNearbyRecommendation": false
        },
        {
          "time": "12:00",
          "placeId": "nearby-lunch-1",
          "placeName": "Real restaurant name near previous place",
          "duration": "1 hr",
          "description": "Lunch break - try local Khao Soi",
          "tips": "Best Khao Soi in the area",
          "activityType": "restaurant",
          "isNearbyRecommendation": true
        }
      ]
    }
  ],
  "packingTips": ["short tip 1", "short tip 2"],
  "budgetEstimate": "Budget range in THB"
}

IMPORTANT:
- ALL text must be in ENGLISH
- Keep all descriptions SHORT (1-2 sentences max)
- Use the provided places for main attractions (isNearbyRecommendation: false)
- ADD real nearby restaurants, cafes, markets BETWEEN main attractions (isNearbyRecommendation: true)
- For nearby places, use placeId like "nearby-cafe-1", "nearby-lunch-1", "nearby-market-1"
- Include breakfast, lunch, dinner, and coffee breaks at REAL Chiang Mai places
- Set appropriate activityType for each activity
- Order by time throughout the day (morning to night)
- Time format: "HH:MM"
- Return ONLY valid JSON, no markdown code blocks`;

  // Retry logic with fallback models
  // Note: gemini-2.0-flash-lite and gemini-1.5-flash-8b are lighter models with higher availability
  const models = ["gemini-2.0-flash-lite", "gemini-1.5-flash-8b", "gemini-2.0-flash", "gemini-2.5-flash"];
  const maxRetries = 2;
  
  for (const modelName of models) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`🤖 AI Trip Planner - Attempt ${attempt} with ${modelName}...`);
        console.log('📍 Places:', places.map(p => p.name));
        console.log('🎭 Personality:', personality);
        console.log('⏱️ Duration:', duration);
        
        const response = await ai.models.generateContent({
          model: modelName,
          contents: userPrompt,
          config: {
            systemInstruction: systemPrompt,
          },
        });

        console.log('✅ AI Response received!');
        console.log('📝 Raw response:', response);

        const text = response.text || '';
        console.log('📄 Response text:', text);
        
        // Clean up the response - remove markdown code blocks if present
        let cleanJson = text.trim();
        if (cleanJson.startsWith('```json')) {
          cleanJson = cleanJson.replace(/^```json\s*/, '').replace(/\s*```$/, '');
        } else if (cleanJson.startsWith('```')) {
          cleanJson = cleanJson.replace(/^```\s*/, '').replace(/\s*```$/, '');
        }
        
        console.log('🧹 Cleaned JSON:', cleanJson);
        
        const itinerary: AIItinerary = JSON.parse(cleanJson);
        console.log('✨ Parsed itinerary:', itinerary);
        return itinerary;
      } catch (error) {
        const errorMessage = (error as Error).message || '';
        const isOverloaded = errorMessage.includes('503') || errorMessage.includes('overloaded') || errorMessage.includes('UNAVAILABLE');
        
        console.warn(`⚠️ Attempt ${attempt} with ${modelName} failed:`, errorMessage);
        
        if (isOverloaded && attempt < maxRetries) {
          // Wait before retry (exponential backoff)
          const waitTime = attempt * 2000;
          console.log(`⏳ Waiting ${waitTime/1000}s before retry...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
          continue;
        }
        
        // If not overloaded error or max retries reached, try next model
        if (!isOverloaded || attempt >= maxRetries) {
          console.log(`🔄 Trying next model...`);
          break;
        }
      }
    }
  }
  
  // All models failed, use offline fallback
  console.error('❌ All AI models failed');
  console.log('⚠️ Falling back to offline itinerary...');
  return generateOfflineItinerary(places, personality, duration);
}
