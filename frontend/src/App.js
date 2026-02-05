import "@/App.css";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { CartProvider } from "./contexts/CartContext";
import { WishlistProvider } from "./contexts/WishlistContext";
import { Toaster } from "./components/ui/sonner";
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

  // Check URL fragment for session_id (Google OAuth callback)
  if (location.hash?.includes('session_id=')) {
    return <AuthCallback />;
  }

  return (
    <div className="noise-overlay">
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
      <Footer />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
          <BrowserRouter>
            <AppRouter />
            <Toaster position="bottom-right" theme="dark" />
          </BrowserRouter>
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
