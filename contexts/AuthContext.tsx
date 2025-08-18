import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth, db } from '@/config/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';

interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  avatar?: string;
  photoURL?: string;
  gamesPlayed: number;
  gamesWon: number;
  gamesLost: number;
  points: number;
  coins: number;
  isOnline: boolean;
  createdAt: Date;
}

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, displayName: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      
      if (user) {
        // Cargar perfil del usuario desde Firestore
        await loadUserProfile(user.uid);
        // Guardar sesión en AsyncStorage
        await AsyncStorage.setItem('userToken', user.uid);
      } else {
        setUserProfile(null);
        // Limpiar sesión de AsyncStorage
        await AsyncStorage.removeItem('userToken');
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const loadUserProfile = async (uid: string) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        setUserProfile({
          uid,
          email: data.email,
          displayName: data.displayName,
          avatar: data.avatar || '🎯',
          photoURL: data.photoURL,
          gamesPlayed: data.gamesPlayed || 0,
          gamesWon: data.gamesWon || 0,
          gamesLost: data.gamesLost || 0,
          points: data.points || 0,
          coins: data.coins || 0,
          isOnline: data.isOnline || false,
          createdAt: data.createdAt?.toDate() || new Date(),
        });
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      throw new Error(getAuthErrorMessage(error.code));
    }
  };

  const register = async (email: string, password: string, displayName: string) => {
    try {
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      
      // Actualizar perfil de Firebase Auth
      await updateProfile(user, { displayName });
      
      // Crear documento de usuario en Firestore
      await setDoc(doc(db, 'users', user.uid), {
        email: user.email,
        displayName,
        avatar: '🎯',
        photoURL: null,
        gamesPlayed: 0,
        gamesWon: 0,
        gamesLost: 0,
        points: 0,
        coins: 100, // Monedas iniciales
        isOnline: true,
        createdAt: new Date(),
      });
      
    } catch (error: any) {
      throw new Error(getAuthErrorMessage(error.code));
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const value = {
    user,
    userProfile,
    loading,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

function getAuthErrorMessage(errorCode: string): string {
  switch (errorCode) {
    case 'auth/user-not-found':
      return 'No existe una cuenta con este correo electrónico';
    case 'auth/wrong-password':
      return 'Contraseña incorrecta';
    case 'auth/email-already-in-use':
      return 'Ya existe una cuenta con este correo electrónico';
    case 'auth/weak-password':
      return 'La contraseña debe tener al menos 6 caracteres';
    case 'auth/invalid-email':
      return 'Correo electrónico inválido';
    case 'auth/too-many-requests':
      return 'Demasiados intentos fallidos. Intenta más tarde';
    default:
      return 'Error de autenticación. Intenta nuevamente';
  }
}