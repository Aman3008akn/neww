import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ProductCard from '../components/ProductCard';
import axios from 'axios';
import { ChevronRight, Star, Shield, Leaf, Heart } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const HomePage = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);

  const heroSlides = [
    {
      image: 'https://images.unsplash.com/photo-1526947425960-945c6e72858f',
      title: 'Natural Beauty',
      subtitle: '100% Pure & Organic Products',
      cta: 'Shop Now'
    },
    {
      image: 'https://images.unsplash.com/photo-1746904305806-a9ce08b33dc2',
      title: 'Skincare Essentials',
      subtitle: 'Dermatologically Tested',
      cta: 'Explore'
    },
    {
      image: 'https://images.pexels.com/photos/7852866/pexels-photo-7852866.jpeg',
      title: 'Wellness Redefined',
      subtitle: 'Cruelty-Free & Sustainable',
      cta: 'Discover'
    }
  ];

  const categories = [
    { name: 'Skin Care', image: 'https://images.unsplash.com/photo-1613803745799-ba6c10aace85', link: '/products?category=skincare' },
    { name: 'Hair Care', image: 'https://images.unsplash.com/photo-1647920155220-538f9bf35586', link: '/products?category=haircare' },
    { name: 'Body Care', image: 'https://images.unsplash.com/photo-1610551745215-1a4b5f36de8f', link: '/products?category=bodycare' }
  ];

  const concerns = [
    { name: 'Acne', concern: 'acne' },
    { name: 'Dark Spots', concern: 'dark_spots' },
    { name: 'Dry Skin', concern: 'dry_skin' },
    { name: 'Hair Fall', concern: 'hair_fall' },
    { name: 'Dandruff', concern: 'dandruff' },
    { name: 'Aging', concern: 'aging' }
  ];

  const whyChooseUs = [
    { icon: Leaf, title: '100% Natural', description: 'Pure natural ingredients' },
    { icon: Shield, title: 'Dermatologically Tested', description: 'Safe for all skin types' },
    { icon: Heart, title: 'Cruelty Free', description: 'Never tested on animals' },
    { icon: Star, title: 'Premium Quality', description: 'Best ingredients worldwide' }
  ];

  const testimonials = [
    { name: 'Priya Sharma', review: 'Amazing products! My skin has never looked better. The vitamin C serum is a game changer.', rating: 5 },
    { name: 'Rahul Verma', review: 'Finally found a hair fall solution that works. The biotin shampoo is fantastic!', rating: 5 },
    { name: 'Ananya Patel', review: 'Love the natural ingredients and the results are visible within weeks. Highly recommend!', rating: 5 }
  ];

  useEffect(() => {
    fetchProducts();
    initProducts();

    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  const initProducts = async () => {
    try {
      await axios.post(`${API}/init-products`);
    } catch (error) {
      console.log('Products already initialized');
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${API}/products`);
      setFeaturedProducts(response.data.slice(0, 8));
    } catch (error) {
      console.error('Failed to fetch products');
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Hero Slider */}
      <section className="relative h-[500px] md:h-[600px] overflow-hidden" data-testid="hero-section">
        {heroSlides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <img
              src={slide.image}
              alt={slide.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent flex items-center">
              <div className="container mx-auto px-4">
                <div className="max-w-2xl text-white">
                  <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 animate-fade-in" data-testid="hero-title">
                    {slide.title}
                  </h1>
                  <p className="text-lg sm:text-xl mb-8 animate-fade-in" data-testid="hero-subtitle">
                    {slide.subtitle}
                  </p>
                  <Link
                    to="/products"
                    className="inline-block btn-primary animate-fade-in"
                    data-testid="hero-cta"
                  >
                    {slide.cta}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Slider indicators */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex space-x-2">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-all ${
                index === currentSlide ? 'bg-white w-8' : 'bg-white/50'
              }`}
              data-testid={`slider-indicator-${index}`}
            />
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="section-padding bg-white" data-testid="categories-section">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl sm:text-4xl font-bold text-center text-amber-900 mb-12">
            Shop by Category
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {categories.map((category, index) => (
              <Link
                key={index}
                to={category.link}
                className="group relative h-80 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all"
                data-testid={`category-${category.name.toLowerCase().replace(' ', '-')}`}
              >
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end">
                  <div className="p-6 w-full">
                    <h3 className="text-2xl font-bold text-white mb-2">{category.name}</h3>
                    <div className="flex items-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-sm">Explore</span>
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Shop by Concern */}
      <section className="section-padding hero-gradient" data-testid="concerns-section">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl sm:text-4xl font-bold text-center text-amber-900 mb-12">
            Shop by Concern
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {concerns.map((concern, index) => (
              <Link
                key={index}
                to={`/products?concern=${concern.concern}`}
                className="bg-white p-6 rounded-xl text-center shadow-md hover:shadow-xl hover:-translate-y-2 transition-all"
                data-testid={`concern-${concern.concern}`}
              >
                <h4 className="font-semibold text-gray-800">{concern.name}</h4>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="section-padding bg-white" data-testid="featured-products-section">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-amber-900">
              Featured Products
            </h2>
            <Link to="/products" className="text-amber-900 hover:underline flex items-center" data-testid="view-all-link">
              View All <ChevronRight className="w-5 h-5 ml-1" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="section-padding hero-gradient" data-testid="why-choose-section">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl sm:text-4xl font-bold text-center text-amber-900 mb-12">
            Why Choose BellaHerbs
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {whyChooseUs.map((item, index) => {
              const Icon = item.icon;
              return (
                <div key={index} className="text-center" data-testid={`feature-${index}`}>
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-900 text-white rounded-full mb-4">
                    <Icon className="w-8 h-8" />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-2">{item.title}</h4>
                  <p className="text-sm text-gray-600">{item.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="section-padding bg-white" data-testid="testimonials-section">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl sm:text-4xl font-bold text-center text-amber-900 mb-12">
            What Our Customers Say
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-gradient-to-br from-amber-50 to-rose-50 p-6 rounded-xl shadow-md" data-testid={`testimonial-${index}`}>
                <div className="flex text-yellow-400 mb-4">
                  {'★'.repeat(testimonial.rating)}
                </div>
                <p className="text-gray-700 mb-4 italic">"{testimonial.review}"</p>
                <p className="font-semibold text-amber-900">- {testimonial.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default HomePage;
