import "@/App.css";
import { useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { CartProvider } from "./contexts/CartContext";
import { WishlistProvider } from "./contexts/WishlistContext";
import { Toaster } from "./components/ui/sonner";
import { I18nProvider } from "./contexts/I18nContext";
import Header from "./components/Header";
import Footer from "./components/Footer";
import CartDrawer from "./components/CartDrawer";
import HomePage from "./pages/HomePage";
import ShopPage from "./pages/ShopPage";
import ProductPage from "./pages/ProductPage";
import CartPage from "./pages/CartPage";
import AccountPage from "./pages/AccountPage";
import WishlistPage from "./pages/WishlistPage";
import CheckoutSuccessPage from "./pages/CheckoutSuccessPage";
import AuthCallback from "./pages/AuthCallback";
import BrandPage from "./pages/BrandPage";

function AppRouter() {
  const location = useLocation();

  useEffect(() => {
    document.title = 'TAMBVRINI';
  }, [location.pathname]);

  // Check URL fragment for session_id (Google OAuth callback)
  if (location.hash?.includes('session_id=')) {
    return <AuthCallback />;
  }

  const isHome = location.pathname === '/';

  return (
    <div>
      <Header />
      <CartDrawer />
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/tienda" element={<ShopPage />} />
          <Route path="/producto/:productId" element={<ProductPage />} />
          <Route path="/carrito" element={<CartPage />} />
          <Route path="/cuenta" element={<AccountPage />} />
          <Route path="/favoritos" element={<WishlistPage />} />
          <Route path="/checkout/success" element={<CheckoutSuccessPage />} />
          <Route path="/marca" element={<BrandPage />} />
        </Routes>
      </main>
      <Footer bgColor={isHome ? '#FFFFFF' : undefined} />
    </div>
  );
}

function App() {
  return (
    <I18nProvider>
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
    </I18nProvider>
  );
}

export default App;
