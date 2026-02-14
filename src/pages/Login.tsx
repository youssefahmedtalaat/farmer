import { useState, useEffect } from 'react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Separator } from '../components/ui/separator';
import { Sprout, Mail, Lock, Eye, EyeOff, User, Shield } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { authApi } from '../utils/api';
import { useAuth } from '../utils/auth';
import { notify } from '../utils/notifications';
import { useLanguage } from '../utils/language';

export function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [isSignup, setIsSignup] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreatingDemo, setIsCreatingDemo] = useState(false);
  const [userRole, setUserRole] = useState<'farmer' | 'admin'>('farmer');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
  });
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading, refreshUser, setUser } = useAuth();
  const { t } = useLanguage();

  const createDemoAccount = async () => {
    setIsCreatingDemo(true);
    try {
      // Try to create the demo account
      await authApi.signup({
        email: 'demo@farmer.com',
        password: 'demo123',
        fullName: 'Demo Farmer',
        role: 'farmer',
      });
      
      notify.success('Demo Account Created', 'Demo account created successfully! You can now log in.');
    } catch (error: any) {
      // If account already exists, that's fine
      if (error.message?.includes('already') || error.message?.includes('duplicate')) {
        notify.info('Demo Account Ready', 'Demo account already exists. You can log in now.');
      } else {
        notify.warning('Demo Setup', 'Demo account may already exist. Try logging in.');
      }
    } finally {
      setIsCreatingDemo(false);
      // Fill in the demo credentials
      setUserRole('farmer');
      setFormData({
        firstName: '',
        lastName: '',
        email: 'demo@farmer.com',
        password: 'demo123',
      });
    }
  };

  // Redirect if already logged in
  useEffect(() => {
    if (!loading && user) {
      const from = (location.state as any)?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    }
  }, [user, loading, navigate, location]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isSignup) {
        // Sign up
        const fullName = `${formData.firstName} ${formData.lastName}`.trim();
        
        if (!fullName || !formData.email || !formData.password) {
          notify.error('Missing Information', 'Please fill in all required fields');
          setIsLoading(false);
          return;
        }

        if (formData.password.length < 6) {
          notify.error('Weak Password', 'Password must be at least 6 characters');
          setIsLoading(false);
          return;
        }

        const response = await authApi.signup({
          email: formData.email,
          password: formData.password,
          fullName,
          role: userRole,
        });

        if (response.success && response.user) {
          // Set user directly from response to ensure role is included
          setUser({
            id: response.user.id,
            email: response.user.email,
            fullName: response.user.fullName,
            role: response.user.role || userRole,
          });
          await refreshUser(); // Also refresh to get latest data
          notify.auth.signupSuccess();
          
          const from = (location.state as any)?.from?.pathname || '/dashboard';
          navigate(from, { replace: true });
        }
      } else {
        // Sign in
        if (!formData.email || !formData.password) {
          notify.error('Missing Credentials', 'Please enter email and password');
          setIsLoading(false);
          return;
        }

        const response = await authApi.login({
          email: formData.email,
          password: formData.password,
          role: userRole,
        });

        if (response.success && response.user) {
          // Set user directly from response to ensure role is included
          setUser({
            id: response.user.id,
            email: response.user.email,
            fullName: response.user.fullName,
            role: response.user.role || userRole,
          });
          await refreshUser(); // Also refresh to get latest data
          notify.auth.loginSuccess();
          
          const from = (location.state as any)?.from?.pathname || '/dashboard';
          navigate(from, { replace: true });
        }
      }
    } catch (error: any) {
      // Provide more helpful error messages
      let errorMessage = 'Authentication failed. Please try again.';
      
      if (error.message?.includes('already exists') || error.message?.includes('duplicate')) {
        errorMessage = 'Unable to create account. The email may already be in use.';
      } else if (error.message?.includes('Invalid email or password') || error.message?.includes('Invalid login credentials')) {
        errorMessage = 'Invalid email or password. Please check your credentials and try again, or sign up for a new account.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      notify.auth.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left Side - Illustration */}
      <div className="hidden lg:flex relative bg-gradient-to-br from-[#2D6A4F] via-[#95D5B2] to-[#74C0FC] items-center justify-center p-12">
        <div className="absolute inset-0 opacity-20">
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1744230673231-865d54a0aba4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmYXJtZXIlMjB0ZWNobm9sb2d5JTIwZGlnaXRhbHxlbnwxfHx8fDE3NjE3MzQzOTd8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
            alt="Farmer using technology"
            className="w-full h-full object-cover"
          />
        </div>
        
        <div className="relative z-10 text-white max-w-md">
          <Link to="/" className="flex items-center gap-3 mb-8 hover:opacity-80 transition-opacity">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
              <Sprout className="w-10 h-10 text-white" />
            </div>
            <div>
              <h2 className="text-white">{t('app.name')}</h2>
              <p className="text-white/80 text-sm">{t('login.smartCropManagement')}</p>
            </div>
          </Link>

          <h2 className="text-white mb-4">{t('login.growSmarter')}</h2>
          <p className="text-white/90 text-lg mb-8">
            {t('login.joinThousands')}
          </p>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-white">✓</span>
              </div>
              <div>
                <p className="text-white">{t('login.trackCrops')}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-white">✓</span>
              </div>
              <div>
                <p className="text-white">{t('login.getAI')}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-white">✓</span>
              </div>
              <div>
                <p className="text-white">{t('login.connectMarkets')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex items-center justify-center p-8 bg-[#FAF9F6]">
        <Card className="w-full max-w-md p-8">
          {/* Mobile Logo */}
          <Link to="/" className="lg:hidden flex items-center justify-center gap-2 mb-8 hover:opacity-80 transition-opacity">
            <div className="w-12 h-12 bg-gradient-to-br from-[#2D6A4F] to-[#95D5B2] rounded-xl flex items-center justify-center">
              <Sprout className="w-6 h-6 text-white" />
            </div>
            <span className="text-[#2D6A4F]">{t('app.name')}</span>
          </Link>

          <div className="mb-8">
            <h2 className="text-[#2D6A4F] mb-2">
              {isSignup ? t('login.createAccount') : t('login.welcomeBack')}
            </h2>
            <p className="text-gray-600">
              {isSignup
                ? t('login.signupSubtitle')
                : t('login.subtitle')}
            </p>
          </div>

          {/* Role Selector */}
          <div className="mb-6">
            <Label className="mb-3 block">{t('login.loginAs')}</Label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setUserRole('farmer')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  userRole === 'farmer'
                    ? 'border-[#2D6A4F] bg-[#2D6A4F]/10'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex flex-col items-center gap-2">
                  <User className={`w-6 h-6 ${userRole === 'farmer' ? 'text-[#2D6A4F]' : 'text-gray-400'}`} />
                  <span className={`text-sm font-medium ${userRole === 'farmer' ? 'text-[#2D6A4F]' : 'text-gray-600'}`}>
                    {t('login.farmer')}
                  </span>
                </div>
              </button>
              <button
                type="button"
                onClick={() => setUserRole('admin')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  userRole === 'admin'
                    ? 'border-[#2D6A4F] bg-[#2D6A4F]/10'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex flex-col items-center gap-2">
                  <Shield className={`w-6 h-6 ${userRole === 'admin' ? 'text-[#2D6A4F]' : 'text-gray-400'}`} />
                  <span className={`text-sm font-medium ${userRole === 'admin' ? 'text-[#2D6A4F]' : 'text-gray-600'}`}>
                    {t('login.admin')}
                  </span>
                </div>
              </button>
            </div>
          </div>

          {!isSignup && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-900 mb-2">
                <strong>{t('login.demoInfo')}</strong>
              </p>
              <p className="text-xs text-blue-700">
                {t('login.demoCreate')}
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignup && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">{t('login.firstName')}</Label>
                  <Input
                    id="firstName"
                    placeholder={t('login.firstName')}
                    className="mt-1"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">{t('login.lastName')}</Label>
                  <Input
                    id="lastName"
                    placeholder={t('login.lastName')}
                    className="mt-1"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    disabled={isLoading}
                  />
                </div>
              </div>
            )}

            <div>
              <Label htmlFor="email">{t('login.email')}</Label>
              <div className="relative mt-1">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@farm.com"
                  className="pl-10"
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={isLoading}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="password">{t('login.password')}</Label>
              <div className="relative mt-1">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="pl-10 pr-10"
                  value={formData.password}
                  onChange={handleInputChange}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {!isSignup && (
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="rounded border-gray-300" />
                  <span className="text-gray-600">{t('login.rememberMe')}</span>
                </label>
                <a href="#" className="text-[#2D6A4F] hover:underline">
                  {t('login.forgotPassword')}
                </a>
              </div>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#2D6A4F] hover:bg-[#2D6A4F]/90 rounded-full py-6 disabled:opacity-50"
            >
              {isLoading
                ? (isSignup 
                    ? (userRole === 'admin' ? t('login.creatingAdminAccount') : t('login.creatingFarmerAccount'))
                    : (userRole === 'admin' ? t('login.loggingInAsAdmin') : t('login.loggingInAsFarmer')))
                : (isSignup 
                    ? (userRole === 'admin' ? t('login.createAdminAccount') : t('login.createFarmerAccount'))
                    : (userRole === 'admin' ? t('login.loginAsAdmin') : t('login.loginAsFarmer')))}
            </Button>

            {!isSignup && (
              <Button
                type="button"
                variant="outline"
                onClick={createDemoAccount}
                disabled={isCreatingDemo}
                className="w-full rounded-full mt-3"
              >
                {isCreatingDemo ? t('login.settingUpDemo') : t('login.demoAccount')}
              </Button>
            )}
          </form>

          <div className="my-6">
            <Separator className="relative">
              <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-2 text-gray-500 text-sm">
                {t('login.orContinue')}
              </span>
            </Separator>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Button variant="outline" className="rounded-full">
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              {t('login.google')}
            </Button>
            <Button variant="outline" className="rounded-full">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              {t('login.facebook')}
            </Button>
          </div>

          <p className="text-center text-gray-600 text-sm mt-6">
            {isSignup ? t('login.haveAccount') : t('login.noAccount')}{' '}
            <button
              type="button"
              onClick={() => setIsSignup(!isSignup)}
              className="text-[#2D6A4F] hover:underline"
            >
              {isSignup ? t('login.loginButton') : t('login.signup')}
            </button>
          </p>

          {isSignup && (
            <p className="text-xs text-gray-500 text-center mt-4">
              {t('login.bySigningUp')}{' '}
              <a href="#" className="text-[#2D6A4F] hover:underline">
                {t('login.terms')}
              </a>{' '}
              {t('login.and')}{' '}
              <a href="#" className="text-[#2D6A4F] hover:underline">
                {t('login.privacy')}
              </a>
            </p>
          )}
        </Card>
      </div>
    </div>
  );
}
