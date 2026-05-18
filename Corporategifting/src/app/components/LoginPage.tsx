import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { Lock, Mail } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import logo from '../../imports/image-3.png';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { colors } = useTheme();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const success = await login(email, password);
      if (success) {
        toast.success('Login successful!');
        navigate('/items');
      } else {
        toast.error('Invalid email or password');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An error occurred during login';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const fillDemoCredentials = () => {
    setEmail('dummy.admin@giftcatalog.com');
    setPassword('1234567890');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: colors.background }}>
      <div className="w-full max-w-md">
        <div className="rounded-xl shadow-lg p-6" style={{ backgroundColor: colors.cardBg, border: `1px solid ${colors.border}` }}>
          <div className="text-center mb-6">
            <div className="flex justify-center mb-4">
              <img
                src={logo}
                alt="Gift Ideas Logo"
                style={{
                  height: '100px',
                  width: 'auto',
                  objectFit: 'contain',
                }}
              />
            </div>
            <p className="text-sm mt-4" style={{ color: colors.text.secondary }}>Sign in to manage your catalogue</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1" style={{ color: colors.text.primary }}>
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: colors.text.tertiary }} />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-lg focus:ring-2 focus:border-transparent outline-none transition text-sm"
                  style={{
                    backgroundColor: colors.background,
                    border: `1px solid ${colors.border}`,
                    color: colors.text.primary,
                  }}
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-1" style={{ color: colors.text.primary }}>
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: colors.text.tertiary }} />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-lg focus:ring-2 focus:border-transparent outline-none transition text-sm"
                  style={{
                    backgroundColor: colors.background,
                    border: `1px solid ${colors.border}`,
                    color: colors.text.primary,
                  }}
                  placeholder="Enter your password"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full font-medium py-2.5 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              style={{
                backgroundColor: colors.accent.gold,
                color: '#FFFFFF',
              }}
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-4 p-3 rounded-lg" style={{ backgroundColor: colors.hover, border: `1px solid ${colors.border}` }}>
            <p className="text-xs font-medium mb-2" style={{ color: colors.text.primary }}>Demo Credentials:</p>
            <div className="space-y-1 text-xs">
              <p style={{ color: colors.text.secondary }}>Email: <span className="font-mono" style={{ color: colors.accent.gold }}>dummy.admin@giftcatalog.com</span></p>
              <p style={{ color: colors.text.secondary }}>Password: <span className="font-mono" style={{ color: colors.accent.gold }}>1234567890</span></p>
            </div>
            <button
              type="button"
              onClick={fillDemoCredentials}
              className="mt-2 w-full font-medium py-2 rounded-lg transition duration-200 text-sm"
              style={{
                backgroundColor: colors.background,
                border: `1px solid ${colors.border}`,
                color: colors.text.primary,
              }}
            >
              Use Demo Credentials
            </button>
          </div>

          <div className="mt-4 text-center">
            <p className="text-xs" style={{ color: colors.text.tertiary }}>
              This application uses backend authentication
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
