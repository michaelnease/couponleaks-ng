'use client';

export type UISlice = {
  headerCollapsed: boolean;
  modal: { open: boolean; name?: string; data?: unknown };
  setHeaderCollapsed: (v: boolean) => void;
  openModal: (name: string, data?: unknown) => void;
  closeModal: () => void;
};

export const createUISlice = (set: any): UISlice => ({
  headerCollapsed: false,
  modal: { open: false },
  setHeaderCollapsed: (v) =>
    set((s: any) => ({ ui: { ...s.ui, headerCollapsed: v } })),
  openModal: (name, data) =>
    set((s: any) => ({ ui: { ...s.ui, modal: { open: true, name, data } } })),
  closeModal: () =>
    set((s: any) => ({ ui: { ...s.ui, modal: { open: false } } }))
});
