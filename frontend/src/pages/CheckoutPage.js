import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import axios from 'axios';
import { useAuth } from '../App';
import { toast } from 'sonner';
import { MapPin, Plus } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const CheckoutPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [cart, setCart] = useState({ items: [] });
  const [products, setProducts] = useState({});
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('online');
  const [loading, setLoading] = useState(false);
  const [addressForm, setAddressForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    pincode: '',
    is_default: false
  });

  useEffect(() => {
    fetchCart();
    fetchAddresses();
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
    }
  };

  const fetchAddresses = async () => {
    try {
      const response = await axios.get(`${API}/addresses`);
      setAddresses(response.data);
      if (response.data.length > 0) {
        setSelectedAddress(response.data[0]);
      }
    } catch (error) {
      console.error('Failed to fetch addresses');
    }
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API}/addresses`, addressForm);
      setAddresses([...addresses, response.data]);
      setSelectedAddress(response.data);
      setShowAddressForm(false);
      toast.success('Address added');
    } catch (error) {
      toast.error('Failed to add address');
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

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      toast.error('Please select a delivery address');
      return;
    }

    setLoading(true);
    try {
      const orderItems = cart.items.map(item => ({
        product_id: item.product_id,
        product_name: products[item.product_id]?.name,
        quantity: item.quantity,
        price: products[item.product_id]?.offer_price || products[item.product_id]?.price
      }));

      const response = await axios.post(`${API}/orders`, {
        items: orderItems,
        total_amount: total,
        address: selectedAddress,
        payment_method: paymentMethod
      });

      toast.success('Order placed successfully!');
      navigate(`/order-success/${response.data.order_id}`);
    } catch (error) {
      toast.error('Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  const subtotal = calculateSubtotal();
  const shipping = subtotal > 500 ? 0 : 50;
  const total = subtotal + shipping;

  if (!cart.items || cart.items.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <div className="flex-1 bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-amber-900 mb-8" data-testid="checkout-title">
            Checkout
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Checkout Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Delivery Address */}
              <div className="bg-white rounded-xl p-6 shadow-md">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-gray-800">Delivery Address</h2>
                  <button
                    onClick={() => setShowAddressForm(!showAddressForm)}
                    className="flex items-center space-x-2 text-amber-900 hover:underline"
                    data-testid="add-address-btn"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add New</span>
                  </button>
                </div>

                {showAddressForm ? (
                  <form onSubmit={handleAddAddress} className="space-y-4" data-testid="address-form">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <input
                        type="text"
                        placeholder="Full Name"
                        value={addressForm.name}
                        onChange={(e) => setAddressForm({ ...addressForm, name: e.target.value })}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-amber-900"
                        required
                        data-testid="address-name"
                      />
                      <input
                        type="tel"
                        placeholder="Phone"
                        value={addressForm.phone}
                        onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-amber-900"
                        required
                        data-testid="address-phone"
                      />
                    </div>
                    <input
                      type="text"
                      placeholder="Address Line 1"
                      value={addressForm.address_line1}
                      onChange={(e) => setAddressForm({ ...addressForm, address_line1: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-amber-900"
                      required
                      data-testid="address-line1"
                    />
                    <input
                      type="text"
                      placeholder="Address Line 2 (Optional)"
                      value={addressForm.address_line2}
                      onChange={(e) => setAddressForm({ ...addressForm, address_line2: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-amber-900"
                      data-testid="address-line2"
                    />
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <input
                        type="text"
                        placeholder="City"
                        value={addressForm.city}
                        onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-amber-900"
                        required
                        data-testid="address-city"
                      />
                      <input
                        type="text"
                        placeholder="State"
                        value={addressForm.state}
                        onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-amber-900"
                        required
                        data-testid="address-state"
                      />
                      <input
                        type="text"
                        placeholder="Pincode"
                        value={addressForm.pincode}
                        onChange={(e) => setAddressForm({ ...addressForm, pincode: e.target.value })}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-amber-900"
                        required
                        data-testid="address-pincode"
                      />
                    </div>
                    <button type="submit" className="btn-primary" data-testid="save-address-btn">
                      Save Address
                    </button>
                  </form>
                ) : (
                  <div className="space-y-3">
                    {addresses.length === 0 ? (
                      <p className="text-gray-600" data-testid="no-addresses">No addresses saved. Please add one.</p>
                    ) : (
                      addresses.map((address) => (
                        <label
                          key={address.id}
                          className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                            selectedAddress?.id === address.id
                              ? 'border-amber-900 bg-amber-50'
                              : 'border-gray-300 hover:border-amber-900'
                          }`}
                          data-testid={`address-option-${address.id}`}
                        >
                          <input
                            type="radio"
                            name="address"
                            checked={selectedAddress?.id === address.id}
                            onChange={() => setSelectedAddress(address)}
                            className="mt-1 mr-3"
                          />
                          <div>
                            <p className="font-semibold text-gray-800">{address.name}</p>
                            <p className="text-sm text-gray-600">{address.phone}</p>
                            <p className="text-sm text-gray-600 mt-1">
                              {address.address_line1}, {address.address_line2 && `${address.address_line2}, `}
                              {address.city}, {address.state} - {address.pincode}
                            </p>
                          </div>
                        </label>
                      ))
                    )}
                  </div>
                )}
              </div>

              {/* Payment Method */}
              <div className="bg-white rounded-xl p-6 shadow-md">
                <h2 className="text-xl font-bold text-gray-800 mb-6">Payment Method</h2>
                <div className="space-y-3">
                  <label
                    className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                      paymentMethod === 'online' ? 'border-amber-900 bg-amber-50' : 'border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value="online"
                      checked={paymentMethod === 'online'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="mr-3"
                      data-testid="payment-online"
                    />
                    <div>
                      <p className="font-semibold text-gray-800">Online Payment</p>
                      <p className="text-sm text-gray-600">Pay via UPI, Card, Net Banking</p>
                    </div>
                  </label>
                  <label
                    className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                      paymentMethod === 'cod' ? 'border-amber-900 bg-amber-50' : 'border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value="cod"
                      checked={paymentMethod === 'cod'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="mr-3"
                      data-testid="payment-cod"
                    />
                    <div>
                      <p className="font-semibold text-gray-800">Cash on Delivery</p>
                      <p className="text-sm text-gray-600">Pay when you receive</p>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl p-6 shadow-md sticky top-24">
                <h3 className="text-xl font-bold text-gray-800 mb-6">Order Summary</h3>

                {/* Items */}
                <div className="space-y-3 mb-6 max-h-60 overflow-y-auto">
                  {cart.items.map((item) => {
                    const product = products[item.product_id];
                    if (!product) return null;
                    return (
                      <div key={item.product_id} className="flex justify-between text-sm" data-testid={`summary-item-${item.product_id}`}>
                        <span className="text-gray-600">
                          {product.name} x {item.quantity}
                        </span>
                        <span className="font-semibold">
                          ₹{(product.offer_price || product.price) * item.quantity}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Price breakdown */}
                <div className="space-y-3 mb-6 border-t pt-4">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span data-testid="summary-subtotal">₹{subtotal}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Shipping</span>
                    <span data-testid="summary-shipping">{shipping === 0 ? 'FREE' : `₹${shipping}`}</span>
                  </div>
                  <div className="flex justify-between text-xl font-bold text-amber-900 border-t pt-3">
                    <span>Total</span>
                    <span data-testid="summary-total">₹{total}</span>
                  </div>
                </div>

                <button
                  onClick={handlePlaceOrder}
                  disabled={loading || !selectedAddress}
                  className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  data-testid="place-order-btn"
                >
                  {loading ? 'Placing Order...' : 'Place Order'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default CheckoutPage;
