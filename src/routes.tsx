// src/routes.tsx
import { createHashRouter } from "react-router-dom";
import App from "./App";

import HomePage from "./pages/Home";
import LoginPage from "./pages/LoginPage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import ShopPage from "./pages/ShopPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import WishlistPage from "./pages/WishlistPage";
import ProfilePage from "./pages/ProfilePage";
import OrdersPage from "./pages/OrdersPage";
import OrderDetailPage from "./pages/OrderDetailPage";
import OrderSuccessPage from "./pages/OrderSuccessPage";
import GoldPage from "./pages/GoldPage";
import ContactPage from "./pages/ContactPage";
import DiamondPage from "./pages/DiamondPage";
import AboutPage from "./pages/AboutPage";
import RegisterPage from "./pages/RegisterPage";
import ProcessPage from "./pages/ProcessPage";
import NotFoundPage from "./pages/NotFoundPage";

const router = createHashRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <HomePage /> },

      // Auth
      { path: "login", element: <LoginPage /> },

      // Registration
      { path: "register", element: <RegisterPage /> },

      // Process Page
      { path: "process", element: <ProcessPage /> },

      // Profile / My Account
      { path: "profile", element: <ProfilePage /> },

      // Cart
      { path: "cart", element: <CartPage /> },

      // Checkout
      { path: "checkout", element: <CheckoutPage /> },

      // Wishlist
      { path: "wishlist", element: <WishlistPage /> },

      // Products
      { path: "products", element: <ShopPage /> },
      { path: "products/:slug", element: <ProductDetailPage /> },

      // Gold info page
      { path: "gold", element: <GoldPage /> },

      // Diamond info page
      { path: "diamonds", element: <DiamondPage /> },

      // Orders
      { path: "orders", element: <OrdersPage /> },
      { path: "orders/:id", element: <OrderDetailPage /> },
      { path: "order-success/:id", element: <OrderSuccessPage /> },

      // Contact
      { path: "contact", element: <ContactPage /> },
      { path: "about", element: <AboutPage /> },

      // 404 Not Found
      { path: "*", element: <NotFoundPage /> },
    ],
  },
]);

export default router;
