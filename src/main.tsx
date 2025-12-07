// main.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css"; // Tailwind CSS loaded here
import LuxuryToaster from "./components/ui/LuxuryToaster";
import { RouterProvider } from "react-router-dom";
import router from "./routes"; // your router file

import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AuthProvider>
      <CartProvider>
        <RouterProvider router={router} />
        <LuxuryToaster />
      </CartProvider>
    </AuthProvider>
  </React.StrictMode>
);