import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

const WishlistContext = createContext();

export const useWishlist = () => useContext(WishlistContext);

export const WishlistProvider = ({ children }) => {
  const [wishlistVisible, setWishlistVisible] = useState(false);
  const [wishlistItems, setWishlistItems] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);

  useEffect(() => {
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      setLoading(false);
    };

    getInitialSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        const currentUser = session?.user ?? null;
        setUser(currentUser);
        setLoading(false);
        if (currentUser) {
          setInitialLoad(true);
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // 2. Cargar, fusionar y sincronizar la lista de deseos
  useEffect(() => {
    const syncWishlist = async () => {
      if (user) {
        // --- Usuario Autenticado ---
        setLoading(true);

        // A. Obtener la lista de la base de datos
        const { data: dbData } = await supabase
          .from('wishlist')
          .select('items')
          .eq('user_uid', user.id)
          .single();
        const dbItems = dbData?.items || [];

        // B. Obtener la lista local (si el usuario añadió algo como invitado)
        const localItems = JSON.parse(localStorage.getItem('wishlist') || '[]');

        // C. Fusionar ambas listas sin duplicados
        const mergedItems = [...new Set([...dbItems, ...localItems])];
        setWishlistItems(mergedItems);

        // D. Guardar la lista fusionada en la DB y limpiar la local
        if (localItems.length > 0) {
          await supabase
            .from('wishlist')
            .upsert({ user_uid: user.id, items: mergedItems }, { onConflict: 'user_uid' });
          localStorage.removeItem('wishlist');
        }
        
        setLoading(false);

      } else {
        // --- Usuario Invitado ---
        const localItems = JSON.parse(localStorage.getItem('wishlist') || '[]');
        setWishlistItems(localItems);
      }
      setInitialLoad(false);
    };

    if (!loading && initialLoad) {
      syncWishlist();
    }
  }, [user, loading, initialLoad]);

  // 3. Guardar cambios en la lista de deseos
  useEffect(() => {
    if (loading || initialLoad) return;

    const saveWishlist = async () => {
      if (user) {
        // Guardar en Supabase para usuarios autenticados
        const { error } = await supabase
          .from('wishlist')
          .upsert({ user_uid: user.id, items: wishlistItems }, { onConflict: 'user_uid' });
        if (error) console.error('Error guardando wishlist en DB:', error);
      } else {
        // Guardar en localStorage para invitados
        localStorage.setItem('wishlist', JSON.stringify(wishlistItems));
      }
    };

    saveWishlist();
  }, [wishlistItems, user, loading, initialLoad]);

  return (
    <WishlistContext.Provider value={{
      wishlistVisible, setWishlistVisible,
      wishlistItems, setWishlistItems, loading
    }}>
      {children}
    </WishlistContext.Provider>
  );
};