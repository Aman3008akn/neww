import Header from '../components/Header';
import Footer from '../components/Footer';

const AboutPage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <div className="flex-1 bg-gray-50">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl sm:text-5xl font-bold text-amber-900 mb-8 text-center" data-testid="about-title">
              About BellaHerbs
            </h1>

            <div className="bg-white rounded-2xl shadow-lg p-8 sm:p-12 space-y-6">
              <p className="text-lg text-gray-700 leading-relaxed">
                Welcome to <span className="font-semibold text-amber-900">BellaHerbs</span>, your trusted destination for premium natural skincare, haircare, and wellness products. We believe that beauty comes from nature, and our mission is to bring you the finest ingredients from around the world.
              </p>

              <p className="text-lg text-gray-700 leading-relaxed">
                Founded with a passion for natural wellness, BellaHerbs offers a carefully curated collection of products that are 100% natural, cruelty-free, and dermatologically tested. We understand that your skin and hair deserve the best, which is why we never compromise on quality.
              </p>

              <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4">Our Values</h2>

              <div className="space-y-4">
                <div className="border-l-4 border-amber-900 pl-6">
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">100% Natural</h3>
                  <p className="text-gray-600">
                    We use only pure, natural ingredients sourced from trusted suppliers worldwide. No harmful chemicals, no artificial additives.
                  </p>
                </div>

                <div className="border-l-4 border-amber-900 pl-6">
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">Cruelty-Free</h3>
                  <p className="text-gray-600">
                    We are committed to ethical beauty. All our products are never tested on animals, and we work only with suppliers who share our values.
                  </p>
                </div>

                <div className="border-l-4 border-amber-900 pl-6">
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">Dermatologically Tested</h3>
                  <p className="text-gray-600">
                    Your safety is our priority. Every product undergoes rigorous dermatological testing to ensure it's safe for all skin types.
                  </p>
                </div>

                <div className="border-l-4 border-amber-900 pl-6">
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">Sustainable</h3>
                  <p className="text-gray-600">
                    We care about our planet. Our packaging is eco-friendly, and we continuously work to minimize our environmental footprint.
                  </p>
                </div>
              </div>

              <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4">Our Promise</h2>

              <p className="text-lg text-gray-700 leading-relaxed">
                At BellaHerbs, we promise to deliver products that not only meet but exceed your expectations. We are constantly researching and innovating to bring you the latest in natural beauty and wellness. Join us on this journey to healthier, more radiant skin and hair.
              </p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default AboutPage;
