import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const AdminLoginPage = () => {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    // Hardcoded admin credentials
    if (credentials.username === 'admin' && credentials.password === 'admin123') {
      localStorage.setItem('admin_token', 'admin-logged-in');
      toast.success('Admin login successful');
      navigate('/admin/dashboard');
    } else {
      toast.error('Invalid admin credentials');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-rose-50">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-amber-900 mb-6 text-center" data-testid="admin-login-title">
          Admin Login
        </h1>
        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="text"
            placeholder="Username"
            value={credentials.username}
            onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-amber-900"
            required
            data-testid="admin-username"
          />
          <input
            type="password"
            placeholder="Password"
            value={credentials.password}
            onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-amber-900"
            required
            data-testid="admin-password"
          />
          <button type="submit" className="w-full btn-primary" data-testid="admin-login-submit">
            Login to Admin Panel
          </button>
        </form>
        <div className="mt-6 p-4 bg-amber-50 rounded-lg">
          <p className="text-sm text-gray-600 text-center">
            <strong>Demo Credentials:</strong><br/>
            Username: admin<br/>
            Password: admin123
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;