import { useEffect, useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import axios from 'axios';
import { useAuth } from '../App';
import { User, Package, Heart, MapPin } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AccountPage = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [wishlistProducts, setWishlistProducts] = useState([]);
  const [addresses, setAddresses] = useState([]);

  useEffect(() => {
    fetchOrders();
    fetchWishlist();
    fetchAddresses();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await axios.get(`${API}/orders`);
      setOrders(response.data);
    } catch (error) {
      console.error('Failed to fetch orders');
    }
  };

  const fetchWishlist = async () => {
    try {
      const response = await axios.get(`${API}/wishlist`);
      setWishlist(response.data.product_ids || []);

      const productPromises = response.data.product_ids?.map(id => axios.get(`${API}/products/${id}`)) || [];
      const productResponses = await Promise.all(productPromises);
      setWishlistProducts(productResponses.map(res => res.data));
    } catch (error) {
      console.error('Failed to fetch wishlist');
    }
  };

  const fetchAddresses = async () => {
    try {
      const response = await axios.get(`${API}/addresses`);
      setAddresses(response.data);
    } catch (error) {
      console.error('Failed to fetch addresses');
    }
  };

  const removeFromWishlist = async (productId) => {
    try {
      await axios.delete(`${API}/wishlist/${productId}`);
      fetchWishlist();
      toast.success('Removed from wishlist');
    } catch (error) {
      toast.error('Failed to remove from wishlist');
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <div className="flex-1 bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-amber-900 mb-8" data-testid="account-title">
            My Account
          </h1>

          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 mb-8">
              <TabsTrigger value="profile" data-testid="tab-profile">
                <User className="w-4 h-4 mr-2" />
                Profile
              </TabsTrigger>
              <TabsTrigger value="orders" data-testid="tab-orders">
                <Package className="w-4 h-4 mr-2" />
                Orders
              </TabsTrigger>
              <TabsTrigger value="wishlist" data-testid="tab-wishlist">
                <Heart className="w-4 h-4 mr-2" />
                Wishlist
              </TabsTrigger>
              <TabsTrigger value="addresses" data-testid="tab-addresses">
                <MapPin className="w-4 h-4 mr-2" />
                Addresses
              </TabsTrigger>
            </TabsList>

            {/* Profile */}
            <TabsContent value="profile">
              <div className="bg-white rounded-xl p-8 shadow-md" data-testid="profile-section">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Profile Information</h2>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Name</label>
                    <p className="text-lg text-gray-800" data-testid="user-name">{user?.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Email</label>
                    <p className="text-lg text-gray-800" data-testid="user-email">{user?.email}</p>
                  </div>
                  {user?.phone && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">Phone</label>
                      <p className="text-lg text-gray-800" data-testid="user-phone">{user?.phone}</p>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* Orders */}
            <TabsContent value="orders">
              <div className="bg-white rounded-xl p-8 shadow-md" data-testid="orders-section">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Order History</h2>
                {orders.length === 0 ? (
                  <div className="text-center py-12" data-testid="no-orders">
                    <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">No orders yet</p>
                    <Link to="/products" className="btn-primary">
                      Start Shopping
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <div
                        key={order.id}
                        className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                        data-testid={`order-${order.id}`}
                      >
                        <div className="flex flex-col sm:flex-row justify-between mb-4">
                          <div>
                            <p className="text-sm text-gray-600">Order ID</p>
                            <p className="font-semibold text-gray-800" data-testid="order-id">{order.id}</p>
                          </div>
                          <div className="mt-2 sm:mt-0">
                            <p className="text-sm text-gray-600">Date</p>
                            <p className="font-semibold text-gray-800">
                              {new Date(order.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="mt-2 sm:mt-0">
                            <p className="text-sm text-gray-600">Total</p>
                            <p className="font-semibold text-amber-900" data-testid="order-total">
                              ₹{order.total_amount}
                            </p>
                          </div>
                          <div className="mt-2 sm:mt-0">
                            <span
                              className="inline-block px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-800"
                              data-testid="order-status"
                            >
                              {order.order_status}
                            </span>
                          </div>
                        </div>
                        <div className="border-t pt-4">
                          <p className="text-sm text-gray-600 mb-2">Items:</p>
                          <div className="space-y-2">
                            {order.items.map((item, idx) => (
                              <div key={idx} className="flex justify-between text-sm" data-testid={`order-item-${idx}`}>
                                <span>{item.product_name} x {item.quantity}</span>
                                <span className="font-medium">₹{item.price * item.quantity}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Wishlist */}
            <TabsContent value="wishlist">
              <div className="bg-white rounded-xl p-8 shadow-md" data-testid="wishlist-section">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">My Wishlist</h2>
                {wishlistProducts.length === 0 ? (
                  <div className="text-center py-12" data-testid="empty-wishlist">
                    <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">Your wishlist is empty</p>
                    <Link to="/products" className="btn-primary">
                      Browse Products
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {wishlistProducts.map((product) => (
                      <div
                        key={product.id}
                        className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                        data-testid={`wishlist-item-${product.id}`}
                      >
                        <Link to={`/products/${product.id}`}>
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="w-full h-48 object-cover"
                          />
                        </Link>
                        <div className="p-4">
                          <Link to={`/products/${product.id}`}>
                            <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2 hover:text-amber-900">
                              {product.name}
                            </h3>
                          </Link>
                          <div className="flex items-center justify-between">
                            <span className="text-xl font-bold text-amber-900">
                              ₹{product.offer_price || product.price}
                            </span>
                            <button
                              onClick={() => removeFromWishlist(product.id)}
                              className="text-sm text-red-500 hover:underline"
                              data-testid={`remove-wishlist-${product.id}`}
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Addresses */}
            <TabsContent value="addresses">
              <div className="bg-white rounded-xl p-8 shadow-md" data-testid="addresses-section">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Saved Addresses</h2>
                {addresses.length === 0 ? (
                  <div className="text-center py-12" data-testid="no-addresses">
                    <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600">No addresses saved</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {addresses.map((address) => (
                      <div
                        key={address.id}
                        className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                        data-testid={`address-${address.id}`}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <MapPin className="w-5 h-5 text-amber-900 mt-1" />
                          {address.is_default && (
                            <span className="bg-amber-100 text-amber-900 text-xs px-2 py-1 rounded-full font-semibold">
                              Default
                            </span>
                          )}
                        </div>
                        <p className="font-semibold text-gray-800 mb-1">{address.name}</p>
                        <p className="text-sm text-gray-600 mb-1">{address.phone}</p>
                        <p className="text-sm text-gray-600">
                          {address.address_line1}, {address.address_line2 && `${address.address_line2}, `}
                          {address.city}, {address.state} - {address.pincode}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default AccountPage;
