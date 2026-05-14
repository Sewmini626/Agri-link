
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Marketplace from './pages/Marketplace';
import Login from './pages/Login';
import Register from './pages/Register';
import SellerDashboard from './pages/SellerDashboard/SellerDashboard';
import Overview from './pages/SellerDashboard/components/Overview';
import Products from './pages/SellerDashboard/components/Products';
import SellerOrders from './pages/SellerDashboard/components/Orders';
import Reports from './pages/SellerDashboard/components/Reports';
import Orders from './pages/Orders';
import Saved from './pages/Saved';
import Profile from './pages/Profile';

import ProductDetails from './pages/ProductDetails';
import Checkout from './pages/Checkout';
import CartDrawer from './components/CartDrawer';
import { CartProvider } from './context/CartContext';
import { SavedProvider } from './context/SavedContext';

function App() {
  return (
    <CartProvider>
      <SavedProvider>
        <Router>
          <CartDrawer />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/marketplace" element={<Marketplace />} />
            <Route path="/product/:id" element={<ProductDetails />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/saved" element={<Saved />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/seller-dashboard" element={<SellerDashboard />}>
              <Route index element={<Overview />} />
              <Route path="products" element={<Products />} />
              <Route path="orders" element={<SellerOrders />} />
              <Route path="reports" element={<Reports />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </SavedProvider>
    </CartProvider>
  );
}

export default App;
