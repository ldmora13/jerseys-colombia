import React from 'react';
import { Route, Routes} from 'react-router-dom';

import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import Policies from './pages/Policies';
import Futbol from './pages/Futbol';
import NBA from './pages/NBA';
import F1 from './pages/F1';
import Product from './pages/Product';

function App() {

  return (
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/policies" element={<Policies />} />
        <Route path='/futbol' element={<Futbol />} />
        <Route path='/NBA' element={<NBA />} />
        <Route path='/F1' element={<F1 />} />
        <Route path='/:category/:name' element={<Product />} />
      </Routes>
  );
}

export default App;
