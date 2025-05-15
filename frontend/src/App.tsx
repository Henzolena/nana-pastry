import { Routes, Route } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { Toaster } from 'sonner'

// Layout components
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import Disclaimer from '@/components/layout/Disclaimer'

// Pages
import Home from '@/pages/Home'
import About from '@/pages/About'
import Products from '@/pages/Products'
import CakesPage from '@/pages/CakesPage'; // Import CakesPage
import CakeDetailPage from '@/pages/CakeDetailPage'; // Import CakeDetailPage
import Contact from '@/pages/Contact'
import RequestCustomDesign from '@/pages/RequestCustomDesign'
import Cart from '@/pages/Cart'
import Checkout from '@/pages/Checkout'
import CakeCustomizationPage from '@/pages/CakeCustomizationPage'
import Auth from '@/pages/Auth'
import Account from '@/pages/Account'
import OrderDetail from '@/pages/OrderDetail'
import ProductDetail from '@/pages/ProductDetail'
import EmailVerificationRequired from '@/pages/EmailVerificationRequired'; // Import the new page
import AdminPortal from '@/pages/AdminPortal'; // Import AdminPortal page

// Context Providers
import { CartProvider } from '@/contexts/CartContext'
import { AuthProvider } from '@/contexts/AuthContext'

// Components
import MiniCart from '@/components/cart/MiniCart';
import ProtectedRoute from '@/components/auth/ProtectedRoute'; // Import ProtectedRoute
import PublicRoute from '@/components/auth/PublicRoute'; // Import PublicRoute
import BakerPortal from '@/pages/BakerPortal'; // Import BakerPortal page
import RoleBasedRedirect from '@/components/auth/RoleBasedRedirect'; // Import RoleBasedRedirect
import UserList from '@/components/admin/UserList'; // Import UserList
import UserEditForm from '@/components/admin/UserEditForm'; // Import UserEditForm
import UserCreateForm from '@/components/admin/UserCreateForm'; // Import UserCreateForm
import AdminProfileSettings from '@/components/admin/AdminProfileSettings'; // Import AdminProfileSettings
import AvailableOrders from '@/components/baker/AvailableOrders'; // Import AvailableOrders
import MyActiveOrders from '@/components/baker/MyActiveOrders'; // Import MyActiveOrders
import OrderHistory from '@/components/baker/OrderHistory'; // Import OrderHistory
import BakerProfileSettings from '@/components/baker/BakerProfileSettings'; // Import BakerProfileSettings
import MyCakesList from '@/components/baker/MyCakesList'; // Import MyCakesList
import CakeForm from '@/components/baker/CakeForm'; // Import CakeForm
import BakerOrderManagement from '@/components/baker/BakerOrderManagement'; // Import BakerOrderManagement


function App() {
  return (
    <AuthProvider>
      <CartProvider>
        {/* Toast Notifications */}
        <Toaster position="top-right" richColors closeButton />
        <RoleBasedRedirect /> {/* Add RoleBasedRedirect here */}
        
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <Disclaimer />
          {/* Add top padding to main to account for fixed Navbar height */}
          <main className="flex-grow pt-36 md:pt-40"> {/* Adjust pt-36 or pt-40 as needed */}
            <AnimatePresence mode="wait">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
                {/* Existing /products route, assuming it's for general products or to be refactored */}
                <Route path="/products" element={<Products />} /> 
                <Route path="/products/:cakeId" element={<ProductDetail />} />
                {/* New /cakes routes */}
                <Route path="/cakes" element={<CakesPage />} />
                <Route path="/cakes/:cakeId" element={<CakeDetailPage />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/request-custom-design" element={<RequestCustomDesign />} />
                <Route path="/cart" element={<PublicRoute><Cart /></PublicRoute>} />
                <Route path="/checkout" element={<PublicRoute><Checkout /></PublicRoute>} />
                <Route path="/checkout/customize" element={<PublicRoute><CakeCustomizationPage /></PublicRoute>} />
                <Route path="/products/customize/:cakeId" element={<PublicRoute><CakeCustomizationPage /></PublicRoute>} />
                <Route path="/cart/customize/:cartItemIndex" element={<PublicRoute><CakeCustomizationPage /></PublicRoute>} />
                <Route path="/auth" element={<Auth />} />
                {/* Protected Account and Profile Routes */}
                <Route
                  path="/account"
                  element={
                    <ProtectedRoute>
                      <Account />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <Account />
                    </ProtectedRoute>
                  }
                />
                <Route path="/orders/:orderId" element={<PublicRoute><OrderDetail /></PublicRoute>} />

                {/* Baker Portal Route - Protected */}
                <Route 
                  path="/baker-portal" 
                  element={
                    <ProtectedRoute requiredRole="baker">
                      <BakerPortal />
                    </ProtectedRoute>
                  } 
                >
                  {/* Child routes for Baker Portal */}
                  <Route path="available-orders" element={<AvailableOrders />} />
                  <Route path="my-active-orders" element={<MyActiveOrders />} />
                  <Route path="order-history" element={<OrderHistory />} />
                  <Route path="profile-availability" element={<BakerProfileSettings />} />
                  <Route path="manage-my-cakes" element={<MyCakesList />} />
                  <Route path="manage-my-cakes/new" element={<CakeForm />} /> {/* Route for adding new cake */}
                  <Route path="manage-my-cakes/edit/:cakeId" element={<CakeForm />} /> {/* Route for editing cake */}
                  <Route path="order/:orderId" element={<BakerOrderManagement />} /> {/* Route for order management */}
                </Route>
                {/* Route for Email Verification Required page */}
                <Route path="/email-verification-required" element={<EmailVerificationRequired />} />

                {/* Admin Portal Route - Protected */}
                <Route
                  path="/admin-portal"
                  element={
                    <ProtectedRoute requiredRole="admin">
                      <AdminPortal />
                    </ProtectedRoute>
                  }
                >
                  {/* Child route for User Management */}
                  <Route path="user-management" element={<UserList />} />
                  <Route path="users/create" element={<UserCreateForm />} />
                  <Route path="users/:userId/edit" element={<UserEditForm />} />
                  <Route path="profile-settings" element={<AdminProfileSettings />} /> {/* Route for Admin Profile/Settings */}
                </Route>
              </Routes>
            </AnimatePresence>
          </main>
          <Footer />
          <MiniCart />
        </div>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
