import React, {useState, useEffect} from 'react';
import { Route, Routes} from 'react-router-dom';
import { supabase } from './lib/supabaseClient';

import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';

import Cart from './components/Cart';
import Header from './components/Header';
import Wishlist from './components/Wishlist';
import ScrollToTop from './components/ScrollToTop';

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

import Soporte from './pages/Soporte';
import Compras from './pages/Compras';
import Profile from './pages/Profile';
import About from './pages/About';

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
        <ScrollToTop />
        <Header setCartVisible={setCartVisible} />
        <Cart cartVisible={cartVisible} setCartVisible={setCartVisible} />
        <Wishlist />
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/politicas" element={<Policies />} />
          <Route path='/futbol' element={<Futbol setCartVisible={setCartVisible} />} />
          <Route path='/nba' element={<NBA setCartVisible={setCartVisible} />} />
          <Route path='/f1' element={<F1 setCartVisible={setCartVisible}  />} />
          <Route path='/:category/:name' element={<Product setCartVisible={setCartVisible} />} />
          <Route path="/searchs/:query" element={<SearchResults />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/checkout/success" element={<TransactionResult />} />
          <Route path="/soporte" element={<Soporte />} />
          <Route path="/compras" element={<Compras />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </WishlistProvider>
    </CartProvider>
  );
}

export default App;