import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithPopup,
  signOut as fbSignOut,
  signInAnonymously
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, googleProvider, db } from '../firebase';

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  phoneNumber: string;
  role: string;
  department: string;
  createdAt: string;
  updatedAt: string;
}

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signInWithGoogle: () => Promise<void>;
  loginWithDetails: (name: string, email: string, phoneNumber: string, role?: string, department?: string) => Promise<void>;
  updateProfileData: (updates: Partial<UserProfile>) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem('lexirisk_user_profile');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [isLoading, setIsLoading] = useState(true);

  // Sync user profile from Firestore
  const syncProfile = async (firebaseUser: User) => {
    try {
      const userRef = doc(db, 'users', firebaseUser.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const data = userSnap.data() as UserProfile;
        setUserProfile(data);
        localStorage.setItem('lexirisk_user_profile', JSON.stringify(data));
      } else {
        // Build initial profile
        const newProfile: UserProfile = {
          uid: firebaseUser.uid,
          name: firebaseUser.displayName || 'Compliance Auditor',
          email: firebaseUser.email || 'auditor@enterprise.internal',
          phoneNumber: firebaseUser.phoneNumber || '',
          role: 'Senior Legal & Compliance Counsel',
          department: 'Corporate Governance & Risk',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        await setDoc(userRef, newProfile);
        setUserProfile(newProfile);
        localStorage.setItem('lexirisk_user_profile', JSON.stringify(newProfile));
      }
    } catch (err) {
      console.warn('Could not sync user profile from Firestore:', err);
      // Fallback in-memory profile
      const fallback: UserProfile = {
        uid: firebaseUser.uid,
        name: firebaseUser.displayName || 'Compliance Auditor',
        email: firebaseUser.email || 'auditor@enterprise.internal',
        phoneNumber: '',
        role: 'Senior Legal & Compliance Counsel',
        department: 'Corporate Governance & Risk',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      setUserProfile(fallback);
      localStorage.setItem('lexirisk_user_profile', JSON.stringify(fallback));
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        await syncProfile(user);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      const res = await signInWithPopup(auth, googleProvider);
      if (res.user) {
        await syncProfile(res.user);
      }
    } catch (err: any) {
      console.error('Google Sign-In failed:', err);
      throw err;
    }
  };

  const loginWithDetails = async (
    name: string,
    email: string,
    phoneNumber: string,
    role = 'Senior Legal & Compliance Counsel',
    department = 'Corporate Governance & Risk'
  ) => {
    try {
      let uid = `user-${Date.now()}`;
      let user = auth.currentUser;

      if (!user) {
        try {
          const cred = await signInAnonymously(auth);
          user = cred.user;
          uid = user.uid;
        } catch (anonErr) {
          console.info('Anonymous auth disabled or offline, using session identity:', anonErr);
        }
      } else {
        uid = user.uid;
      }

      const profile: UserProfile = {
        uid,
        name: name || 'Compliance Auditor',
        email: email || user?.email || 'auditor@enterprise.internal',
        phoneNumber: phoneNumber || '',
        role,
        department,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      try {
        const userRef = doc(db, 'users', uid);
        await setDoc(userRef, profile, { merge: true });
      } catch (storeErr) {
        console.warn('Could not write profile to Firestore:', storeErr);
      }

      setUserProfile(profile);
      localStorage.setItem('lexirisk_user_profile', JSON.stringify(profile));
      if (user) {
        setCurrentUser(user);
      }
    } catch (err: any) {
      console.error('Login with details failed:', err);
      throw err;
    }
  };

  const updateProfileData = async (updates: Partial<UserProfile>) => {
    if (!userProfile) return;
    try {
      const updated: UserProfile = {
        ...userProfile,
        ...updates,
        updatedAt: new Date().toISOString()
      };
      if (currentUser?.uid) {
        const userRef = doc(db, 'users', currentUser.uid);
        await setDoc(userRef, updated, { merge: true });
      }
      setUserProfile(updated);
      localStorage.setItem('lexirisk_user_profile', JSON.stringify(updated));
    } catch (err) {
      console.error('Failed to update profile:', err);
    }
  };

  const logout = async () => {
    try {
      await fbSignOut(auth);
    } catch {
      // ignore
    }
    setCurrentUser(null);
    setUserProfile(null);
    localStorage.removeItem('lexirisk_user_profile');
  };

  const isAuthenticated = Boolean(currentUser || userProfile);

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userProfile,
        isAuthenticated,
        isLoading,
        signInWithGoogle,
        loginWithDetails,
        updateProfileData,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
