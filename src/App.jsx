import React from 'react';
import { Route, Routes} from 'react-router-dom';

import AppLayout from "./components/AppLayout";
import Login from "./pages/Login";
import Main from "./pages/Main";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";

function App() {

  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/main" element={<Main />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
      </Routes>
    </AppLayout>
  );
}

export default App;
