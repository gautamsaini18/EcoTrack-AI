// Dual-Mode Database Module
// Integrates Firestore when Firebase keys are available in .env.local,
// otherwise falls back to browser localStorage.

import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy,
  limit
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Check if Firebase configuration is complete
const isFirebaseConfigured = 
  firebaseConfig.apiKey && 
  firebaseConfig.apiKey !== 'YOUR_FIREBASE_API_KEY' &&
  firebaseConfig.projectId;

let firebaseApp = null;
let firestore = null;

if (isFirebaseConfigured) {
  try {
    firebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    firestore = getFirestore(firebaseApp);
    console.log("EcoTrack: Connected to cloud Firebase Firestore.");
  } catch (error) {
    console.error("EcoTrack: Failed to initialize Firestore:", error);
  }
} else {
  console.log("EcoTrack: Running in Local Storage Mock mode. Set firebase config in .env.local for Cloud Sync.");
}

// Helper: Local Storage wrappers
const getLocalStorageItem = (key, defaultValue) => {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (e) {
    return defaultValue;
  }
};

const setLocalStorageItem = (key, value) => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error("Localstorage write failed:", e);
  }
};

// --- API Implementation ---

/**
 * Get user profile details (displayName, emissionGoal, etc.)
 */
export async function dbGetUserProfile(userId) {
  if (!userId) return null;

  if (firestore) {
    try {
      const docRef = doc(firestore, 'profiles', userId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return docSnap.data();
      }
    } catch (e) {
      console.error("Firestore read error:", e);
    }
  }

  // Fallback / Mock Mode
  const profiles = getLocalStorageItem('ecotrack_profiles', {});
  return profiles[userId] || {
    displayName: 'Eco Pioneer',
    monthlyGoal: 400, // target max kg CO2/month
    createdAt: new Date().toISOString()
  };
}

/**
 * Update user profile details
 */
export async function dbUpdateUserProfile(userId, data) {
  if (!userId) return;

  if (firestore) {
    try {
      const docRef = doc(firestore, 'profiles', userId);
      await setDoc(docRef, data, { merge: true });
      return;
    } catch (e) {
      console.error("Firestore update error:", e);
    }
  }

  // Fallback / Mock Mode
  const profiles = getLocalStorageItem('ecotrack_profiles', {});
  profiles[userId] = { ...(profiles[userId] || {}), ...data, updatedAt: new Date().toISOString() };
  setLocalStorageItem('ecotrack_profiles', profiles);
}

/**
 * Get all footprint calculator logs for a user, sorted by date (newest first)
 */
export async function dbGetLogs(userId) {
  if (!userId) return [];

  if (firestore) {
    try {
      const q = query(
        collection(firestore, 'logs'), 
        where('userId', '==', userId), 
        orderBy('createdAt', 'desc'),
        limit(100)
      );
      const querySnapshot = await getDocs(q);
      const logs = [];
      querySnapshot.forEach((doc) => {
        logs.push({ id: doc.id, ...doc.data() });
      });
      return logs;
    } catch (e) {
      console.error("Firestore get logs failed, using local storage fallback", e);
    }
  }

  // Fallback / Mock Mode
  const allLogs = getLocalStorageItem('ecotrack_logs', []);
  return allLogs
    .filter(log => log.userId === userId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

/**
 * Add a calculator result log entry
 */
export async function dbAddLog(userId, logData) {
  if (!userId) return null;

  const entry = {
    userId,
    createdAt: new Date().toISOString(),
    ...logData
  };

  if (firestore) {
    try {
      const docRef = await addDoc(collection(firestore, 'logs'), entry);
      return { id: docRef.id, ...entry };
    } catch (e) {
      console.error("Firestore write logs failed, storing locally", e);
    }
  }

  // Fallback / Mock Mode
  const allLogs = getLocalStorageItem('ecotrack_logs', []);
  const newEntry = { id: 'log_' + Date.now() + Math.random().toString(36).substr(2, 5), ...entry };
  allLogs.push(newEntry);
  setLocalStorageItem('ecotrack_logs', allLogs);
  return newEntry;
}

/**
 * Get completed challenges for a user
 */
export async function dbGetCompletedChallenges(userId) {
  if (!userId) return [];

  if (firestore) {
    try {
      const q = query(
        collection(firestore, 'completed_challenges'),
        where('userId', '==', userId)
      );
      const querySnapshot = await getDocs(q);
      const challenges = [];
      querySnapshot.forEach((doc) => {
        challenges.push({ id: doc.id, ...doc.data() });
      });
      return challenges;
    } catch (e) {
      console.error("Firestore get challenges failed", e);
    }
  }

  // Fallback / Mock Mode
  const completed = getLocalStorageItem('ecotrack_completed_challenges', []);
  return completed.filter(c => c.userId === userId);
}

/**
 * Record a completed daily challenge
 */
export async function dbCompleteChallenge(userId, challengeId, challengeTitle, carbonSaved) {
  if (!userId) return null;

  const entry = {
    userId,
    challengeId,
    challengeTitle,
    carbonSaved, // in kg CO2
    completedAt: new Date().toISOString()
  };

  if (firestore) {
    try {
      const docRef = await addDoc(collection(firestore, 'completed_challenges'), entry);
      return { id: docRef.id, ...entry };
    } catch (e) {
      console.error("Firestore write challenge failed, writing local", e);
    }
  }

  // Fallback / Mock Mode
  const completed = getLocalStorageItem('ecotrack_completed_challenges', []);
  const newEntry = { id: 'challenge_log_' + Date.now(), ...entry };
  completed.push(newEntry);
  setLocalStorageItem('ecotrack_completed_challenges', completed);
  return newEntry;
}

/**
 * Get database mode summary
 */
export function getDbConnectionInfo() {
  return {
    isCloud: !!firestore,
    provider: firestore ? 'Firebase Firestore (Cloud)' : 'Local Storage (Sandbox Mode)'
  };
}
