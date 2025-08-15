import type { InteractionsSlice } from '../slices/interactions';

export const selectInteractionsFollowing = (state: {
  interactions: InteractionsSlice;
}) => state.interactions.following;
export const selectInteractionsFavorites = (state: {
  interactions: InteractionsSlice;
}) => state.interactions.favorites;
export const selectInteractionsIsFollowing =
  (username: string) => (state: { interactions: InteractionsSlice }) =>
    state.interactions.following[username] || false;
export const selectInteractionsIsFavorite =
  (id: string) => (state: { interactions: InteractionsSlice }) =>
    state.interactions.favorites[id] || false;
export const selectInteractionsFollowingCount = (state: {
  interactions: InteractionsSlice;
}) =>
  Object.keys(state.interactions.following).filter(
    (username) => state.interactions.following[username]
  ).length;
export const selectInteractionsFavoritesCount = (state: {
  interactions: InteractionsSlice;
}) =>
  Object.keys(state.interactions.favorites).filter(
    (id) => state.interactions.favorites[id]
  ).length;
