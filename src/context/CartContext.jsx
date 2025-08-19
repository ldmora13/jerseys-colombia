import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children, user }) => {
  const [cartItems, setCartItems] = useState([]);

  useEffect(() => {
    if (user?.id) {
      (async () => {
        const { data, error } = await supabase
          .from('carts')
          .select('items')
          .eq('user_uid', user.id)
          .single();
        if (data && data.items) setCartItems(data.items);
      })();
    }
  }, [user]);

  useEffect(() => {
    if (user?.id) {
      supabase
        .from('carts')
        .upsert([{ user_id: user.id, items: cartItems }], { onConflict: ['user_uid'] });
    }
  }, [cartItems, user]);

  return (
    <CartContext.Provider value={{ cartItems, setCartItems }}>
      {children}
    </CartContext.Provider>
  );
};