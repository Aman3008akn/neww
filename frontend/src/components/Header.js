import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, Search, Menu, X, Heart } from 'lucide-react';
import { useAuth } from '../App';
import AuthModal from './AuthModal';
import { toast } from 'sonner';

const Header = () => {
  const { user, logout, cartCount } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${searchQuery}`);
      setSearchQuery('');
    }
  };

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/');
  };

  return (
    <>
      <header className="sticky top-0 z-50 bg-white shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center" data-testid="logo-link">
              <h1 className="text-2xl sm:text-3xl font-bold text-amber-900">BellaHerbs</h1>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-8">
              <Link to="/products?category=skincare" className="text-gray-700 hover:text-amber-900 font-medium transition-colors" data-testid="nav-skincare">Skin Care</Link>
              <Link to="/products?category=haircare" className="text-gray-700 hover:text-amber-900 font-medium transition-colors" data-testid="nav-haircare">Hair Care</Link>
              <Link to="/products?category=bodycare" className="text-gray-700 hover:text-amber-900 font-medium transition-colors" data-testid="nav-bodycare">Body Care</Link>
              <Link to="/products" className="text-gray-700 hover:text-amber-900 font-medium transition-colors" data-testid="nav-all-products">All Products</Link>
            </nav>

            {/* Search Bar - Desktop */}
            <form onSubmit={handleSearch} className="hidden md:flex items-center flex-1 max-w-md mx-8">
              <div className="relative w-full">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-full focus:outline-none focus:border-amber-900"
                  data-testid="search-input"
                />
                <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2" data-testid="search-button">
                  <Search className="w-5 h-5 text-gray-400" />
                </button>
              </div>
            </form>

            {/* Icons */}
            <div className="flex items-center space-x-4">
              {user ? (
                <div className="hidden md:flex items-center space-x-4">
                  <Link to="/account" className="text-gray-700 hover:text-amber-900 transition-colors" data-testid="account-link">
                    <User className="w-6 h-6" />
                  </Link>
                  <button onClick={handleLogout} className="text-sm text-gray-600 hover:text-amber-900" data-testid="logout-button">
                    Logout
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="hidden md:flex items-center space-x-1 text-gray-700 hover:text-amber-900 transition-colors"
                  data-testid="login-button"
                >
                  <User className="w-6 h-6" />
                  <span className="text-sm">Login</span>
                </button>
              )}

              <Link to="/cart" className="relative" data-testid="cart-link">
                <ShoppingCart className="w-6 h-6 text-gray-700 hover:text-amber-900 transition-colors" />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-amber-900 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center" data-testid="cart-count">
                    {cartCount}
                  </span>
                )}
              </Link>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden text-gray-700"
                data-testid="mobile-menu-button"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="lg:hidden py-4 border-t" data-testid="mobile-menu">
              <form onSubmit={handleSearch} className="mb-4">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-full focus:outline-none focus:border-amber-900"
                    data-testid="mobile-search-input"
                  />
                  <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2">
                    <Search className="w-5 h-5 text-gray-400" />
                  </button>
                </div>
              </form>
              <nav className="flex flex-col space-y-3">
                <Link to="/products?category=skincare" className="text-gray-700 hover:text-amber-900 font-medium" onClick={() => setMobileMenuOpen(false)}>Skin Care</Link>
                <Link to="/products?category=haircare" className="text-gray-700 hover:text-amber-900 font-medium" onClick={() => setMobileMenuOpen(false)}>Hair Care</Link>
                <Link to="/products?category=bodycare" className="text-gray-700 hover:text-amber-900 font-medium" onClick={() => setMobileMenuOpen(false)}>Body Care</Link>
                <Link to="/products" className="text-gray-700 hover:text-amber-900 font-medium" onClick={() => setMobileMenuOpen(false)}>All Products</Link>
                {user ? (
                  <>
                    <Link to="/account" className="text-gray-700 hover:text-amber-900 font-medium" onClick={() => setMobileMenuOpen(false)}>My Account</Link>
                    <button onClick={() => { handleLogout(); setMobileMenuOpen(false); }} className="text-left text-gray-700 hover:text-amber-900 font-medium">Logout</button>
                  </>
                ) : (
                  <button onClick={() => { setShowAuthModal(true); setMobileMenuOpen(false); }} className="text-left text-gray-700 hover:text-amber-900 font-medium">Login / Register</button>
                )}
              </nav>
            </div>
          )}
        </div>
      </header>

      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
    </>
  );
};

export default Header;
