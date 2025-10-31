import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ProductCard from '../components/ProductCard';
import axios from 'axios';
import { SlidersHorizontal } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const ProductListPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: '',
    concern: '',
    search: '',
    sort: 'featured'
  });
  const [showFilters, setShowFilters] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const category = params.get('category') || '';
    const concern = params.get('concern') || '';
    const search = params.get('search') || '';

    setFilters(prev => ({ ...prev, category, concern, search }));
    fetchProducts({ category, concern, search });
  }, [location.search]);

  const fetchProducts = async (filterParams = filters) => {
    setLoading(true);
    try {
      const params = {};
      if (filterParams.category) params.category = filterParams.category;
      if (filterParams.concern) params.concern = filterParams.concern;
      if (filterParams.search) params.search = filterParams.search;

      const response = await axios.get(`${API}/products`, { params });
      let sortedProducts = response.data;

      if (filterParams.sort === 'price-low') {
        sortedProducts.sort((a, b) => (a.offer_price || a.price) - (b.offer_price || b.price));
      } else if (filterParams.sort === 'price-high') {
        sortedProducts.sort((a, b) => (b.offer_price || b.price) - (a.offer_price || a.price));
      } else if (filterParams.sort === 'rating') {
        sortedProducts.sort((a, b) => b.rating - a.rating);
      }

      setProducts(sortedProducts);
    } catch (error) {
      console.error('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const handleSortChange = (sort) => {
    setFilters(prev => ({ ...prev, sort }));
    fetchProducts({ ...filters, sort });
  };

  const clearFilters = () => {
    setFilters({ category: '', concern: '', search: '', sort: 'featured' });
    window.history.pushState({}, '', '/products');
    fetchProducts({ category: '', concern: '', search: '', sort: 'featured' });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <div className="flex-1 bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-amber-900" data-testid="page-title">
                {filters.category
                  ? filters.category.charAt(0).toUpperCase() + filters.category.slice(1)
                  : filters.search
                  ? `Search: ${filters.search}`
                  : 'All Products'}
              </h1>
              <p className="text-gray-600 mt-2" data-testid="product-count">{products.length} products found</p>
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="lg:hidden flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100"
                data-testid="toggle-filters"
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span>Filters</span>
              </button>

              <select
                value={filters.sort}
                onChange={(e) => handleSortChange(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-amber-900"
                data-testid="sort-select"
              >
                <option value="featured">Featured</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>
          </div>

          {/* Content */}
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Filters Sidebar */}
            <aside
              className={`lg:w-64 flex-shrink-0 ${
                showFilters ? 'block' : 'hidden lg:block'
              }`}
              data-testid="filters-sidebar"
            >
              <div className="bg-white rounded-xl p-6 shadow-md">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold text-gray-800">Filters</h3>
                  <button
                    onClick={clearFilters}
                    className="text-sm text-amber-900 hover:underline"
                    data-testid="clear-filters"
                  >
                    Clear All
                  </button>
                </div>

                {/* Category Filter */}
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-700 mb-3">Category</h4>
                  <div className="space-y-2">
                    {['skincare', 'haircare', 'bodycare'].map((cat) => (
                      <label key={cat} className="flex items-center cursor-pointer">
                        <input
                          type="radio"
                          name="category"
                          checked={filters.category === cat}
                          onChange={() => {
                            setFilters(prev => ({ ...prev, category: cat }));
                            fetchProducts({ ...filters, category: cat });
                          }}
                          className="mr-2"
                          data-testid={`filter-category-${cat}`}
                        />
                        <span className="text-sm text-gray-600 capitalize">{cat}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Concern Filter */}
                <div>
                  <h4 className="font-semibold text-gray-700 mb-3">Concern</h4>
                  <div className="space-y-2">
                    {['acne', 'dark_spots', 'dry_skin', 'hair_fall', 'dandruff', 'aging'].map((concern) => (
                      <label key={concern} className="flex items-center cursor-pointer">
                        <input
                          type="radio"
                          name="concern"
                          checked={filters.concern === concern}
                          onChange={() => {
                            setFilters(prev => ({ ...prev, concern }));
                            fetchProducts({ ...filters, concern });
                          }}
                          className="mr-2"
                          data-testid={`filter-concern-${concern}`}
                        />
                        <span className="text-sm text-gray-600 capitalize">{concern.replace('_', ' ')}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </aside>

            {/* Products Grid */}
            <div className="flex-1">
              {loading ? (
                <div className="text-center py-20">
                  <p className="text-gray-600">Loading products...</p>
                </div>
              ) : products.length === 0 ? (
                <div className="text-center py-20" data-testid="no-products">
                  <p className="text-gray-600 text-lg">No products found</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="products-grid">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ProductListPage;
