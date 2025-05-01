import React from 'react';
import { Route, Routes} from 'react-router-dom';

import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import { Policies } from './pages/Policies';

function App() {

  return (
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/politicas" element={<Policies />} />
      </Routes>
  );
}

export default App;
