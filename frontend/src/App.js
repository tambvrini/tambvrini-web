import "@/App.css";
import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { AuthProvider } from "./contexts/AuthContext";
import { CartProvider } from "./contexts/CartContext";
import { WishlistProvider } from "./contexts/WishlistContext";
import { Toaster } from "./components/ui/sonner";
import { I18nProvider } from "./contexts/I18nContext";
import { GOOGLE_CLIENT_ID } from "./config/google";
import Header from "./components/Header";
import Footer from "./components/Footer";
import CartDrawer from "./components/CartDrawer";
import ScrollToTop from "./components/ScrollToTop";
import HomePage from "./pages/HomePage";
import ShopPage from "./pages/ShopPage";
import ProductPage from "./pages/ProductPage";
import CartPage from "./pages/CartPage";
import AccountPage from "./pages/AccountPage";
import WishlistPage from "./pages/WishlistPage";
import CheckoutSuccessPage from "./pages/CheckoutSuccessPage";
import BrandPage from "./pages/BrandPage";
import LimitedEditionsPage from "./pages/LimitedEditionsPage";

function AppRouter() {
  const location = useLocation();

  useEffect(() => {
    document.title = 'TAMBVRINI';
  }, [location.pathname]);

  const isHome = location.pathname === '/';

  return (
    <div>
      <ScrollToTop />
      <Header />
      <CartDrawer />
      <AnimatePresence mode="wait" initial={false}>
        <motion.main
          key={location.pathname}
          className="page-transition"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          <Routes location={location}>
            <Route path="/" element={<HomePage />} />
            <Route path="/tienda" element={<ShopPage />} />
            <Route path="/limited-editions" element={<LimitedEditionsPage />} />
            <Route path="/producto/:productId" element={<ProductPage />} />
            <Route path="/carrito" element={<CartPage />} />
            <Route path="/cuenta" element={<AccountPage />} />
            <Route path="/favoritos" element={<WishlistPage />} />
            <Route path="/checkout/success" element={<CheckoutSuccessPage />} />
            <Route path="/marca" element={<BrandPage />} />
          </Routes>
        </motion.main>
      </AnimatePresence>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <I18nProvider>
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <BrowserRouter>
                <AppRouter />
                <Toaster position="bottom-right" theme="light" />
              </BrowserRouter>
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </GoogleOAuthProvider>
    </I18nProvider>
  );
}

export default App;
