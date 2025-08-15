import type { UISlice } from '../slices/ui';

export const selectUIHeaderCollapsed = (state: { ui: UISlice }) =>
  state.ui.headerCollapsed;
export const selectUIModal = (state: { ui: UISlice }) => state.ui.modal;
export const selectUIModalOpen = (state: { ui: UISlice }) =>
  state.ui.modal.open;
export const selectUIModalName = (state: { ui: UISlice }) =>
  state.ui.modal.name;
export const selectUIModalData = (state: { ui: UISlice }) =>
  state.ui.modal.data;
