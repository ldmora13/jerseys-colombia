import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children, user }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCart = async () => {
      setLoading(true);
      if (user?.id) {
        // Usuario autenticado: Cargar desde Supabase
        const { data, error } = await supabase
          .from('carts')
          .select('items')
          .eq('user_uid', user.id)
          .maybeSingle();

        if (error) console.error('Error cargando carrito de Supabase:', error);

        const supabaseCart = data?.items || [];
        const guestCart = JSON.parse(localStorage.getItem('guest_cart') || '[]');

        if (guestCart.length > 0) {
          const mergedCart = [...supabaseCart];
          guestCart.forEach(guestItem => {
            const existingIndex = mergedCart.findIndex(dbItem => dbItem.name === guestItem.name && dbItem.size === guestItem.size);
            if (existingIndex !== -1) {
              mergedCart[existingIndex].quantity += guestItem.quantity;
            } else {
              mergedCart.push(guestItem);
            }
          });
          setCartItems(mergedCart);
          localStorage.removeItem('guest_cart');
        } else {
          setCartItems(supabaseCart);
        }
      } else {
        const guestCart = JSON.parse(localStorage.getItem('guest_cart') || '[]');
        setCartItems(guestCart);
      }
      setLoading(false);
    };

    loadCart();
  }, [user]);

  // Guardar el carrito en localStorage o Supabase cada vez que cambie
  useEffect(() => {
    if (loading) return;

    if (user?.id) {
      // Usuario autenticado: Guardar en Supabase
      const saveToSupabase = async () => {
        const { error } = await supabase
          .from('carts')
          .upsert([{ user_uid: user.id, items: cartItems }], { onConflict: 'user_uid' });
        if (error) console.error('Error guardando carrito en Supabase:', error);
      };
      saveToSupabase();
    } else {
      // Usuario invitado: Guardar en localStorage
      localStorage.setItem('guest_cart', JSON.stringify(cartItems));
    }
  }, [cartItems, user, loading]);

  const value = { cartItems, setCartItems, loading };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};