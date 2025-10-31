import { Link } from 'react-router-dom';
import { ShoppingCart, Heart } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../App';
import { toast } from 'sonner';
import { useState } from 'react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const ProductCard = ({ product }) => {
  const { user, fetchCartCount } = useAuth();
  const [isWishlisted, setIsWishlisted] = useState(false);

  const handleAddToCart = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please login to add items to cart');
      return;
    }

    try {
      await axios.post(`${API}/cart`, {
        product_id: product.id,
        quantity: 1
      });
      fetchCartCount();
      toast.success('Added to cart!');
    } catch (error) {
      toast.error('Failed to add to cart');
    }
  };

  const handleWishlist = async (e) => {
    e.preventDefault();
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

  return (
    <Link to={`/products/${product.id}`} className="product-card bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl" data-testid={`product-card-${product.id}`}>
      <div className="relative">
        <img
          src={product.images[0]}
          alt={product.name}
          className="w-full h-64 object-cover"
          data-testid="product-image"
        />
        {product.offer_price && (
          <span className="absolute top-3 left-3 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-semibold" data-testid="discount-badge">
            {Math.round((1 - product.offer_price / product.price) * 100)}% OFF
          </span>
        )}
        <button
          onClick={handleWishlist}
          className="absolute top-3 right-3 bg-white p-2 rounded-full shadow-md hover:bg-gray-100 transition-colors"
          data-testid="wishlist-button"
        >
          <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
        </button>
      </div>

      <div className="p-5">
        <h3 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-2" data-testid="product-name">
          {product.name}
        </h3>
        
        <div className="flex items-center mb-3">
          <div className="flex text-yellow-400 text-sm">
            {'★'.repeat(Math.floor(product.rating))}
          </div>
          <span className="text-xs text-gray-500 ml-2" data-testid="review-count">({product.review_count})</span>
        </div>

        <div className="flex items-center justify-between mb-4">
          <div>
            {product.offer_price ? (
              <>
                <span className="text-xl font-bold text-amber-900" data-testid="offer-price">₹{product.offer_price}</span>
                <span className="text-sm text-gray-400 line-through ml-2" data-testid="original-price">₹{product.price}</span>
              </>
            ) : (
              <span className="text-xl font-bold text-amber-900" data-testid="price">₹{product.price}</span>
            )}
          </div>
        </div>

        <button
          onClick={handleAddToCart}
          className="w-full btn-primary flex items-center justify-center space-x-2"
          data-testid="add-to-cart-button"
        >
          <ShoppingCart className="w-4 h-4" />
          <span>Add to Cart</span>
        </button>
      </div>
    </Link>
  );
};

export default ProductCard;
