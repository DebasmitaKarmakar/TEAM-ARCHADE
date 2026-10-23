import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../lib/api';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  memberUntil?: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isLoading: boolean;

  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  fetchMe: () => Promise<void>;
  setUser: (user: User) => void;
  isMember: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      isLoading: false,

      isMember: () => {
        const { user } = get();
        if (!user?.memberUntil) return false;
        return new Date(user.memberUntil) > new Date();
      },

      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const { data } = await api.post('/auth/login', { email, password });
          const { accessToken, user } = data.data;
          localStorage.setItem('accessToken', accessToken);
          set({ user, accessToken, isLoading: false });
        } catch (err) {
          set({ isLoading: false });
          throw err;
        }
      },

      register: async (name, email, password) => {
        set({ isLoading: true });
        try {
          const { data } = await api.post('/auth/register', { name, email, password });
          const { accessToken, user } = data.data;
          localStorage.setItem('accessToken', accessToken);
          set({ user, accessToken, isLoading: false });
        } catch (err) {
          set({ isLoading: false });
          throw err;
        }
      },

      logout: async () => {
        try {
          await api.post('/auth/logout');
        } catch {}
        localStorage.removeItem('accessToken');
        set({ user: null, accessToken: null });
        window.location.href = '/';
      },

      fetchMe: async () => {
        try {
          const { data } = await api.get('/auth/me');
          set({ user: data.data });
        } catch {
          localStorage.removeItem('accessToken');
          set({ user: null, accessToken: null });
        }
      },

      setUser: (user) => set({ user }),
    }),
    {
      name: 'blowmaggy-auth',
      partialize: (state) => ({ user: state.user, accessToken: state.accessToken }),
    }
  )
);
