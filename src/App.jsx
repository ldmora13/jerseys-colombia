import React, {useState, useEffect} from 'react';
import { Route, Routes} from 'react-router-dom';
import { supabase } from './lib/supabaseClient';

import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';

import Cart from './components/Cart';
import Header from './components/Header';
import Wishlist from './components/Wishlist';

import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import Policies from './pages/Policies';
import Futbol from './pages/Futbol';
import NBA from './pages/NBA';
import F1 from './pages/F1';
import Product from './pages/Product';
import SearchResults from './pages/SearchResults';
import Checkout from './pages/Checkout';
import TransactionResult from './pages/TransactionResult';

function App() {

  const [user, setUser] = useState(null);
  const [cartVisible, setCartVisible] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => listener?.subscription?.unsubscribe();
  }, []);


  return (
    <CartProvider user={user}>
      <WishlistProvider>
        <Header setCartVisible={setCartVisible} />
        <Cart cartVisible={cartVisible} setCartVisible={setCartVisible} />
        <Wishlist />
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/policies" element={<Policies />} />
          <Route path='/futbol' element={<Futbol setCartVisible={setCartVisible} />} />
          <Route path='/NBA' element={<NBA setCartVisible={setCartVisible} />} />
          <Route path='/F1' element={<F1 setCartVisible={setCartVisible}  />} />
          <Route path='/:category/:name' element={<Product setCartVisible={setCartVisible} />} />
          <Route path="/searchs/:query" element={<SearchResults />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/checkout/success" element={<TransactionResult />} />
        </Routes>
      </WishlistProvider>
    </CartProvider>
  );
}

export default App;