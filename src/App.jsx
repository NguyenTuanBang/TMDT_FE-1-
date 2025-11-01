import Login from "./pages/Login";
import { Routes, Route } from "react-router-dom";
import Signup from "./pages/Signup";
import Authen from "./pages/Authen";
import Test from "./pages/Test";
import ForgotPassword from "./pages/ForgotPassword";
import MyAccount from "./pages/MyAccount";
import Profile from "./pages/Profile";
import Address from "./pages/Address";
import ChangePassword from "./pages/ChangePassword";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import SellerRegister from "./pages/SellerRegister";
import Cart from "./pages/Cart";
import ProductCreate from "./pages/ProductCreate";
// import Checkout from "./pages/Checkout";
// import Notification from "./pages/Notification";
import UserList from "./pages/UserList";
import PendingStores from "./pages/PendingStore";
import FormCreateProduct from "./components/FormCreateProduct";
import Admin from "./pages/Admin";
import OrderList from "./pages/OrderList";
import ProductList from "./pages/ProductList";
import StoreList from "./pages/StoreList";
import OrderSeller from "./pages/OrderSeller";
import Seller from "./pages/Seller";
import ProductSeller from "./pages/ProductSeller";
import StoreSeller from "./pages/StoreSeller";
import MyOrder from "./pages/MyOrder";
import NotFoundPage from "./pages/NotFoundPage";
import Order from "./pages/Order";
import ListProduct from "./pages/ListProduct";
import AdminDashboard from "./pages/AdminDashboard";
import SellerDashboard from "./pages/SellerDashboard";
import OrderSeller from "./pages/OrderSeller";

function App() {
  return (
    <Routes>
      <Route path="/myaccount" element={<MyAccount />}>
        <Route index element={<Profile />} />
        <Route path="profile" element={<Profile />} />
        <Route path="address" element={<Address />} />
        <Route path="change-password" element={<ChangePassword />} />
        <Route path="seller-register" element={<SellerRegister />} />
        <Route path="orders" element={<MyOrder />} />
      </Route>

      <Route path="/authen" element={<Authen />}>
        <Route index element={<Login />} />
        <Route path="login" element={<Login />} />
        <Route path="signup" element={<Signup />} />
        <Route path="forgot-password" element={<ForgotPassword />} />
      </Route>

      <Route path="/admin" element={<Admin />}>
        <Route index element={<AdminDashboard />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="users" element={<UserList />} />
        <Route path="orders" element={<OrderList />} />
        <Route path="products" element={<ProductList />} />
        <Route path="stores" element={<StoreList />} />
        <Route path="requests" element={<PendingStores />} />
        <Route path="stores/:storeId" element={<StoreSeller />} />
      </Route>

      <Route path="/seller" element={<Seller />}>
        <Route index element={<SellerDashboard />} />
        <Route path="products" element={<ProductSeller />} />
        <Route path="stores" element={<StoreSeller />} />
        <Route path="orders" element={<OrderSeller />} />
        <Route path="dashboard" element={<SellerDashboard />} />
      </Route>

      <Route path="/" element={<Products />} />
      <Route path="/products/:id" element={<ProductDetail />} />
      <Route path="/cart" element={<Cart />} />
      <Route path="/carts" element={<Cart />} />
      <Route path="*" element={<NotFoundPage />} />
      <Route path="/order" element={<Order />} /> 
      <Route path="/products" element={<ListProduct />} />
    </Routes>
  );
}

export default App;
