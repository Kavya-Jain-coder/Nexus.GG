import { create } from 'zustand';

export const useUIStore = create((set) => ({
  sidebarOpen: true,
  navbarCollapsed: false,
  isHoloFullscreen: false,
  notifications: [],
  soundMuted: (() => {
    const saved = localStorage.getItem('nexus_sound_muted') || localStorage.getItem('nexus_auth_muted');
    return saved ? JSON.parse(saved) : false;
  })(),
  
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebar: (isOpen) => set({ sidebarOpen: isOpen }),
  
  toggleNavbarCollapse: () => set((state) => ({ navbarCollapsed: !state.navbarCollapsed })),
  setNavbarCollapsed: (val) => set({ navbarCollapsed: val }),

  setIsHoloFullscreen: (val) => set({ isHoloFullscreen: val }),
  
  toggleSound: () => set((state) => {
    const newVal = !state.soundMuted;
    localStorage.setItem('nexus_sound_muted', JSON.stringify(newVal));
    localStorage.setItem('nexus_auth_muted', JSON.stringify(newVal));
    return { soundMuted: newVal };
  }),

  setSoundMuted: (isMuted) => set(() => {
    localStorage.setItem('nexus_sound_muted', JSON.stringify(isMuted));
    localStorage.setItem('nexus_auth_muted', JSON.stringify(isMuted));
    return { soundMuted: isMuted };
  }),
  
  addNotification: (message, type = 'info', duration = 4000) => {
    const id = Math.random().toString(36).substring(2, 9);
    set((state) => ({
      notifications: [...state.notifications, { id, message, type }]
    }));
    
    setTimeout(() => {
      set((state) => ({
        notifications: state.notifications.filter((n) => n.id !== id)
      }));
    }, duration);
  },
  
  removeNotification: (id) => set((state) => ({
    notifications: state.notifications.filter((n) => n.id !== id)
  }))
}));
