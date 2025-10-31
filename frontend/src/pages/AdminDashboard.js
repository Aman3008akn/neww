import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Package, ShoppingBag, Users, TrendingUp, Plus, Edit, Trash2, LogOut } from 'lucide-react';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({ totalProducts: 0, totalOrders: 0, totalRevenue: 0 });
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: '',
    offer_price: '',
    category: 'skincare',
    concern: '',
    images: '',
    ingredients: '',
    how_to_use: ''
  });

  useEffect(() => {
    const adminToken = localStorage.getItem('admin_token');
    if (!adminToken) {
      navigate('/admin/login');
      return;
    }
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [productsRes, ordersRes] = await Promise.all([
        axios.get(`${API}/products`),
        axios.get(`${API}/admin/orders`).catch(() => ({ data: [] }))
      ]);
      
      setProducts(productsRes.data);
      setOrders(ordersRes.data);
      
      const revenue = ordersRes.data.reduce((sum, order) => sum + order.total_amount, 0);
      setStats({
        totalProducts: productsRes.data.length,
        totalOrders: ordersRes.data.length,
        totalRevenue: revenue
      });
    } catch (error) {
      console.error('Failed to fetch data');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    toast.success('Logged out');
    navigate('/admin/login');
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    try {
      const productData = {
        ...productForm,
        price: parseFloat(productForm.price),
        offer_price: productForm.offer_price ? parseFloat(productForm.offer_price) : null,
        images: productForm.images.split(',').map(img => img.trim())
      };

      if (editingProduct) {
        await axios.put(`${API}/admin/products/${editingProduct.id}`, productData);
        toast.success('Product updated');
      } else {
        await axios.post(`${API}/admin/products`, productData);
        toast.success('Product created');
      }
      
      setShowProductModal(false);
      setEditingProduct(null);
      setProductForm({
        name: '', description: '', price: '', offer_price: '', category: 'skincare',
        concern: '', images: '', ingredients: '', how_to_use: ''
      });
      fetchData();
    } catch (error) {
      toast.error('Failed to save product');
    }
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      offer_price: product.offer_price?.toString() || '',
      category: product.category,
      concern: product.concern || '',
      images: product.images.join(', '),
      ingredients: product.ingredients || '',
      how_to_use: product.how_to_use || ''
    });
    setShowProductModal(true);
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    
    try {
      await axios.delete(`${API}/admin/products/${productId}`);
      toast.success('Product deleted');
      fetchData();
    } catch (error) {
      toast.error('Failed to delete product');
    }
  };

  const handleUpdateOrderStatus = async (orderId, status) => {
    try {
      await axios.put(`${API}/admin/orders/${orderId}/status`, { status });
      toast.success('Order status updated');
      fetchData();
    } catch (error) {
      toast.error('Failed to update order');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-amber-900">Admin Dashboard</h1>
          <div className="flex items-center space-x-4">
            <Link to="/" className="text-gray-600 hover:text-amber-900" target="_blank">
              View Store
            </Link>
            <button onClick={handleLogout} className="flex items-center space-x-2 text-gray-600 hover:text-amber-900" data-testid="admin-logout">
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Products</p>
                <p className="text-3xl font-bold text-amber-900" data-testid="stat-products">{stats.totalProducts}</p>
              </div>
              <Package className="w-12 h-12 text-amber-900 opacity-20" />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Orders</p>
                <p className="text-3xl font-bold text-amber-900" data-testid="stat-orders">{stats.totalOrders}</p>
              </div>
              <ShoppingBag className="w-12 h-12 text-amber-900 opacity-20" />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Revenue</p>
                <p className="text-3xl font-bold text-amber-900" data-testid="stat-revenue">₹{stats.totalRevenue}</p>
              </div>
              <TrendingUp className="w-12 h-12 text-amber-900 opacity-20" />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="products" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
          </TabsList>

          {/* Products Tab */}
          <TabsContent value="products">
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Products</h2>
                <button
                  onClick={() => {
                    setEditingProduct(null);
                    setProductForm({
                      name: '', description: '', price: '', offer_price: '', category: 'skincare',
                      concern: '', images: '', ingredients: '', how_to_use: ''
                    });
                    setShowProductModal(true);
                  }}
                  className="btn-primary flex items-center space-x-2"
                  data-testid="add-product-btn"
                >
                  <Plus className="w-5 h-5" />
                  <span>Add Product</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-4">Image</th>
                      <th className="text-left p-4">Name</th>
                      <th className="text-left p-4">Category</th>
                      <th className="text-left p-4">Price</th>
                      <th className="text-left p-4">Stock</th>
                      <th className="text-left p-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product) => (
                      <tr key={product.id} className="border-b hover:bg-gray-50">
                        <td className="p-4">
                          <img src={product.images[0]} alt={product.name} className="w-16 h-16 object-cover rounded-lg" />
                        </td>
                        <td className="p-4 font-medium">{product.name}</td>
                        <td className="p-4 capitalize">{product.category}</td>
                        <td className="p-4">
                          {product.offer_price ? (
                            <>
                              <span className="font-bold">₹{product.offer_price}</span>
                              <span className="text-gray-400 line-through ml-2 text-sm">₹{product.price}</span>
                            </>
                          ) : (
                            <span className="font-bold">₹{product.price}</span>
                          )}
                        </td>
                        <td className="p-4">
                          <span className={`px-3 py-1 rounded-full text-sm ${product.in_stock ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {product.in_stock ? 'In Stock' : 'Out of Stock'}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex space-x-2">
                            <button onClick={() => handleEditProduct(product)} className="p-2 text-blue-600 hover:bg-blue-50 rounded" data-testid={`edit-product-${product.id}`}>
                              <Edit className="w-5 h-5" />
                            </button>
                            <button onClick={() => handleDeleteProduct(product.id)} className="p-2 text-red-600 hover:bg-red-50 rounded" data-testid={`delete-product-${product.id}`}>
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders">
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Orders</h2>
              
              {orders.length === 0 ? (
                <p className="text-gray-600 text-center py-8">No orders yet</p>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div key={order.id} className="border rounded-lg p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <p className="text-sm text-gray-600">Order ID</p>
                          <p className="font-semibold">{order.id}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Date</p>
                          <p className="font-semibold">{new Date(order.created_at).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Total</p>
                          <p className="font-semibold text-amber-900">₹{order.total_amount}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 mb-2">Status</p>
                          <select
                            value={order.order_status}
                            onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                            className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
                          >
                            <option value="placed">Placed</option>
                            <option value="processing">Processing</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </div>
                      </div>
                      
                      <div className="border-t pt-4">
                        <p className="text-sm font-semibold mb-2">Items:</p>
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex justify-between text-sm py-1">
                            <span>{item.product_name} x {item.quantity}</span>
                            <span>₹{item.price * item.quantity}</span>
                          </div>
                        ))}
                      </div>
                      
                      <div className="border-t pt-4 mt-4">
                        <p className="text-sm font-semibold mb-2">Shipping Address:</p>
                        <p className="text-sm text-gray-600">
                          {order.address.name}, {order.address.phone}<br/>
                          {order.address.address_line1}, {order.address.city}, {order.address.state} - {order.address.pincode}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Product Modal */}
      {showProductModal && (
        <Dialog open={showProductModal} onOpenChange={setShowProductModal}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingProduct ? 'Edit Product' : 'Add New Product'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSaveProduct} className="space-y-4">
              <input
                type="text"
                placeholder="Product Name"
                value={productForm.name}
                onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-amber-900"
                required
              />
              <textarea
                placeholder="Description"
                value={productForm.description}
                onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-amber-900"
                rows="3"
                required
              />
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="number"
                  placeholder="Price"
                  value={productForm.price}
                  onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-amber-900"
                  required
                />
                <input
                  type="number"
                  placeholder="Offer Price (Optional)"
                  value={productForm.offer_price}
                  onChange={(e) => setProductForm({ ...productForm, offer_price: e.target.value })}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-amber-900"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <select
                  value={productForm.category}
                  onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-amber-900"
                >
                  <option value="skincare">Skincare</option>
                  <option value="haircare">Haircare</option>
                  <option value="bodycare">Body Care</option>
                </select>
                <input
                  type="text"
                  placeholder="Concern (e.g., acne, hair_fall)"
                  value={productForm.concern}
                  onChange={(e) => setProductForm({ ...productForm, concern: e.target.value })}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-amber-900"
                />
              </div>
              <input
                type="text"
                placeholder="Image URLs (comma separated)"
                value={productForm.images}
                onChange={(e) => setProductForm({ ...productForm, images: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-amber-900"
                required
              />
              <textarea
                placeholder="Ingredients"
                value={productForm.ingredients}
                onChange={(e) => setProductForm({ ...productForm, ingredients: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-amber-900"
                rows="2"
              />
              <textarea
                placeholder="How to Use"
                value={productForm.how_to_use}
                onChange={(e) => setProductForm({ ...productForm, how_to_use: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-amber-900"
                rows="2"
              />
              <button type="submit" className="w-full btn-primary">
                {editingProduct ? 'Update Product' : 'Create Product'}
              </button>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default AdminDashboard;