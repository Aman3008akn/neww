import { Link } from 'react-router-dom';
import { Facebook, Instagram, Youtube, Twitter } from 'lucide-react';
import { toast } from 'sonner';
import { useState } from 'react';

const Footer = () => {
  const [email, setEmail] = useState('');

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (email) {
      toast.success('Thank you for subscribing!');
      setEmail('');
    }
  };

  return (
    <footer className="bg-gradient-to-br from-amber-50 to-rose-50 pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* About */}
          <div>
            <h3 className="text-xl font-bold text-amber-900 mb-4">BellaHerbs</h3>
            <p className="text-gray-600 text-sm mb-4">
              Premium natural skincare, haircare, and wellness products. 100% natural, cruelty-free, and dermatologically tested.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-600 hover:text-amber-900 transition-colors" data-testid="social-facebook">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-600 hover:text-amber-900 transition-colors" data-testid="social-instagram">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-600 hover:text-amber-900 transition-colors" data-testid="social-youtube">
                <Youtube className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-600 hover:text-amber-900 transition-colors" data-testid="social-twitter">
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-gray-800 mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/about" className="text-gray-600 hover:text-amber-900 transition-colors">About Us</Link></li>
              <li><Link to="/contact" className="text-gray-600 hover:text-amber-900 transition-colors">Contact</Link></li>
              <li><Link to="/products" className="text-gray-600 hover:text-amber-900 transition-colors">Shop All</Link></li>
            </ul>
          </div>

          {/* Policies */}
          <div>
            <h4 className="font-semibold text-gray-800 mb-4">Policies</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/privacy" className="text-gray-600 hover:text-amber-900 transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="text-gray-600 hover:text-amber-900 transition-colors">Terms of Service</Link></li>
              <li><Link to="/refund" className="text-gray-600 hover:text-amber-900 transition-colors">Refund & Return</Link></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="font-semibold text-gray-800 mb-4">Newsletter</h4>
            <p className="text-sm text-gray-600 mb-4">Subscribe for exclusive offers and updates</p>
            <form onSubmit={handleNewsletterSubmit} className="flex flex-col space-y-2">
              <input
                type="email"
                placeholder="Your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:border-amber-900 text-sm"
                required
                data-testid="newsletter-input"
              />
              <button type="submit" className="btn-primary text-sm" data-testid="newsletter-submit">
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-gray-300 pt-8 text-center">
          <p className="text-sm text-gray-600">
            © 2025 BellaHerbs. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
