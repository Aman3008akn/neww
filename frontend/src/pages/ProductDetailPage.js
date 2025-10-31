import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ProductCard from '../components/ProductCard';
import axios from 'axios';
import { ShoppingCart, Heart, Star, ChevronLeft } from 'lucide-react';
import { useAuth } from '../App';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const ProductDetailPage = () => {
  const { id } = useParams();
  const { user, fetchCartCount } = useAuth();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [isWishlisted, setIsWishlisted] = useState(false);

  useEffect(() => {
    fetchProduct();
    window.scrollTo(0, 0);
  }, [id]);

  const fetchProduct = async () => {
    try {
      const response = await axios.get(`${API}/products/${id}`);
      setProduct(response.data);

      const relatedResponse = await axios.get(`${API}/products`, {
        params: { category: response.data.category }
      });
      setRelatedProducts(relatedResponse.data.filter(p => p.id !== id).slice(0, 4));
    } catch (error) {
      toast.error('Product not found');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!user) {
      toast.error('Please login to add items to cart');
      return;
    }

    try {
      await axios.post(`${API}/cart`, {
        product_id: product.id,
        quantity
      });
      fetchCartCount();
      toast.success('Added to cart!');
    } catch (error) {
      toast.error('Failed to add to cart');
    }
  };

  const handleBuyNow = async () => {
    if (!user) {
      toast.error('Please login to continue');
      return;
    }

    await handleAddToCart();
    window.location.href = '/checkout';
  };

  const handleWishlist = async () => {
    if (!user) {
      toast.error('Please login to add to wishlist');
      return;
    }

    try {
      if (isWishlisted) {
        await axios.delete(`${API}/wishlist/${product.id}`);
        setIsWishlisted(false);
        toast.success('Removed from wishlist');
      } else {
        await axios.post(`${API}/wishlist/${product.id}`);
        setIsWishlisted(true);
        toast.success('Added to wishlist');
      }
    } catch (error) {
      toast.error('Something went wrong');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <p>Loading...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <p>Product not found</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <div className="flex-1 bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          {/* Breadcrumb */}
          <Link
            to="/products"
            className="inline-flex items-center text-gray-600 hover:text-amber-900 mb-6"
            data-testid="back-link"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back to Products
          </Link>

          {/* Product Details */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
              {/* Product Image */}
              <div className="space-y-4">
                <div className="aspect-square rounded-xl overflow-hidden bg-gray-100">
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    data-testid="product-main-image"
                  />
                </div>
              </div>

              {/* Product Info */}
              <div className="space-y-6">
                <div>
                  <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-3" data-testid="product-title">
                    {product.name}
                  </h1>

                  <div className="flex items-center mb-4">
                    <div className="flex text-yellow-400 text-lg">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-5 h-5 ${i < Math.floor(product.rating) ? 'fill-yellow-400' : ''}`}
                        />
                      ))}
                    </div>
                    <span className="text-gray-600 ml-3" data-testid="rating-text">
                      {product.rating} ({product.review_count} reviews)
                    </span>
                  </div>

                  <p className="text-gray-600 mb-6" data-testid="product-description">
                    {product.description}
                  </p>
                </div>

                {/* Price */}
                <div className="border-t border-b py-4">
                  {product.offer_price ? (
                    <div className="flex items-center space-x-4">
                      <span className="text-4xl font-bold text-amber-900" data-testid="offer-price">
                        ₹{product.offer_price}
                      </span>
                      <span className="text-2xl text-gray-400 line-through" data-testid="original-price">
                        ₹{product.price}
                      </span>
                      <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold" data-testid="discount-badge">
                        {Math.round((1 - product.offer_price / product.price) * 100)}% OFF
                      </span>
                    </div>
                  ) : (
                    <span className="text-4xl font-bold text-amber-900" data-testid="price">₹{product.price}</span>
                  )}
                </div>

                {/* Quantity & Actions */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <label className="text-gray-700 font-medium">Quantity:</label>
                    <div className="flex items-center border border-gray-300 rounded-lg">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="px-4 py-2 hover:bg-gray-100"
                        data-testid="decrease-quantity"
                      >
                        -
                      </button>
                      <span className="px-6 py-2 border-x" data-testid="quantity-value">{quantity}</span>
                      <button
                        onClick={() => setQuantity(quantity + 1)}
                        className="px-4 py-2 hover:bg-gray-100"
                        data-testid="increase-quantity"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4">
                    <button
                      onClick={handleAddToCart}
                      className="flex-1 btn-primary flex items-center justify-center space-x-2"
                      data-testid="add-to-cart-btn"
                    >
                      <ShoppingCart className="w-5 h-5" />
                      <span>Add to Cart</span>
                    </button>
                    <button
                      onClick={handleBuyNow}
                      className="flex-1 btn-secondary"
                      data-testid="buy-now-btn"
                    >
                      Buy Now
                    </button>
                    <button
                      onClick={handleWishlist}
                      className="p-4 border-2 border-gray-300 rounded-full hover:border-amber-900 transition-colors"
                      data-testid="wishlist-btn"
                    >
                      <Heart className={`w-6 h-6 ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
                    </button>
                  </div>
                </div>

                {/* Stock Status */}
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${product.in_stock ? 'bg-green-500' : 'bg-red-500'}`} />
                  <span className="text-sm text-gray-600" data-testid="stock-status">
                    {product.in_stock ? 'In Stock' : 'Out of Stock'}
                  </span>
                </div>
              </div>
            </div>

            {/* Product Details Tabs */}
            <div className="border-t p-8">
              <Tabs defaultValue="ingredients" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="ingredients" data-testid="tab-ingredients">Key Ingredients</TabsTrigger>
                  <TabsTrigger value="usage" data-testid="tab-usage">How to Use</TabsTrigger>
                  <TabsTrigger value="description" data-testid="tab-description">Description</TabsTrigger>
                </TabsList>
                <TabsContent value="ingredients" className="mt-6" data-testid="ingredients-content">
                  <p className="text-gray-700">{product.ingredients || 'Natural ingredients sourced from around the world.'}</p>
                </TabsContent>
                <TabsContent value="usage" className="mt-6" data-testid="usage-content">
                  <p className="text-gray-700">{product.how_to_use || 'Follow the instructions on the product packaging.'}</p>
                </TabsContent>
                <TabsContent value="description" className="mt-6" data-testid="description-content">
                  <p className="text-gray-700">{product.description}</p>
                </TabsContent>
              </Tabs>
            </div>
          </div>

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <div data-testid="related-products-section">
              <h2 className="text-2xl sm:text-3xl font-bold text-amber-900 mb-8">Related Products</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {relatedProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ProductDetailPage;
