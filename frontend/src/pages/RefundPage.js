import Header from '../components/Header';
import Footer from '../components/Footer';

const RefundPage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <div className="flex-1 bg-gray-50">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl sm:text-5xl font-bold text-amber-900 mb-8 text-center" data-testid="refund-title">
              Refund & Return Policy
            </h1>

            <div className="bg-white rounded-2xl shadow-lg p-8 sm:p-12 space-y-8">
              <div>
                <p className="text-sm text-gray-500 mb-4">Last updated: January 2025</p>
                <p className="text-gray-700 leading-relaxed">
                  At BellaHerbs, customer satisfaction is our top priority. We want you to be completely happy with your purchase. If you're not satisfied, we're here to help.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Return Eligibility</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  You may return most items within 30 days of delivery for a full refund. To be eligible for a return:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                  <li>Products must be unused and in their original packaging</li>
                  <li>Products must be returned with all original tags and labels</li>
                  <li>Products must not be opened or tampered with (for hygiene reasons)</li>
                  <li>Return request must be initiated within 30 days of delivery</li>
                </ul>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Non-Returnable Items</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  The following items cannot be returned:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                  <li>Opened or used skincare, haircare, or body care products</li>
                  <li>Products without original packaging or tags</li>
                  <li>Gift cards or promotional items</li>
                  <li>Sale or clearance items (unless defective)</li>
                </ul>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">How to Initiate a Return</h2>
                <div className="space-y-3 text-gray-700">
                  <p className="leading-relaxed">
                    <span className="font-semibold">Step 1:</span> Log in to your account and go to "My Orders"
                  </p>
                  <p className="leading-relaxed">
                    <span className="font-semibold">Step 2:</span> Select the order you want to return and click "Request Return"
                  </p>
                  <p className="leading-relaxed">
                    <span className="font-semibold">Step 3:</span> Choose the reason for return and provide any additional details
                  </p>
                  <p className="leading-relaxed">
                    <span className="font-semibold">Step 4:</span> We'll review your request and provide return instructions within 24-48 hours
                  </p>
                  <p className="leading-relaxed">
                    <span className="font-semibold">Step 5:</span> Pack the item securely and ship it to the address provided
                  </p>
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Return Shipping</h2>
                <p className="text-gray-700 leading-relaxed">
                  Return shipping costs are the responsibility of the customer, except in cases where the product is defective or we sent the wrong item. We recommend using a trackable shipping service for returns.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Refund Processing</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Once we receive your returned item:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                  <li>We'll inspect the item within 3-5 business days</li>
                  <li>If approved, your refund will be processed to your original payment method</li>
                  <li>Refunds typically appear in your account within 7-10 business days</li>
                  <li>You'll receive an email confirmation once your refund is processed</li>
                </ul>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Exchanges</h2>
                <p className="text-gray-700 leading-relaxed">
                  If you need to exchange an item for a different size or product, please initiate a return and place a new order. This ensures the fastest processing time.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Damaged or Defective Products</h2>
                <p className="text-gray-700 leading-relaxed">
                  If you receive a damaged or defective product, please contact us immediately with photos. We'll arrange for a replacement or full refund at no additional cost to you.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Late or Missing Refunds</h2>
                <p className="text-gray-700 leading-relaxed">
                  If you haven't received your refund within the expected timeframe, please check with your bank or credit card company first. If you've done this and still haven't received your refund, contact us at refunds@bellaherbs.com.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Contact Us</h2>
                <p className="text-gray-700 leading-relaxed">
                  For any questions about returns or refunds:
                  <br />
                  Email: refunds@bellaherbs.com
                  <br />
                  Phone: +91 1800-123-4567
                  <br />
                  Monday-Saturday: 9:00 AM - 6:00 PM IST
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

export default RefundPage;
