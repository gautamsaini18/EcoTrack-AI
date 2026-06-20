'use client';

/* eslint-disable react-hooks/set-state-in-effect */

// Dual-Mode Authentication Provider
// Integrates Firebase Auth when keys are present in .env.local,
// otherwise falls back to a sandbox simulation in browser localStorage.

import React, { createContext, useContext, useState, useEffect } from 'react';
import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { dbGetUserProfile, dbUpdateUserProfile } from './db';

const SALT = 'ecotrack-sandbox-v1';

/**
 * Hash a password using the Web Crypto API (SHA-256).
 * Falls back to a simple hash if SubtleCrypto is unavailable.
 * @param {string} password
 * @returns {Promise<string>} hex-encoded hash
 */
async function hashPassword(password) {
  if (typeof crypto?.subtle?.digest !== 'function') {
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
      const char = password.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash |= 0;
    }
    return (hash >>> 0).toString(16);
  }
  const encoder = new TextEncoder();
  const data = encoder.encode(password + SALT);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const isFirebaseConfigured = 
  firebaseConfig.apiKey && 
  firebaseConfig.apiKey !== 'YOUR_FIREBASE_API_KEY' &&
  firebaseConfig.projectId;

let auth = null;

if (isFirebaseConfigured) {
  try {
    const firebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(firebaseApp);
    console.log("EcoTrack: Connected to cloud Firebase Auth.");
  } catch (error) {
    console.error("EcoTrack: Failed to initialize Firebase Auth:", error);
  }
}

const AuthContext = createContext({
  user: null,
  loading: true,
  isMock: true,
  signUp: async () => {},
  signIn: async () => {},
  signOut: async () => {},
  updateUserProfileState: async () => {}
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const isMock = !auth;

  // Track authentication state
  useEffect(() => {
    if (auth) {
      // Real Firebase State Tracker
      const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser) {
          // Fetch dynamic profile fields from DB
          const profile = await dbGetUserProfile(firebaseUser.uid);
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName || profile?.displayName || 'Eco Pioneer',
            photoURL: firebaseUser.photoURL,
            monthlyGoal: profile?.monthlyGoal || 400,
            isAnonymous: firebaseUser.isAnonymous
          });
        } else {
          setUser(null);
        }
        setLoading(false);
      });
      return () => unsubscribe();
    } else {
      // Local Storage Simulator Initialization
      if (typeof window !== 'undefined') {
        const cachedSession = window.localStorage.getItem('ecotrack_session');
        if (cachedSession) {
          try {
            const mockUser = JSON.parse(cachedSession);
            setUser(mockUser);
          } catch (e) {
            window.localStorage.removeItem('ecotrack_session');
          }
        }
      }
      setLoading(false);
    }
  }, []);

  // --- ACTIONS ---

  const signUp = async (email, password, displayName) => {
    setLoading(true);
    try {
      if (auth) {
        // Firebase Cloud Sign Up
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName });
        
        const freshUser = userCredential.user;
        const defaultProfile = {
          displayName,
          monthlyGoal: 400,
          createdAt: new Date().toISOString()
        };
        await dbUpdateUserProfile(freshUser.uid, defaultProfile);
        
        setUser({
          uid: freshUser.uid,
          email: freshUser.email,
          displayName: displayName,
          monthlyGoal: 400,
        });
        return { success: true, user: freshUser };
      } else {
        // Mock Sandbox Sign Up
        const users = JSON.parse(window.localStorage.getItem('ecotrack_users') || '[]');
        if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
          throw new Error('Email is already registered inside sandbox database.');
        }

        const passwordHash = await hashPassword(password);
        const newUid = 'mock_usr_' + Date.now();
        const newMockUser = {
          uid: newUid,
          email: email.toLowerCase(),
          displayName,
          monthlyGoal: 400,
          passwordHash
        };

        users.push(newMockUser);
        window.localStorage.setItem('ecotrack_users', JSON.stringify(users));

        // Create initial Profile
        const profiles = JSON.parse(window.localStorage.getItem('ecotrack_profiles') || '{}');
        profiles[newUid] = {
          displayName,
          monthlyGoal: 400,
          createdAt: new Date().toISOString()
        };
        window.localStorage.setItem('ecotrack_profiles', JSON.stringify(profiles));

        // Establish session
        const sessionUser = { uid: newUid, email: email.toLowerCase(), displayName, monthlyGoal: 400 };
        window.localStorage.setItem('ecotrack_session', JSON.stringify(sessionUser));
        setUser(sessionUser);
        return { success: true, user: sessionUser };
      }
    } catch (error) {
      console.error("SignUp Error:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email, password) => {
    setLoading(true);
    try {
      if (auth) {
        // Firebase Cloud Sign In
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const firebaseUser = userCredential.user;
        const profile = await dbGetUserProfile(firebaseUser.uid);
        
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName || profile?.displayName || 'Eco Pioneer',
          monthlyGoal: profile?.monthlyGoal || 400,
        });
        return { success: true, user: firebaseUser };
      } else {
        // Mock Sandbox Sign In
        const users = JSON.parse(window.localStorage.getItem('ecotrack_users') || '[]');
        const passwordHash = await hashPassword(password);
        const target = users.find(u => {
          if (u.email.toLowerCase() !== email.toLowerCase()) return false;
          if (u.passwordHash) return u.passwordHash === passwordHash;
          return u.password === password;
        });

        if (!target) {
          throw new Error('Invalid email or password credentials in sandbox.');
        }

        const profiles = JSON.parse(window.localStorage.getItem('ecotrack_profiles') || '{}');
        const userProfile = profiles[target.uid] || {};

        const sessionUser = {
          uid: target.uid,
          email: target.email,
          displayName: target.displayName,
          monthlyGoal: userProfile.monthlyGoal || 400
        };

        window.localStorage.setItem('ecotrack_session', JSON.stringify(sessionUser));
        setUser(sessionUser);
        return { success: true, user: sessionUser };
      }
    } catch (error) {
      console.error("SignIn Error:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      if (auth) {
        await firebaseSignOut(auth);
      } else {
        window.localStorage.removeItem('ecotrack_session');
      }
      setUser(null);
    } catch (error) {
      console.error("SignOut Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateUserProfileState = async (updatedFields) => {
    if (!user) return;
    try {
      const mergedFields = { ...user, ...updatedFields };
      
      // Update DB fields
      await dbUpdateUserProfile(user.uid, updatedFields);
      
      // If Firebase Auth profile needs updating
      if (auth && auth.currentUser && updatedFields.displayName) {
        await updateProfile(auth.currentUser, {
          displayName: updatedFields.displayName
        });
      }

      // Update Local session storage if mocking
      if (!auth) {
        window.localStorage.setItem('ecotrack_session', JSON.stringify(mergedFields));
      }

      setUser(mergedFields);
    } catch (e) {
      console.error("Failed to sync profile update to auth state:", e);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, isMock, signUp, signIn, signOut, updateUserProfileState }}>
      {children}
    </AuthContext.Provider>
  );
}
