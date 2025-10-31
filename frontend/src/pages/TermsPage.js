import Header from '../components/Header';
import Footer from '../components/Footer';

const TermsPage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <div className="flex-1 bg-gray-50">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl sm:text-5xl font-bold text-amber-900 mb-8 text-center" data-testid="terms-title">
              Terms of Service
            </h1>

            <div className="bg-white rounded-2xl shadow-lg p-8 sm:p-12 space-y-8">
              <div>
                <p className="text-sm text-gray-500 mb-4">Last updated: January 2025</p>
                <p className="text-gray-700 leading-relaxed">
                  Please read these Terms of Service carefully before using the BellaHerbs website. By accessing or using our service, you agree to be bound by these terms.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">1. Use of Our Service</h2>
                <p className="text-gray-700 leading-relaxed">
                  You may use our service only for lawful purposes and in accordance with these Terms. You agree not to use our service in any way that violates any applicable law or regulation, or to engage in any fraudulent activity.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">2. User Accounts</h2>
                <p className="text-gray-700 leading-relaxed">
                  When you create an account with us, you must provide accurate and complete information. You are responsible for maintaining the confidentiality of your account and password. You agree to notify us immediately of any unauthorized use of your account.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">3. Product Information and Pricing</h2>
                <p className="text-gray-700 leading-relaxed">
                  We strive to provide accurate product descriptions and pricing. However, we do not warrant that product descriptions or other content is accurate, complete, or error-free. We reserve the right to correct any errors and to change or update information at any time without prior notice.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">4. Orders and Payment</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  By placing an order, you make an offer to purchase products. We reserve the right to accept or decline your order for any reason. Payment must be received before your order is processed. We accept various payment methods as indicated on our website.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">5. Shipping and Delivery</h2>
                <p className="text-gray-700 leading-relaxed">
                  Shipping times are estimates only. We are not responsible for delays caused by shipping carriers or circumstances beyond our control. Risk of loss and title for items purchased pass to you upon delivery to the carrier.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">6. Returns and Refunds</h2>
                <p className="text-gray-700 leading-relaxed">
                  Please refer to our Refund & Return Policy for information about returns and refunds. By making a purchase, you agree to our return policy.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">7. Intellectual Property</h2>
                <p className="text-gray-700 leading-relaxed">
                  All content on this website, including text, graphics, logos, images, and software, is the property of BellaHerbs and is protected by copyright and other intellectual property laws. You may not reproduce, distribute, or create derivative works without our express written permission.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">8. Limitation of Liability</h2>
                <p className="text-gray-700 leading-relaxed">
                  To the fullest extent permitted by law, BellaHerbs shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising out of or related to your use of our service.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">9. Governing Law</h2>
                <p className="text-gray-700 leading-relaxed">
                  These Terms shall be governed by and construed in accordance with the laws of India, without regard to its conflict of law provisions.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">10. Changes to Terms</h2>
                <p className="text-gray-700 leading-relaxed">
                  We reserve the right to modify these Terms at any time. Changes will be effective immediately upon posting. Your continued use of the service after changes constitutes acceptance of the new Terms.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Contact Us</h2>
                <p className="text-gray-700 leading-relaxed">
                  If you have any questions about these Terms, please contact us at:
                  <br />
                  Email: legal@bellaherbs.com
                  <br />
                  Phone: +91 1800-123-4567
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default TermsPage;
