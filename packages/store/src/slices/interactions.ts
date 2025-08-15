'use client';

export type InteractionsSlice = {
  following: Record<string, boolean>;
  favorites: Record<string, boolean>;
  toggleFollow: (username: string) => void;
  toggleFavorite: (id: string) => void;
};

export const createInteractionsSlice = (set: any, get: any): InteractionsSlice => ({
  following: {},
  favorites: {},
  toggleFollow: (username) =>
    set((s: any) => {
      const next = !s.interactions.following[username];
      return {
        interactions: {
          ...s.interactions,
          following: { ...s.interactions.following, [username]: next }
        }
      };
    }),
  toggleFavorite: (id) =>
    set((s: any) => {
      const next = !s.interactions.favorites[id];
      return {
        interactions: {
          ...s.interactions,
          favorites: { ...s.interactions.favorites, [id]: next }
        }
      };
    })
});
