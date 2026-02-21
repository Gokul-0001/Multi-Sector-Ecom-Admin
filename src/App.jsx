import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Login     from './pages/Login';
import Dashboard from './pages/Dashboard';
import Products  from './pages/Products';
import Customers from './pages/Customers';
import Orders    from './pages/Orders';
import Drivers   from './pages/Drivers';
import Vehicles  from './pages/Vehicles';
import Coupons   from './pages/Coupons';
import Banners   from './pages/Banners';
import Reviews   from './pages/Reviews';
import Settings  from './pages/Settings';

const isAuthenticated = () => localStorage.getItem('isAuthenticated') === 'true';

const ProtectedRoute = ({ children }) => {
  if (!isAuthenticated()) return <Navigate to="/login" replace />;
  return children;
};

const AuthRoute = ({ children }) => {
  if (isAuthenticated()) return <Navigate to="/dashboard" replace />;
  return children;
};

const App = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/login"     element={<AuthRoute><Login /></AuthRoute>} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/products"  element={<ProtectedRoute><Products /></ProtectedRoute>} />
      <Route path="/customers" element={<ProtectedRoute><Customers /></ProtectedRoute>} />
      <Route path="/orders"    element={<ProtectedRoute><Orders /></ProtectedRoute>} />
      <Route path="/drivers"   element={<ProtectedRoute><Drivers /></ProtectedRoute>} />
      <Route path="/vehicles"  element={<ProtectedRoute><Vehicles /></ProtectedRoute>} />
      <Route path="/coupons"   element={<ProtectedRoute><Coupons /></ProtectedRoute>} />
      <Route path="/banners"   element={<ProtectedRoute><Banners /></ProtectedRoute>} />
      <Route path="/reviews"   element={<ProtectedRoute><Reviews /></ProtectedRoute>} />
      <Route path="/settings"  element={<ProtectedRoute><Settings /></ProtectedRoute>} />
      <Route path="/"          element={<Navigate to="/login" replace />} />
      <Route path="*"          element={<Navigate to="/login" replace />} />
    </Routes>
    <ToastContainer
      position="top-right"
      autoClose={3000}
      hideProgressBar={false}
      newestOnTop
      closeOnClick
      pauseOnHover
      theme="light"
    />
  </BrowserRouter>
);

export default App;
