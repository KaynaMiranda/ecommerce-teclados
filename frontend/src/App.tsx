import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Header } from './components/Header';
import { Home } from './pages/Home';
import { ProductDetail } from './pages/ProductDetail';
import { Cart } from './pages/Cart';
import { Checkout } from './pages/Checkout';
import { OrderSuccess } from './pages/OrderSuccess';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { ForgotPassword } from './pages/ForgotPassword';
import { ResetPassword } from './pages/ResetPassword';
import { MyOrders } from './pages/MyOrders';
import { MyProfile } from './pages/MyProfile';
import { AdminLayout } from './components/admin/AdminLayout';
import { AdminDashboard } from './pages/admin/Dashboard';
import { AdminProducts } from './pages/admin/Products';
import { AdminOrders } from './pages/admin/Orders';
import { AdminClients } from './pages/admin/Clients';
import { AdminFreight } from './pages/admin/Freight';
import { AdminTeam } from './pages/admin/Team';
import { AdminStock } from './pages/admin/Stock';
import { AdminDrivers } from './pages/admin/Drivers';
import { useAuthStore } from './store/authStore';

function App() {
  const initialize = useAuthStore((state) => state.initialize);

  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/produto/:slug" element={<ProductDetail />} />
            <Route path="/carrinho" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/pedido-confirmado" element={<OrderSuccess />} />
            <Route path="/login" element={<Login />} />
            <Route path="/cadastro" element={<Register />} />
            <Route path="/esqueci-senha" element={<ForgotPassword />} />
            <Route path="/redefinir-senha" element={<ResetPassword />} />
            <Route path="/meus-pedidos" element={<MyOrders />} />
            <Route path="/meu-perfil" element={<MyProfile />} />
            <Route
              path="/admin"
              element={
                <AdminLayout>
                  <AdminDashboard />
                </AdminLayout>
              }
            />
            <Route
              path="/admin/pedidos"
              element={
                <AdminLayout>
                  <AdminOrders />
                </AdminLayout>
              }
            />
            <Route
              path="/admin/produtos"
              element={
                <AdminLayout>
                  <AdminProducts />
                </AdminLayout>
              }
            />
            <Route
              path="/admin/clientes"
              element={
                <AdminLayout>
                  <AdminClients />
                </AdminLayout>
              }
            />
            <Route
              path="/admin/frete"
              element={
                <AdminLayout>
                  <AdminFreight />
                </AdminLayout>
              }
            />
            <Route
              path="/admin/equipe"
              element={
                <AdminLayout>
                  <AdminTeam />
                </AdminLayout>
              }
            />
            <Route
              path="/admin/entregadores"
              element={
                <AdminLayout>
                  <AdminDrivers />
                </AdminLayout>
              }
            />
            <Route
              path="/admin/estoque"
              element={
                <AdminLayout>
                  <AdminStock />
                </AdminLayout>
              }
            />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
