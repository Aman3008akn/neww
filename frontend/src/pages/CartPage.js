import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import axios from 'axios';
import { Trash2, Plus, Minus } from 'lucide-react';
import { useAuth } from '../App';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const CartPage = () => {
  const { fetchCartCount } = useAuth();
  const [cart, setCart] = useState({ items: [] });
  const [products, setProducts] = useState({});
  const [loading, setLoading] = useState(true);
  const [couponCode, setCouponCode] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const cartResponse = await axios.get(`${API}/cart`);
      setCart(cartResponse.data);

      const productIds = cartResponse.data.items?.map(item => item.product_id) || [];
      const productPromises = productIds.map(id => axios.get(`${API}/products/${id}`));
      const productResponses = await Promise.all(productPromises);

      const productsMap = {};
      productResponses.forEach(response => {
        productsMap[response.data.id] = response.data;
      });
      setProducts(productsMap);
    } catch (error) {
      console.error('Failed to fetch cart');
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (productId, newQuantity) => {
    if (newQuantity < 1) return;

    try {
      await axios.put(`${API}/cart/${productId}`, null, {
        params: { quantity: newQuantity }
      });
      fetchCart();
      fetchCartCount();
      toast.success('Cart updated');
    } catch (error) {
      toast.error('Failed to update cart');
    }
  };

  const removeItem = async (productId) => {
    try {
      await axios.delete(`${API}/cart/${productId}`);
      fetchCart();
      fetchCartCount();
      toast.success('Item removed from cart');
    } catch (error) {
      toast.error('Failed to remove item');
    }
  };

  const calculateSubtotal = () => {
    return cart.items?.reduce((sum, item) => {
      const product = products[item.product_id];
      if (!product) return sum;
      const price = product.offer_price || product.price;
      return sum + (price * item.quantity);
    }, 0) || 0;
  };

  const applyCoupon = () => {
    if (couponCode.toLowerCase() === 'save10') {
      toast.success('Coupon applied! 10% discount');
    } else {
      toast.error('Invalid coupon code');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <p>Loading cart...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!cart.items || cart.items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 bg-gray-50 flex items-center justify-center">
          <div className="text-center" data-testid="empty-cart">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Your cart is empty</h2>
            <Link to="/products" className="btn-primary" data-testid="continue-shopping">
              Continue Shopping
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const subtotal = calculateSubtotal();
  const shipping = subtotal > 500 ? 0 : 50;
  const total = subtotal + shipping;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <div className="flex-1 bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-amber-900 mb-8" data-testid="cart-title">
            Shopping Cart
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cart.items.map((item) => {
                const product = products[item.product_id];
                if (!product) return null;

                return (
                  <div
                    key={item.product_id}
                    className="bg-white rounded-xl p-6 shadow-md flex flex-col sm:flex-row gap-6"
                    data-testid={`cart-item-${item.product_id}`}
                  >
                    <Link to={`/products/${product.id}`} className="w-32 h-32 flex-shrink-0">
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-full object-cover rounded-lg"
                        data-testid="cart-item-image"
                      />
                    </Link>

                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <Link
                          to={`/products/${product.id}`}
                          className="text-lg font-semibold text-gray-800 hover:text-amber-900"
                          data-testid="cart-item-name"
                        >
                          {product.name}
                        </Link>
                        <p className="text-gray-600 mt-1 text-sm">{product.category}</p>
                      </div>

                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                            className="p-2 border border-gray-300 rounded-lg hover:bg-gray-100"
                            data-testid="decrease-qty"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="font-medium" data-testid="item-quantity">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                            className="p-2 border border-gray-300 rounded-lg hover:bg-gray-100"
                            data-testid="increase-qty"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="flex items-center space-x-4">
                          <span className="text-xl font-bold text-amber-900" data-testid="item-price">
                            ₹{(product.offer_price || product.price) * item.quantity}
                          </span>
                          <button
                            onClick={() => removeItem(item.product_id)}
                            className="text-red-500 hover:text-red-700"
                            data-testid="remove-item"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl p-6 shadow-md sticky top-24">
                <h3 className="text-xl font-bold text-gray-800 mb-6">Order Summary</h3>

                {/* Coupon */}
                <div className="mb-6">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      placeholder="Coupon code"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-amber-900"
                      data-testid="coupon-input"
                    />
                    <button
                      onClick={applyCoupon}
                      className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900"
                      data-testid="apply-coupon"
                    >
                      Apply
                    </button>
                  </div>
                </div>

                {/* Price breakdown */}
                <div className="space-y-3 mb-6 border-t pt-4">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span data-testid="subtotal">₹{subtotal}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Shipping</span>
                    <span data-testid="shipping">{shipping === 0 ? 'FREE' : `₹${shipping}`}</span>
                  </div>
                  <div className="flex justify-between text-xl font-bold text-amber-900 border-t pt-3">
                    <span>Total</span>
                    <span data-testid="total">₹{total}</span>
                  </div>
                </div>

                <button
                  onClick={() => navigate('/checkout')}
                  className="w-full btn-primary"
                  data-testid="checkout-btn"
                >
                  Proceed to Checkout
                </button>

                <Link
                  to="/products"
                  className="block text-center text-sm text-gray-600 hover:text-amber-900 mt-4"
                  data-testid="continue-shopping-link"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default CartPage;
