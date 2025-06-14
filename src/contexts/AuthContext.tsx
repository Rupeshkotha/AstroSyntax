import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { getDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';

interface AuthUser extends User {
  isAdmin?: boolean;
}

interface AuthContextType {
  currentUser: AuthUser | null;
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  logout: async () => {},
  loading: true,
});

export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        let mergedUser: AuthUser = { ...user }; // Start with all properties from the Firebase User object

        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          const firestoreData = userDoc.data();
          // Merge Firestore data, overriding if present
          mergedUser = { 
            ...mergedUser, 
            ...firestoreData as Partial<AuthUser> 
          };
        }
        
        console.log("AuthContext: mergedUser before setting state", mergedUser);
        setCurrentUser(mergedUser);

      } else {
        console.log("AuthContext: No user logged in.");
        setCurrentUser(null);
      }
      setLoading(false);
    });

    return unsubscribe; // Cleanup subscription
  }, []);

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error logging out:', error);
      throw error;
    }
  };

  const value = {
    currentUser,
    logout,
    loading,
  };

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
}; 