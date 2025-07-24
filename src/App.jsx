import React from 'react';
import { Route, Routes} from 'react-router-dom';

import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import Policies from './pages/Policies';
import Futbol from './pages/Futbol';
import NBA from './pages/NBA';
import F1 from './pages/F1';
import Searchs from './pages/Searchs';
import Cart from './components/Cart';

function App() {

  return (
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/policies" element={<Policies />} />
        <Route path='/futbol' element={<Futbol />} />
        <Route path='/nba' element={<NBA />} />
        <Route path='/f1' element={<F1 />} />
        <Route path='/searchs' element={<Searchs />} />
        <Route path='/cart' element={<Cart />} />
      </Routes>
  );
}

export default App;
