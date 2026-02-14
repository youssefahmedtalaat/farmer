import { useState } from 'react';
import { Button } from './ui/button';
import { Sprout, Menu, X, LogOut, Languages } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../utils/auth';
import { notify } from '../utils/notifications';
import { useLanguage } from '../utils/language';

export function Navbar({ isLoggedIn = false }: { isLoggedIn?: boolean }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { language, setLanguage, t } = useLanguage();

  const handleSignOut = async () => {
    await signOut();
    notify.auth.logoutSuccess();
    navigate('/');
  };

  const isAdmin = user?.role === 'admin';
  
  const navLinks = user
    ? [
        { name: t('nav.profile'), path: '/profile' },
        ...(!isAdmin ? [{ name: t('nav.about'), path: '/about' }] : []),
        { name: t('nav.contact'), path: '/contact' },
      ]
    : [
        { name: t('nav.home'), path: '/' },
        { name: t('nav.about'), path: '/about' },
        { name: t('nav.contact'), path: '/contact' },
        { name: t('nav.pricing'), path: '/subscription' },
      ];

  const toggleLanguage = () => {
    const newLang = language === 'en' ? 'ar' : 'en';
    setLanguage(newLang);
    notify.success(
      language === 'en' ? 'Language Changed' : 'تم تغيير اللغة',
      language === 'en' ? 'Language switched to Arabic' : 'تم التبديل إلى الإنجليزية'
    );
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link 
            to="/" 
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          >
            <div className="w-10 h-10 bg-gradient-to-br from-[#2D6A4F] to-[#95D5B2] rounded-xl flex items-center justify-center">
              <Sprout className="w-6 h-6 text-white" />
            </div>
            <span className="text-[#2D6A4F]">{t('app.name')}</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`transition-colors ${
                  location.pathname === link.path
                    ? 'text-[#2D6A4F]'
                    : 'text-gray-600 hover:text-[#2D6A4F]'
                }`}
              >
                {link.name}
              </Link>
            ))}
            
            {/* Language Switcher */}
            <Button
              onClick={toggleLanguage}
              variant="outline"
              size="sm"
              className="rounded-full gap-2"
              title={language === 'en' ? 'Switch to Arabic' : 'التبديل إلى الإنجليزية'}
            >
              <Languages className="w-4 h-4" />
              <span className="text-sm">{language === 'en' ? 'العربية' : 'English'}</span>
            </Button>
            
            {!user ? (
              <Link to="/login">
                <Button className="bg-[#2D6A4F] hover:bg-[#2D6A4F]/90 rounded-full">
                  {t('nav.login')}
                </Button>
              </Link>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/dashboard">
                  <Button className="bg-[#2D6A4F] hover:bg-[#2D6A4F]/90 rounded-full">
                    {t('nav.dashboard')}
                  </Button>
                </Link>
                <Button
                  onClick={handleSignOut}
                  variant="outline"
                  className="border-2 border-[#2D6A4F] text-[#2D6A4F] hover:bg-[#2D6A4F] hover:text-white rounded-full"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  {t('nav.logout')}
                </Button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6 text-[#2D6A4F]" />
            ) : (
              <Menu className="w-6 h-6 text-[#2D6A4F]" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white">
          <div className="px-4 py-4 space-y-3">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`block py-2 transition-colors ${
                  location.pathname === link.path
                    ? 'text-[#2D6A4F]'
                    : 'text-gray-600'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.name}
              </Link>
            ))}
            
            {/* Language Switcher Mobile */}
            <Button
              onClick={() => {
                toggleLanguage();
                setMobileMenuOpen(false);
              }}
              variant="outline"
              className="w-full rounded-full gap-2"
            >
              <Languages className="w-4 h-4" />
              <span>{language === 'en' ? 'العربية' : 'English'}</span>
            </Button>
            
            {!user ? (
              <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                <Button className="w-full bg-[#2D6A4F] hover:bg-[#2D6A4F]/90 rounded-full">
                  {t('nav.login')}
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full bg-[#2D6A4F] hover:bg-[#2D6A4F]/90 rounded-full mb-2">
                    {t('nav.dashboard')}
                  </Button>
                </Link>
                <Button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleSignOut();
                  }}
                  variant="outline"
                  className="w-full border-2 border-[#2D6A4F] text-[#2D6A4F] hover:bg-[#2D6A4F] hover:text-white rounded-full"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  {t('nav.logout')}
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
