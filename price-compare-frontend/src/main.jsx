import React from "react";
import ReactDOM from "react-dom/client";
import Profile from "./pages/Profile";
import { BrowserRouter, Routes, Route } from "react-router-dom";


import Compare from "./pages/compare";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import History from "./pages/History";

import Wishlist from "./pages/wishlist";


import "./styles/cards.css";
import "./styles/compare.css";
import "./styles/main.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/compare" element={<Compare />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/profile" element={<Profile />} />
<Route path="/history" element={<History />} />
<Route path="/wishlist" element={<Wishlist />} />


       
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
