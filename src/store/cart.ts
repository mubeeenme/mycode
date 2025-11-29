import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { CartItem, CartStore, CartActions } from '@/types/cart';
import { supabase } from '@/lib/supabase';

interface CartState extends CartStore, CartActions {}

const generateSessionId = () => {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      totalItems: 0,
      subtotal: 0,
      tax: 0,
      shipping: 0,
      total: 0,
      isLoading: false,
      error: null,

      addItem: async (itemData) => {
        set({ isLoading: true, error: null });
        
        try {
          const state = get();
          const existingItemIndex = state.items.findIndex(
            (item) => item.productId === itemData.productId && item.variantId === itemData.variantId
          );

          let updatedItems: CartItem[];
          
          if (existingItemIndex >= 0) {
            updatedItems = [...state.items];
            updatedItems[existingItemIndex] = {
              ...updatedItems[existingItemIndex],
              quantity: updatedItems[existingItemIndex].quantity + itemData.quantity,
            };
          } else {
            const newItem: CartItem = {
              ...itemData,
              id: Math.random().toString(36).substring(2) + Date.now().toString(36),
            };
            updatedItems = [...state.items, newItem];
          }

          set({ items: updatedItems });
          
          await get().syncWithSupabase();
          get().calculateTotals();
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to add item to cart' });
        } finally {
          set({ isLoading: false });
        }
      },

      removeItem: async (itemId) => {
        set({ isLoading: true, error: null });
        
        try {
          const updatedItems = get().items.filter((item) => item.id !== itemId);
          set({ items: updatedItems });
          
          await get().syncWithSupabase();
          get().calculateTotals();
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to remove item from cart' });
        } finally {
          set({ isLoading: false });
        }
      },

      updateQuantity: async (itemId, quantity) => {
        if (quantity <= 0) {
          await get().removeItem(itemId);
          return;
        }

        set({ isLoading: true, error: null });
        
        try {
          const updatedItems = get().items.map((item) =>
            item.id === itemId ? { ...item, quantity } : item
          );
          set({ items: updatedItems });
          
          await get().syncWithSupabase();
          get().calculateTotals();
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to update item quantity' });
        } finally {
          set({ isLoading: false });
        }
      },

      clearCart: async () => {
        set({ isLoading: true, error: null });
        
        try {
          set({ items: [] });
          await get().syncWithSupabase();
          get().calculateTotals();
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to clear cart' });
        } finally {
          set({ isLoading: false });
        }
      },

      syncWithSupabase: async () => {
        const { items } = get();
        
        try {
          const { data: { user } } = await supabase.auth.getUser();
          
          if (user) {
            const { error } = await supabase
              .from('carts')
              .upsert({
                user_id: user.id,
                items,
                updated_at: new Date().toISOString(),
              } as any);

            if (error) throw error;
          } else {
            const sessionId = localStorage.getItem('cart_session_id') || generateSessionId();
            localStorage.setItem('cart_session_id', sessionId);

            const { error } = await supabase
              .from('carts')
              .upsert({
                session_id: sessionId,
                items,
                updated_at: new Date().toISOString(),
              } as any);

            if (error) throw error;
          }
        } catch (error) {
          console.error('Failed to sync cart with Supabase:', error);
        }
      },

      calculateTotals: () => {
        const { items } = get();
        const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
        const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

        set({
          subtotal,
          totalItems,
        });
      },
    }),
    {
      name: 'cart-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        items: state.items,
        subtotal: state.subtotal,
        totalItems: state.totalItems,
      }),
    }
  )
);