import React, { createContext, useContext, useState } from 'react';

const WishlistContext = createContext();

export const useWishlist = () => useContext(WishlistContext);

export const WishlistProvider = ({ children }) => {
  const [wishlistVisible, setWishlistVisible] = useState(false);
  const [wishlistItems, setWishlistItems] = useState([]);

  return (
    <WishlistContext.Provider value={{
      wishlistVisible, setWishlistVisible,
      wishlistItems, setWishlistItems
    }}>
      {children}
    </WishlistContext.Provider>
  );
};