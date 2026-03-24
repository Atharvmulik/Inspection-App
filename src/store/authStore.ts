import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, AuthState } from '@/types';

interface AuthStore extends AuthState {
  login: (email: string, password: string, rememberMe: boolean) => Promise<void>;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
  refreshSession: () => Promise<void>;
  setBiometricEnabled: (enabled: boolean) => void;
}

const dummyUser: User = {
  id: 'officer-001',
  name: 'Inspector Rajesh Kumar',
  email: 'rajesh.kumar@gov.in',
  badgeNumber: 'INS-2024-001',
  department: 'School Inspection Division',
  phone: '+91 98765 43210',
  profileImage: 'https://i.pravatar.cc/150?u=officer-001',
  role: 'officer',
  isActive: true,
  lastLogin: new Date().toISOString(),
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      token: null,
      refreshToken: null,
      sessionExpiry: null,

      login: async (email: string, password: string, rememberMe: boolean) => {
        set({ isLoading: true });
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Validate credentials (dummy validation)
        if (email === 'rajesh.kumar@gov.in' && password === 'password123') {
          const sessionExpiry = new Date();
          sessionExpiry.setHours(sessionExpiry.getHours() + 8); // 8 hour session
          
          set({
            user: dummyUser,
            isAuthenticated: true,
            token: 'dummy-jwt-token-' + Date.now(),
            refreshToken: 'dummy-refresh-token-' + Date.now(),
            sessionExpiry: sessionExpiry.toISOString(),
            isLoading: false,
          });
        } else {
          set({ isLoading: false });
          throw new Error('Invalid credentials. Please try again.');
        }
      },

      logout: () => {
        set({
          user: null,
          isAuthenticated: false,
          token: null,
          refreshToken: null,
          sessionExpiry: null,
        });
      },

      updateUser: (userData: Partial<User>) => {
        const currentUser = get().user;
        if (currentUser) {
          set({
            user: { ...currentUser, ...userData },
          });
        }
      },

      refreshSession: async () => {
        const sessionExpiry = new Date();
        sessionExpiry.setHours(sessionExpiry.getHours() + 8);
        
        set({
          token: 'refreshed-jwt-token-' + Date.now(),
          sessionExpiry: sessionExpiry.toISOString(),
        });
      },

      setBiometricEnabled: (enabled: boolean) => {
        // Store biometric preference
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        token: state.token,
        refreshToken: state.refreshToken,
        sessionExpiry: state.sessionExpiry,
      }),
    }
  )
);
