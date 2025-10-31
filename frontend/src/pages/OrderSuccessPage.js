import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { CheckCircle, Package } from 'lucide-react';

const OrderSuccessPage = () => {
  const { orderId } = useParams();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <div className="flex-1 bg-gray-50 flex items-center justify-center py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg p-8 sm:p-12 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
              <CheckCircle className="w-12 h-12 text-green-500" />
            </div>

            <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-4" data-testid="success-title">
              Order Placed Successfully!
            </h1>

            <p className="text-gray-600 mb-6">
              Thank you for your purchase. Your order has been confirmed and will be shipped soon.
            </p>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 mb-8">
              <p className="text-sm text-gray-600 mb-2">Order ID</p>
              <p className="text-2xl font-bold text-amber-900" data-testid="order-id">{orderId}</p>
            </div>

            <div className="space-y-4 text-left bg-gray-50 rounded-xl p-6 mb-8">
              <div className="flex items-start space-x-3">
                <Package className="w-5 h-5 text-amber-900 mt-1" />
                <div>
                  <p className="font-semibold text-gray-800">Order Confirmation</p>
                  <p className="text-sm text-gray-600">You will receive an order confirmation email with details shortly.</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Package className="w-5 h-5 text-amber-900 mt-1" />
                <div>
                  <p className="font-semibold text-gray-800">Shipping Updates</p>
                  <p className="text-sm text-gray-600">Track your order status in your account section.</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/account" className="btn-primary" data-testid="view-orders-btn">
                View My Orders
              </Link>
              <Link to="/products" className="btn-secondary" data-testid="continue-shopping-btn">
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default OrderSuccessPage;
