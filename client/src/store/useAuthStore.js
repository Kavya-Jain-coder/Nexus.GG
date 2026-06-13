import { create } from 'zustand';

export const useAuthStore = create((set) => ({
  user: null,
  session: null,
  profile: null,
  isAuthenticated: false,
  isLoading: true,
  
  setAuth: (session, user) => set({
    session,
    user,
    isAuthenticated: !!user,
    isLoading: false
  }),
  
  setProfile: (profile) => set({ profile }),
  
  setLoading: (isLoading) => set({ isLoading }),
  
  logout: () => set({
    user: null,
    session: null,
    profile: null,
    isAuthenticated: false,
    isLoading: false
  })
}));
