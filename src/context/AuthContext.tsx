import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from 'firebase/auth';
import { auth } from '../lib/firebase';

export interface SavedAccount {
  username: string;
  displayName: string;
  avatarIcon: string;
  lastUsedAt: number;
}

export function usernameToInternalEmail(username: string): string {
  const normalized = username.trim().toLowerCase();
  // Safe hex representation so any Unicode / Thai characters form a valid RFC email
  const hex = Array.from(new TextEncoder().encode(normalized))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  return `acc_${hex}@obsidianledger.app`;
}

interface AuthContextType {
  user: User | null;
  accountUsername: string;
  avatarIcon: string;
  loading: boolean;
  createAccount: (username: string, password: string, avatarIcon?: string) => Promise<void>;
  loginAccount: (username: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  savedAccounts: SavedAccount[];
  removeSavedAccount: (username: string) => void;
  authError: string | null;
  clearAuthError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const SAVED_ACCOUNTS_KEY = 'obsidian_saved_accounts';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [accountUsername, setAccountUsername] = useState<string>('');
  const [avatarIcon, setAvatarIcon] = useState<string>('person');
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  const [savedAccounts, setSavedAccounts] = useState<SavedAccount[]>(() => {
    try {
      const stored = localStorage.getItem(SAVED_ACCOUNTS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const saveAccountToList = (accName: string, icon: string) => {
    setSavedAccounts((prev) => {
      const filtered = prev.filter((a) => a.username.toLowerCase() !== accName.toLowerCase());
      const updated = [
        {
          username: accName,
          displayName: accName,
          avatarIcon: icon || 'person',
          lastUsedAt: Date.now(),
        },
        ...filtered,
      ].slice(0, 10);
      try {
        localStorage.setItem(SAVED_ACCOUNTS_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error('Failed to save account list:', e);
      }
      return updated;
    });
  };

  const removeSavedAccount = (accName: string) => {
    setSavedAccounts((prev) => {
      const updated = prev.filter((a) => a.username.toLowerCase() !== accName.toLowerCase());
      try {
        localStorage.setItem(SAVED_ACCOUNTS_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error('Failed to remove account:', e);
      }
      return updated;
    });
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (currentUser) => {
        setUser(currentUser);
        if (currentUser) {
          const name = currentUser.displayName || 'แอคเคาท์ของฉัน';
          const icon = currentUser.photoURL || 'person';
          setAccountUsername(name);
          setAvatarIcon(icon);
        } else {
          setAccountUsername('');
          setAvatarIcon('person');
        }
        setLoading(false);
      },
      (error) => {
        console.error('Auth state error:', error);
        setAuthError(error.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const formatAuthError = (err: any): string => {
    const code = err?.code || '';
    switch (code) {
      case 'auth/email-already-in-use':
        return 'ชื่อแอคเคาท์นี้มีผู้ใช้งานแล้ว กรุณาใช้ชื่ออื่น หรือเข้าสู่ระบบด้วยชื่อนี้';
      case 'auth/invalid-email':
        return 'ชื่อแอคเคาท์มีรูปแบบหรือตัวอักษรที่ไม่ถูกต้อง';
      case 'auth/weak-password':
        return 'รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร';
      case 'auth/user-not-found':
        return 'ไม่พบชื่อแอคเคาท์นี้ในระบบ กรุณาตรวจสอบชื่อหรือกดสร้างแอคเคาท์ใหม่';
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        return 'ชื่อแอคเคาท์หรือรหัสผ่านไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง';
      case 'auth/too-many-requests':
        return 'มีการพยายามเข้าสู่ระบบบ่อยเกินไป กรุณารอสักครู่แล้วลองใหม่';
      default:
        return err?.message || 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง';
    }
  };

  const createAccount = async (username: string, password: string, icon: string = 'person') => {
    setAuthError(null);
    const cleanName = username.trim();
    if (!cleanName) {
      const msg = 'กรุณาระบุชื่อแอคเคาท์';
      setAuthError(msg);
      throw new Error(msg);
    }
    if (cleanName.length < 2) {
      const msg = 'ชื่อแอคเคาท์ต้องมีความยาวอย่างน้อย 2 ตัวอักษร';
      setAuthError(msg);
      throw new Error(msg);
    }
    if (password.length < 6) {
      const msg = 'รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร';
      setAuthError(msg);
      throw new Error(msg);
    }

    try {
      const email = usernameToInternalEmail(cleanName);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      if (userCredential.user) {
        await updateProfile(userCredential.user, {
          displayName: cleanName,
          photoURL: icon,
        });
        setUser({ ...userCredential.user, displayName: cleanName, photoURL: icon });
        setAccountUsername(cleanName);
        setAvatarIcon(icon);
        saveAccountToList(cleanName, icon);
      }
    } catch (err: any) {
      console.error('Account Creation Error:', err);
      const errorMsg = formatAuthError(err);
      setAuthError(errorMsg);
      throw new Error(errorMsg);
    }
  };

  const loginAccount = async (username: string, password: string) => {
    setAuthError(null);
    const cleanName = username.trim();
    if (!cleanName || !password) {
      const msg = 'กรุณากรอกชื่อแอคเคาท์และรหัสผ่านให้ครบถ้วน';
      setAuthError(msg);
      throw new Error(msg);
    }

    try {
      const email = usernameToInternalEmail(cleanName);
      const cred = await signInWithEmailAndPassword(auth, email, password);
      const currentName = cred.user.displayName || cleanName;
      const currentIcon = cred.user.photoURL || 'person';
      setAccountUsername(currentName);
      setAvatarIcon(currentIcon);
      saveAccountToList(currentName, currentIcon);
    } catch (err: any) {
      console.error('Account Login Error:', err);
      const errorMsg = formatAuthError(err);
      setAuthError(errorMsg);
      throw new Error(errorMsg);
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      setAuthError(null);
      setAccountUsername('');
    } catch (err: any) {
      console.error('Sign Out Error:', err);
      setAuthError(formatAuthError(err));
    }
  };

  const clearAuthError = () => setAuthError(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        accountUsername,
        avatarIcon,
        loading,
        createAccount,
        loginAccount,
        signOut,
        savedAccounts,
        removeSavedAccount,
        authError,
        clearAuthError,
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
