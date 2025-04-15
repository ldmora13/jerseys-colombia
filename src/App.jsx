import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import Login from "./pages/Login";
import Main from "./pages/Main";
import Register from "./pages/Register"

function App() {
  return (
    <Routes>
    <Route path="/" element={<Login/>} />
    <Route path="/login" element={<Login/>} />
    <Route path='/main' element={<Main/>} />
    <Route path='/register' element={<Register/>} />
  </Routes>
  )
}

export default App
