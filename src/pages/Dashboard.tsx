import { useState, useEffect } from 'react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { Avatar } from '../components/ui/avatar';
import {
  Home,
  Sprout,
  Bell,
  MapPin,
  CreditCard,
  Settings,
  TrendingUp,
  AlertTriangle,
  Clock,
  Package,
  Menu,
  X,
  User,
  Languages,
  Pencil,
} from 'lucide-react';
import { Link, useLocation, Routes, Route } from 'react-router-dom';
import { useAuth } from '../utils/auth';
import { SubscriptionDashboard } from '../components/SubscriptionDashboard';
import { AddCropDialog } from '../components/AddCropDialog';
import { EditCropDialog } from '../components/EditCropDialog';
import { notify } from '../utils/notifications';
import { cropsApi, activitiesApi } from '../utils/api';
import { useLanguage } from '../utils/language';

export function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { user } = useAuth();
  const { t, language, setLanguage } = useLanguage();

  const menuItems = [
    { name: t('nav.home'), icon: <Home className="w-5 h-5" />, path: '/dashboard' },
    { name: t('dashboard.myCrops'), icon: <Sprout className="w-5 h-5" />, path: '/dashboard/crops' },
    { name: t('dashboard.exploreFarms'), icon: <MapPin className="w-5 h-5" />, path: '/explore-farms' },
    { name: t('nav.profile'), icon: <User className="w-5 h-5" />, path: '/profile' },
    { name: t('common.notifications'), icon: <Bell className="w-5 h-5" />, path: '/dashboard/notifications' },
    { name: t('dashboard.subscription'), icon: <CreditCard className="w-5 h-5" />, path: '/dashboard/subscription' },
    { name: t('common.settings'), icon: <Settings className="w-5 h-5" />, path: '/dashboard/settings' },
  ];

  return (
    <div className="min-h-screen bg-[#FAF9F6]">
      {/* Mobile Menu Button */}
      <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-30">
        <h2 className="text-[#2D6A4F]">{t('nav.dashboard')}</h2>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
            className="rounded-full"
          >
            <Languages className="w-4 h-4 mr-1" />
            {language === 'en' ? 'ع' : 'EN'}
          </Button>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2">
            {sidebarOpen ? (
              <X className="w-6 h-6 text-gray-600" />
            ) : (
              <Menu className="w-6 h-6 text-gray-600" />
            )}
          </button>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } lg:translate-x-0 fixed lg:sticky top-0 left-0 h-screen w-64 bg-white border-r border-gray-200 transition-transform z-40 flex flex-col`}
        >
          <div className="p-6 border-b border-gray-200">
            <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <div className="w-10 h-10 bg-gradient-to-br from-[#2D6A4F] to-[#95D5B2] rounded-xl flex items-center justify-center">
                <Sprout className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-[#2D6A4F]">{t('app.name')}</p>
                <p className="text-xs text-gray-500">
                  {user?.fullName || user?.email?.split('@')[0] || 'Farmer'}
                </p>
              </div>
            </Link>
          </div>

          <nav className="flex-1 p-4 space-y-1">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  location.pathname === item.path
                    ? 'bg-[#2D6A4F] text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {item.icon}
                <span>{item.name}</span>
              </Link>
            ))}
          </nav>

          <div className="p-4 border-t border-gray-200">
            <Card className="p-4 bg-gradient-to-br from-[#2D6A4F] to-[#95D5B2]">
              <p className="text-sm text-white mb-2">{t('dashboard.upgradePremium')}</p>
              <p className="text-xs text-white/80 mb-3">
                {t('dashboard.upgradeCta')}
              </p>
              <Link 
                to="/subscription"
                onClick={() => {
                  notify.info('Viewing Plans', 'Browse all available subscription plans and features');
                }}
              >
                <Button className="w-full bg-white text-[#2D6A4F] hover:bg-white/90 rounded-full text-sm">
                  {t('dashboard.upgradeNow')}
                </Button>
              </Link>
            </Card>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 lg:p-8">
          {/* Desktop Language Switcher */}
          <div className="hidden lg:flex justify-end mb-4">
            <Button
              variant="outline"
              onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
              className="rounded-full"
            >
              <Languages className="w-4 h-4 mr-2" />
              {language === 'en' ? 'العربية' : 'English'}
            </Button>
          </div>
          
          <div className="max-w-7xl mx-auto">
            <Routes>
              <Route path="subscription" element={<SubscriptionDashboard />} />
              <Route path="crops" element={<MyCropsPage user={user} />} />
              <Route path="notifications" element={<NotificationsPage />} />
              <Route path="settings" element={<SettingsPage user={user} />} />
              <Route path="/" element={<DashboardHome user={user} />} />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  );
}

function DashboardHome({ user }: { user: any }) {
  const { t } = useLanguage();
  const [crops, setCrops] = useState<any[]>([]);
  const [isLoadingCrops, setIsLoadingCrops] = useState(true);
  const [showAddCropDialog, setShowAddCropDialog] = useState(false);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);

  const defaultCrops = [
    { name: t('dashboard.data.wheat'), stock: 80, quantity: `2 ${t('dashboard.data.tons')}`, status: 'Good', color: '#2D6A4F' },
    { name: t('dashboard.data.corn'), stock: 45, quantity: `1.2 ${t('dashboard.data.tons')}`, status: 'Low', color: '#BC6C25' },
    { name: t('dashboard.data.rice'), stock: 90, quantity: `3.5 ${t('dashboard.data.tons')}`, status: 'Good', color: '#2D6A4F' },
    { name: t('dashboard.data.soybeans'), stock: 25, quantity: `0.8 ${t('dashboard.data.tons')}`, status: 'Critical', color: '#ef4444' },
  ];

  const marketplaces = [
    { name: 'GreenMarket', distance: `5 ${t('dashboard.data.km')}`, rating: 4.8, type: t('dashboard.data.buySell') },
    { name: 'FarmHub', distance: `8 ${t('dashboard.data.km')}`, rating: 4.6, type: t('dashboard.data.sellOnly') },
    { name: 'AgriConnect', distance: `12 ${t('dashboard.data.km')}`, rating: 4.9, type: t('dashboard.data.buySell') },
  ];

  useEffect(() => {
    loadCrops();
    
    // Auto-refresh crops, alerts, and activities every 30 seconds
    const interval = setInterval(() => {
      loadCrops();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, []);

  // Auto-refresh alerts and activities when crops change
  useEffect(() => {
    if (crops.length > 0) {
      generateAlertsFromCrops(crops);
      generateActivitiesFromCrops(crops);
    }
  }, [crops]);

  const formatTimeAgo = (dateString: string) => {
    if (!dateString) return t('notifications.recent');
    
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) {
      return t('notifications.justNow');
    } else if (diffHours < 24) {
      return `${diffHours} ${t('dashboard.data.timeHoursAgo')}`;
    } else if (diffDays === 1) {
      return `1 ${t('dashboard.data.timeDayAgo')}`;
    } else if (diffDays < 7) {
      return `${diffDays} ${t('dashboard.data.timeDaysAgo')}`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const generateAlertsFromCrops = (cropsData: any[]) => {
    const generatedAlerts: any[] = [];
    
    // Sort crops by stock level (critical first)
    const sortedCrops = [...cropsData].sort((a, b) => a.stock - b.stock);
    
    sortedCrops.forEach((crop) => {
      const stock = crop.stock || 0;
      const cropName = crop.name || 'Unknown Crop';
      
      // Critical stock alerts (≤ 25%)
      if (stock <= 25) {
        generatedAlerts.push({
          type: 'critical',
          message: `${cropName} ${t('dashboard.alertCriticalStock')} - ${stock}% ${t('notifications.remaining')}`,
          time: formatTimeAgo(crop.updatedAt || crop.createdAt),
          cropId: crop.id,
          cropName: cropName,
          stock: stock,
        });
      }
      // Low stock alerts (26-50%)
      else if (stock <= 50 && generatedAlerts.length < 3) {
        generatedAlerts.push({
          type: 'warning',
          message: `${cropName} ${t('dashboard.alertLowStock')} - ${stock}% ${t('notifications.remaining')}`,
          time: formatTimeAgo(crop.updatedAt || crop.createdAt),
          cropId: crop.id,
          cropName: cropName,
          stock: stock,
        });
      }
    });

    // If no critical/low stock alerts, add a general info alert
    if (generatedAlerts.length === 0 && cropsData.length > 0) {
      generatedAlerts.push({
        type: 'info',
        message: t('dashboard.allCropsGood'),
        time: t('notifications.justNow'),
      });
    }

    // Limit to 3 most important alerts
    setAlerts(generatedAlerts.slice(0, 3));
  };

  const generateActivitiesFromCrops = async (cropsData: any[]) => {
    try {
      // Try to load activities from API
      const activitiesData: any = await activitiesApi.getAll();
      
      if (activitiesData.activities && activitiesData.activities.length > 0) {
        // Use real activities from API
        const formattedActivities = activitiesData.activities.slice(0, 4).map((activity: any) => ({
          action: activity.action,
          detail: activity.detail || '',
          time: formatTimeAgo(activity.timestamp),
        }));
        setActivities(formattedActivities);
      } else {
        // Generate activities from crops if no API activities
        const generatedActivities: any[] = [];
        
        // Sort by most recently updated
        const sortedCrops = [...cropsData]
          .sort((a, b) => {
            const dateA = new Date(a.updatedAt || a.createdAt).getTime();
            const dateB = new Date(b.updatedAt || b.createdAt).getTime();
            return dateB - dateA;
          })
          .slice(0, 4);

        sortedCrops.forEach((crop) => {
          const cropName = crop.name || 'Unknown Crop';
          const stock = crop.stock || 0;
          
          generatedActivities.push({
            action: `${cropName} ${t('dashboard.activityUpdated')}`,
            detail: `${t('dashboard.stockLevel')}: ${stock}% - ${crop.quantity || ''}`,
            time: formatTimeAgo(crop.updatedAt || crop.createdAt),
          });
        });

        setActivities(generatedActivities);
      }
    } catch (error) {
      console.error('Error loading activities:', error);
      // Fallback to crop-based activities
      const generatedActivities: any[] = [];
      
      cropsData.slice(0, 4).forEach((crop) => {
        const cropName = crop.name || 'Unknown Crop';
        const stock = crop.stock || 0;
        
        generatedActivities.push({
          action: `${cropName} ${t('dashboard.activityUpdated')}`,
          detail: `${t('dashboard.stockLevel')}: ${stock}% - ${crop.quantity || ''}`,
          time: formatTimeAgo(crop.updatedAt || crop.createdAt),
        });
      });

      setActivities(generatedActivities);
    }
  };

  const loadCrops = async () => {
    try {
      setIsLoadingCrops(true);
      const data: any = await cropsApi.getAll();
      
      // If user has crops in the database, use them
      if (data.crops && data.crops.length > 0) {
        // Add color based on status
        const cropsWithColors = data.crops.map((crop: any) => ({
          ...crop,
          color: crop.stock <= 25 ? '#ef4444' : crop.stock <= 50 ? '#BC6C25' : '#2D6A4F',
        }));
        setCrops(cropsWithColors);
        
        // Generate alerts and activities from crops
        generateAlertsFromCrops(cropsWithColors);
        await generateActivitiesFromCrops(cropsWithColors);
      } else {
        // Use default crops for demo purposes
        setCrops(defaultCrops);
        generateAlertsFromCrops(defaultCrops);
        await generateActivitiesFromCrops(defaultCrops);
      }
    } catch (error) {
      console.error('Error loading crops:', error);
      // Use default crops on error
      setCrops(defaultCrops);
      generateAlertsFromCrops(defaultCrops);
      await generateActivitiesFromCrops(defaultCrops);
    } finally {
      setIsLoadingCrops(false);
    }
  };

  const getStatusTranslation = (status: string) => {
    const statusMap: { [key: string]: string } = {
      'Good': t('dashboard.good'),
      'Low': t('dashboard.low'),
      'Critical': t('dashboard.critical'),
    };
    return statusMap[status] || status;
  };

  const handleCropAdded = () => {
    // Reload crops after adding a new one (this will also refresh alerts and activities)
    loadCrops();
    // Dispatch event to notify other components
    window.dispatchEvent(new CustomEvent('cropsUpdated'));
  };

  // Listen for crop updates from other components
  useEffect(() => {
    const handleCropsUpdated = () => {
      loadCrops();
    };

    window.addEventListener('cropsUpdated', handleCropsUpdated);
    
    // Also refresh when window gains focus (user comes back to tab)
    const handleFocus = () => {
      loadCrops();
    };
    window.addEventListener('focus', handleFocus);

    return () => {
      window.removeEventListener('cropsUpdated', handleCropsUpdated);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  return (
    <>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-[#2D6A4F] mb-2">{t('dashboard.welcome')}, {user?.fullName || user?.email?.split('@')[0] || 'Farmer'} 👋</h1>
        <p className="text-gray-600">{t('dashboard.subtitle')}</p>
      </div>

            {/* Stats Overview */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <Card className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-600">{t('dashboard.totalCrops')}</p>
                  <Package className="w-5 h-5 text-[#2D6A4F]" />
                </div>
                <p className="text-gray-900">{crops.length} {t('dashboard.types')}</p>
                <p className="text-sm text-green-600 flex items-center gap-1 mt-1">
                  <TrendingUp className="w-3 h-3" />
                  {t('dashboard.active')}
                </p>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-600">{t('dashboard.avgStock')}</p>
                  <Sprout className="w-5 h-5 text-[#2D6A4F]" />
                </div>
                <p className="text-gray-900">
                  {crops.length > 0 
                    ? `${Math.round(crops.reduce((sum, c) => sum + c.stock, 0) / crops.length)}%`
                    : '0%'
                  }
                </p>
                <p className="text-sm text-gray-600 mt-1">{t('dashboard.acrossAll')}</p>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-600">{t('dashboard.alerts')}</p>
                  <Bell className="w-5 h-5 text-orange-500" />
                </div>
                <p className="text-gray-900">
                  {crops.filter(c => c.stock <= 50).length} {t('dashboard.active')}
                </p>
                <p className="text-sm text-orange-600 mt-1">
                  {crops.filter(c => c.stock <= 50).length > 0 ? t('dashboard.requiresAttention') : t('dashboard.allGood')}
                </p>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-600">{t('dashboard.markets')}</p>
                  <MapPin className="w-5 h-5 text-[#74C0FC]" />
                </div>
                <p className="text-gray-900">3 {t('dashboard.found')}</p>
                <p className="text-sm text-gray-600 mt-1">{t('dashboard.within')}</p>
              </Card>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              {/* Left Column */}
              <div className="lg:col-span-2 space-y-8">
                {/* Crop Overview */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-[#2D6A4F]">{t('dashboard.cropOverview')}</h2>
                    <Button 
                      variant="outline" 
                      className="rounded-full"
                      onClick={() => setShowAddCropDialog(true)}
                    >
                      {t('dashboard.addCrop')}
                    </Button>
                  </div>
                  
                  {isLoadingCrops ? (
                    <div className="grid sm:grid-cols-2 gap-4">
                      {[1, 2, 3, 4].map((i) => (
                        <Card key={i} className="p-6 animate-pulse">
                          <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                          <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                        </Card>
                      ))}
                    </div>
                  ) : crops.length === 0 ? (
                    <Card className="p-12 text-center">
                      <Sprout className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-gray-900 mb-2">{t('dashboard.noCrops')}</h3>
                      <p className="text-gray-600 text-sm mb-4">
                        {t('dashboard.noCropsDesc')}
                      </p>
                      <Button 
                        onClick={() => setShowAddCropDialog(true)}
                        className="bg-[#2D6A4F] hover:bg-[#2D6A4F]/90 rounded-full"
                      >
                        {t('dashboard.addFirstCrop')}
                      </Button>
                    </Card>
                  ) : (
                    <div className="grid sm:grid-cols-2 gap-4">
                      {crops.map((crop) => (
                      <Card 
                        key={crop.id || crop.name} 
                        className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
                        onClick={() => {
                          notify.info(
                            `${crop.name} Details`,
                            `Stock: ${crop.quantity} (${crop.stock}%) - Status: ${crop.status}`
                          );
                          
                          // Check stock levels and send appropriate notifications
                          if (crop.stock <= 25) {
                            notify.crop.stockCritical(crop.name, crop.stock);
                          } else if (crop.stock <= 50) {
                            notify.crop.stockLow(crop.name, crop.stock);
                          }
                        }}
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-12 h-12 rounded-xl flex items-center justify-center"
                              style={{ backgroundColor: `${crop.color}20` }}
                            >
                              <Sprout className="w-6 h-6" style={{ color: crop.color }} />
                            </div>
                            <div>
                              <p className="text-gray-900">{crop.name}</p>
                              <p className="text-sm text-gray-600">{crop.quantity}</p>
                            </div>
                          </div>
                          <Badge
                            variant={
                              crop.status === 'Critical'
                                ? 'destructive'
                                : crop.status === 'Low'
                                ? 'outline'
                                : 'default'
                            }
                            className={
                              crop.status === 'Good'
                                ? 'bg-green-100 text-green-800 hover:bg-green-100'
                                : ''
                            }
                          >
                            {getStatusTranslation(crop.status)}
                          </Badge>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">{t('dashboard.stockLevel')}</span>
                            <span className="text-gray-900">{crop.stock}%</span>
                          </div>
                          <Progress value={crop.stock} className="h-2" />
                        </div>
                      </Card>
                      ))}
                    </div>
                  )}
                </div>

                {/* AI Suggestions */}
                <Card className="p-6 bg-gradient-to-br from-[#74C0FC]/10 to-[#95D5B2]/10 border-[#74C0FC]/20">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#74C0FC] to-[#95D5B2] rounded-xl flex items-center justify-center flex-shrink-0">
                      <TrendingUp className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-[#2D6A4F] mb-2">{t('dashboard.aiRecommendation')}</h3>
                      <p className="text-gray-700 mb-4">
                        {t('dashboard.aiMessage')}
                      </p>
                      <div className="flex gap-2">
                        <Button 
                          className="bg-[#2D6A4F] hover:bg-[#2D6A4F]/90 rounded-full"
                          onClick={() => {
                            notify.ai.recommendationViewed();
                          }}
                        >
                          {t('dashboard.viewDetails')}
                        </Button>
                        <Button 
                          variant="outline" 
                          className="rounded-full"
                          onClick={() => {
                            notify.ai.recommendationDismissed();
                          }}
                        >
                          {t('dashboard.dismiss')}
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Market Map */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-[#2D6A4F]">{t('dashboard.nearbyMarkets')}</h2>
                    <Link to="/explore-farms">
                      <Button variant="outline" className="rounded-full text-sm">
                        {t('dashboard.viewMap')}
                      </Button>
                    </Link>
                  </div>
                  <Card className="p-6">
                    <div className="bg-gray-100 rounded-xl h-64 mb-4 flex items-center justify-center relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-[#2D6A4F]/5 to-[#95D5B2]/5" />
                      <div className="relative text-center">
                        <MapPin className="w-12 h-12 text-[#2D6A4F] mx-auto mb-2" />
                        <p className="text-gray-600">{t('dashboard.interactiveMap')}</p>
                        <p className="text-sm text-gray-500 mb-3">{t('dashboard.showingMarkets')}</p>
                        <Link to="/explore-farms">
                          <Button className="bg-[#2D6A4F] hover:bg-[#2D6A4F]/90 rounded-full">
                            {t('dashboard.exploreMap')}
                          </Button>
                        </Link>
                      </div>
                    </div>
                    <div className="space-y-3">
                      {marketplaces.map((market) => (
                        <div
                          key={market.name}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                          onClick={() => {
                            notify.marketplace.viewed(market.name);
                          }}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-[#2D6A4F]/10 rounded-lg flex items-center justify-center">
                              <MapPin className="w-5 h-5 text-[#2D6A4F]" />
                            </div>
                            <div>
                              <p className="text-gray-900">{market.name}</p>
                              <p className="text-sm text-gray-600">{market.type}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-900">{market.distance}</p>
                            <p className="text-xs text-gray-600">⭐ {market.rating}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-8">
                {/* Low Stock Alerts */}
                <div>
                  <h2 className="text-[#2D6A4F] mb-4">{t('dashboard.alerts')}</h2>
                  {alerts.length === 0 ? (
                    <Card className="p-6 text-center">
                      <AlertTriangle className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">{t('dashboard.noAlerts')}</p>
                    </Card>
                  ) : (
                    <div className="space-y-3">
                      {alerts.map((alert, index) => (
                        <Card
                          key={alert.cropId || index}
                          className={`p-4 cursor-pointer hover:shadow-md transition-shadow ${
                            alert.type === 'critical'
                              ? 'border-red-200 bg-red-50'
                              : alert.type === 'warning'
                              ? 'border-orange-200 bg-orange-50'
                              : 'border-blue-200 bg-blue-50'
                          }`}
                          onClick={() => {
                            if (alert.type === 'critical') {
                              notify.error('Critical Alert', alert.message);
                            } else if (alert.type === 'warning') {
                              notify.warning('Warning Alert', alert.message);
                            } else {
                              notify.info('Information', alert.message);
                            }
                          }}
                        >
                          <div className="flex items-start gap-3">
                            <AlertTriangle
                              className={`w-5 h-5 flex-shrink-0 ${
                                alert.type === 'critical'
                                  ? 'text-red-600'
                                  : alert.type === 'warning'
                                  ? 'text-orange-600'
                                  : 'text-blue-600'
                              }`}
                            />
                            <div className="flex-1">
                              <p
                                className={`text-sm mb-1 font-medium ${
                                  alert.type === 'critical'
                                    ? 'text-red-900'
                                    : alert.type === 'warning'
                                    ? 'text-orange-900'
                                    : 'text-blue-900'
                                }`}
                              >
                                {alert.message}
                              </p>
                              {alert.cropName && (
                                <div className="flex items-center gap-2 mb-1">
                                  <Sprout className="w-3 h-3 text-[#2D6A4F]" />
                                  <span className="text-xs text-gray-700">{alert.cropName}</span>
                                  {alert.stock !== undefined && (
                                    <Badge 
                                      variant="outline" 
                                      className={`text-xs ${
                                        alert.stock <= 25 
                                          ? 'border-red-300 text-red-700' 
                                          : 'border-orange-300 text-orange-700'
                                      }`}
                                    >
                                      {alert.stock}%
                                    </Badge>
                                  )}
                                </div>
                              )}
                              <p
                                className={`text-xs ${
                                  alert.type === 'critical'
                                    ? 'text-red-600'
                                    : alert.type === 'warning'
                                    ? 'text-orange-600'
                                    : 'text-blue-600'
                                }`}
                              >
                                {alert.time}
                              </p>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>

                {/* Activity Timeline */}
                <div>
                  <h2 className="text-[#2D6A4F] mb-4">{t('dashboard.recentActivity')}</h2>
                  <Card className="p-4">
                    {activities.length === 0 ? (
                      <div className="text-center py-6">
                        <Clock className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">{t('dashboard.noActivities')}</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {activities.map((activity, index) => (
                          <div key={index} className="flex gap-3">
                            <div className="w-8 h-8 bg-[#2D6A4F]/10 rounded-full flex items-center justify-center flex-shrink-0">
                              <Clock className="w-4 h-4 text-[#2D6A4F]" />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm text-gray-900 font-medium">{activity.action}</p>
                              {activity.detail && (
                                <p className="text-xs text-gray-600 mt-1">{activity.detail}</p>
                              )}
                              <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </Card>
                </div>
              </div>
            </div>

      {/* Add Crop Dialog */}
      <AddCropDialog 
        open={showAddCropDialog}
        onOpenChange={setShowAddCropDialog}
        onCropAdded={handleCropAdded}
      />
    </>
  );
}

// My Crops Page Component
function MyCropsPage({ user }: { user: any }) {
  const { t } = useLanguage();
  const [crops, setCrops] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'low' | 'critical' | 'good'>('all');
  const [showAddCropDialog, setShowAddCropDialog] = useState(false);
  const [showEditCropDialog, setShowEditCropDialog] = useState(false);
  const [selectedCrop, setSelectedCrop] = useState<any>(null);

  const defaultCrops = [
    { name: t('dashboard.data.wheat'), stock: 80, quantity: `2 ${t('dashboard.data.tons')}`, status: 'Good', color: '#2D6A4F', lastUpdated: `3 ${t('dashboard.data.timeHoursAgo')}` },
    { name: t('dashboard.data.corn'), stock: 45, quantity: `1.2 ${t('dashboard.data.tons')}`, status: 'Low', color: '#BC6C25', lastUpdated: `1 ${t('dashboard.data.timeDayAgo')}` },
    { name: t('dashboard.data.rice'), stock: 90, quantity: `3.5 ${t('dashboard.data.tons')}`, status: 'Good', color: '#2D6A4F', lastUpdated: `2 ${t('dashboard.data.timeDaysAgo')}` },
    { name: t('dashboard.data.soybeans'), stock: 25, quantity: `0.8 ${t('dashboard.data.tons')}`, status: 'Critical', color: '#ef4444', lastUpdated: `5 ${t('dashboard.data.timeHoursAgo')}` },
  ];

  useEffect(() => {
    loadCrops();
    
    // Listen for crop updates from other components
    const handleCropsUpdated = () => {
      loadCrops();
    };
    window.addEventListener('cropsUpdated', handleCropsUpdated);

    return () => {
      window.removeEventListener('cropsUpdated', handleCropsUpdated);
    };
  }, []);

  const loadCrops = async () => {
    try {
      setIsLoading(true);
      const data: any = await cropsApi.getAll();
      
      if (data.crops && data.crops.length > 0) {
        const cropsWithColors = data.crops.map((crop: any) => ({
          ...crop,
          color: crop.stock <= 25 ? '#ef4444' : crop.stock <= 50 ? '#BC6C25' : '#2D6A4F',
          lastUpdated: `${Math.floor(Math.random() * 24)} ${t('dashboard.data.timeHoursAgo')}`,
        }));
        setCrops(cropsWithColors);
        // Dispatch event to notify other components
        window.dispatchEvent(new CustomEvent('cropsUpdated'));
      } else {
        setCrops(defaultCrops);
      }
    } catch (error) {
      console.error('Error loading crops:', error);
      setCrops(defaultCrops);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredCrops = crops.filter(crop => {
    if (filter === 'low') return crop.stock <= 50 && crop.stock > 25;
    if (filter === 'critical') return crop.stock <= 25;
    if (filter === 'good') return crop.stock > 50;
    return true;
  });

  const getStatusTranslation = (status: string) => {
    const statusMap: { [key: string]: string } = {
      'Good': t('dashboard.good'),
      'Low': t('dashboard.low'),
      'Critical': t('dashboard.critical'),
    };
    return statusMap[status] || status;
  };

  return (
    <>
      <div className="mb-8">
        <h1 className="text-[#2D6A4F] mb-2">{t('crops.title')}</h1>
        <p className="text-gray-600">{t('crops.subtitle')}</p>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6">
        <Button
          variant={filter === 'all' ? 'default' : 'outline'}
          onClick={() => setFilter('all')}
          className={filter === 'all' ? 'bg-[#2D6A4F] hover:bg-[#2D6A4F]/90' : ''}
        >
          {t('crops.filterAll')} ({crops.length})
        </Button>
        <Button
          variant={filter === 'good' ? 'default' : 'outline'}
          onClick={() => setFilter('good')}
          className={filter === 'good' ? 'bg-[#2D6A4F] hover:bg-[#2D6A4F]/90' : ''}
        >
          {t('crops.filterGood')} ({crops.filter(c => c.stock > 50).length})
        </Button>
        <Button
          variant={filter === 'low' ? 'default' : 'outline'}
          onClick={() => setFilter('low')}
          className={filter === 'low' ? 'bg-[#BC6C25] hover:bg-[#BC6C25]/90' : ''}
        >
          {t('crops.filterLow')} ({crops.filter(c => c.stock <= 50 && c.stock > 25).length})
        </Button>
        <Button
          variant={filter === 'critical' ? 'default' : 'outline'}
          onClick={() => setFilter('critical')}
          className={filter === 'critical' ? 'bg-red-600 hover:bg-red-700' : ''}
        >
          {t('crops.filterCritical')} ({crops.filter(c => c.stock <= 25).length})
        </Button>
        <Button
          onClick={() => setShowAddCropDialog(true)}
          className="ml-auto bg-[#2D6A4F] hover:bg-[#2D6A4F]/90"
        >
          {t('dashboard.addCrop')}
        </Button>
      </div>

      {/* Crops Grid */}
      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/4"></div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCrops.map((crop, index) => (
            <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${crop.color}20` }}
                  >
                    <Sprout className="w-6 h-6" style={{ color: crop.color }} />
                  </div>
                  <div>
                    <p className="text-gray-900">{crop.name}</p>
                    <p className="text-sm text-gray-600">{crop.quantity}</p>
                  </div>
                </div>
                <Badge
                  variant={
                    crop.status === 'Critical'
                      ? 'destructive'
                      : crop.status === 'Low'
                      ? 'outline'
                      : 'default'
                  }
                  className={
                    crop.status === 'Good'
                      ? 'bg-green-100 text-green-800 hover:bg-green-100'
                      : ''
                  }
                >
                  {getStatusTranslation(crop.status)}
                </Badge>
              </div>
              
              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">{t('dashboard.stockLevel')}</span>
                  <span className="text-gray-900">{crop.stock}%</span>
                </div>
                <Progress value={crop.stock} className="h-2" />
              </div>

              <div className="text-xs text-gray-500 mb-4">
                {t('crops.lastUpdated')}: {crop.lastUpdated}
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => {
                    setSelectedCrop(crop);
                    setShowEditCropDialog(true);
                  }}
                >
                  <Pencil className="w-4 h-4 mr-2" />
                  {t('crops.editCrop')}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <AddCropDialog 
        open={showAddCropDialog}
        onOpenChange={setShowAddCropDialog}
        onCropAdded={loadCrops}
      />
      <EditCropDialog 
        open={showEditCropDialog}
        onOpenChange={setShowEditCropDialog}
        onCropUpdated={loadCrops}
        crop={selectedCrop}
      />
    </>
  );
}

// Notifications Page Component
function NotificationsPage() {
  const { t } = useLanguage();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [crops, setCrops] = useState<any[]>([]);

  useEffect(() => {
    loadCropsAndGenerateNotifications();
    
    // Auto-refresh notifications every 30 seconds
    const interval = setInterval(() => {
      loadCropsAndGenerateNotifications();
    }, 30000); // 30 seconds

    // Listen for crop updates from other components
    const handleCropsUpdated = () => {
      loadCropsAndGenerateNotifications();
    };
    window.addEventListener('cropsUpdated', handleCropsUpdated);
    
    // Also refresh when window gains focus
    const handleFocus = () => {
      loadCropsAndGenerateNotifications();
    };
    window.addEventListener('focus', handleFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('cropsUpdated', handleCropsUpdated);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  const loadCropsAndGenerateNotifications = async () => {
    try {
      setIsLoading(true);
      const data: any = await cropsApi.getAll();
      
      if (data.crops && data.crops.length > 0) {
        setCrops(data.crops);
        generateNotificationsFromCrops(data.crops);
      } else {
        // No crops - show empty state or default notifications
        setNotifications([]);
      }
    } catch (error) {
      console.error('Error loading crops:', error);
      setNotifications([]);
    } finally {
      setIsLoading(false);
    }
  };

  const generateNotificationsFromCrops = (cropsData: any[]) => {
    const generatedNotifications: any[] = [];
    const now = new Date();

    cropsData.forEach((crop, index) => {
      const stock = crop.stock || 0;
      const cropName = crop.name || 'Unknown Crop';
      
      // Critical stock notifications (≤ 25%)
      if (stock <= 25) {
        generatedNotifications.push({
          id: `critical-${crop.id || index}`,
          type: 'critical',
          title: t('notifications.stockAlert'),
          message: `${cropName} ${t('notifications.criticalStock')} - ${stock}% ${t('notifications.remaining')}`,
          time: formatTimeAgo(crop.updatedAt || crop.createdAt),
          read: false,
          category: getCategoryFromDate(crop.updatedAt || crop.createdAt),
          cropId: crop.id,
          cropName: cropName,
          stock: stock,
        });
      }
      // Low stock notifications (26-50%)
      else if (stock <= 50) {
        generatedNotifications.push({
          id: `low-${crop.id || index}`,
          type: 'warning',
          title: t('notifications.stockAlert'),
          message: `${cropName} ${t('notifications.lowStock')} - ${stock}% ${t('notifications.remaining')}`,
          time: formatTimeAgo(crop.updatedAt || crop.createdAt),
          read: false,
          category: getCategoryFromDate(crop.updatedAt || crop.createdAt),
          cropId: crop.id,
          cropName: cropName,
          stock: stock,
        });
      }
      // Good stock notifications (optional - for positive feedback)
      else if (stock > 50 && stock <= 75) {
        generatedNotifications.push({
          id: `good-${crop.id || index}`,
          type: 'info',
          title: t('notifications.stockStatus'),
          message: `${cropName} ${t('notifications.goodStock')} - ${stock}% ${t('notifications.remaining')}`,
          time: formatTimeAgo(crop.updatedAt || crop.createdAt),
          read: true,
          category: getCategoryFromDate(crop.updatedAt || crop.createdAt),
          cropId: crop.id,
          cropName: cropName,
          stock: stock,
        });
      }
    });

    // Sort by date (most recent first) - use the original crop dates
    generatedNotifications.sort((a, b) => {
      // Find the original crop dates for proper sorting
      const cropA = cropsData.find(c => c.id === a.cropId);
      const cropB = cropsData.find(c => c.id === b.cropId);
      const dateA = cropA ? new Date(cropA.updatedAt || cropA.createdAt).getTime() : 0;
      const dateB = cropB ? new Date(cropB.updatedAt || cropB.createdAt).getTime() : 0;
      return dateB - dateA;
    });

    setNotifications(generatedNotifications);
  };

  const formatTimeAgo = (dateString: string) => {
    if (!dateString) return t('notifications.recent');
    
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) {
      return t('notifications.justNow');
    } else if (diffHours < 24) {
      return `${diffHours} ${t('dashboard.data.timeHoursAgo')}`;
    } else if (diffDays === 1) {
      return `1 ${t('dashboard.data.timeDayAgo')}`;
    } else if (diffDays < 7) {
      return `${diffDays} ${t('dashboard.data.timeDaysAgo')}`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const getCategoryFromDate = (dateString: string): 'today' | 'yesterday' | 'older' => {
    if (!dateString) return 'older';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays === 0) return 'today';
    if (diffDays === 1) return 'yesterday';
    return 'older';
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
    notify.success(t('notifications.markAllRead'), 'All notifications marked as read');
  };

  const clearAll = () => {
    setNotifications([]);
    notify.success(t('notifications.clearAll'), 'All notifications cleared');
  };

  const markAsRead = (id: string) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  };

  const groupedNotifications = {
    today: notifications.filter(n => n.category === 'today'),
    yesterday: notifications.filter(n => n.category === 'yesterday'),
    older: notifications.filter(n => n.category === 'older'),
  };

  return (
    <>
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-[#2D6A4F]">{t('notifications.title')}</h1>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={loadCropsAndGenerateNotifications}
              disabled={isLoading}
            >
              {isLoading ? t('notifications.loading') : t('notifications.refresh')}
            </Button>
            <Button variant="outline" size="sm" onClick={markAllAsRead}>
              {t('notifications.markAllRead')}
            </Button>
            <Button variant="outline" size="sm" onClick={clearAll}>
              {t('notifications.clearAll')}
            </Button>
          </div>
        </div>
        <p className="text-gray-600">{t('notifications.subtitle')}</p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="p-4 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
            </Card>
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <Card className="p-12 text-center">
          <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-gray-900 mb-2">{t('notifications.noNotifications')}</h3>
          <p className="text-gray-600 text-sm">{t('notifications.noNotificationsDesc')}</p>
          {crops.length === 0 && (
            <p className="text-gray-500 text-sm mt-2">
              {t('notifications.addCropsHint')}
            </p>
          )}
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Today */}
          {groupedNotifications.today.length > 0 && (
            <div>
              <h3 className="text-gray-700 mb-3">{t('notifications.today')}</h3>
              <div className="space-y-2">
                {groupedNotifications.today.map((notification) => (
                  <Card
                    key={notification.id}
                    onClick={() => markAsRead(notification.id)}
                    className={`p-4 cursor-pointer hover:shadow-md transition-shadow ${
                      !notification.read ? 'border-l-4 border-l-[#2D6A4F]' : ''
                    } ${
                      notification.type === 'critical'
                        ? 'bg-red-50'
                        : notification.type === 'warning'
                        ? 'bg-orange-50'
                        : 'bg-blue-50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <AlertTriangle
                        className={`w-5 h-5 flex-shrink-0 ${
                          notification.type === 'critical'
                            ? 'text-red-600'
                            : notification.type === 'warning'
                            ? 'text-orange-600'
                            : 'text-blue-600'
                        }`}
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-gray-900 font-medium">{notification.title}</p>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-[#2D6A4F] rounded-full"></div>
                          )}
                        </div>
                        <p className="text-sm text-gray-700 mb-2">{notification.message}</p>
                        {notification.cropName && (
                          <div className="flex items-center gap-2 mb-2">
                            <Sprout className="w-4 h-4 text-[#2D6A4F]" />
                            <span className="text-xs text-gray-600">{notification.cropName}</span>
                            {notification.stock !== undefined && (
                              <Badge 
                                variant="outline" 
                                className={`text-xs ${
                                  notification.stock <= 25 
                                    ? 'border-red-300 text-red-700' 
                                    : notification.stock <= 50
                                    ? 'border-orange-300 text-orange-700'
                                    : 'border-green-300 text-green-700'
                                }`}
                              >
                                {notification.stock}%
                              </Badge>
                            )}
                          </div>
                        )}
                        <p className="text-xs text-gray-500">{notification.time}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Yesterday */}
          {groupedNotifications.yesterday.length > 0 && (
            <div>
              <h3 className="text-gray-700 mb-3">{t('notifications.yesterday')}</h3>
              <div className="space-y-2">
                {groupedNotifications.yesterday.map((notification) => (
                  <Card
                    key={notification.id}
                    onClick={() => markAsRead(notification.id)}
                    className={`p-4 cursor-pointer hover:shadow-md transition-shadow ${
                      notification.type === 'critical'
                        ? 'bg-red-50/50'
                        : notification.type === 'warning'
                        ? 'bg-orange-50/50'
                        : 'bg-blue-50/50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <AlertTriangle
                        className={`w-5 h-5 flex-shrink-0 ${
                          notification.type === 'critical'
                            ? 'text-red-500'
                            : notification.type === 'warning'
                            ? 'text-orange-500'
                            : 'text-blue-500'
                        }`}
                      />
                      <div className="flex-1">
                        <p className="text-gray-900 mb-1 font-medium">{notification.title}</p>
                        <p className="text-sm text-gray-700 mb-2">{notification.message}</p>
                        {notification.cropName && (
                          <div className="flex items-center gap-2 mb-2">
                            <Sprout className="w-4 h-4 text-[#2D6A4F]" />
                            <span className="text-xs text-gray-600">{notification.cropName}</span>
                            {notification.stock !== undefined && (
                              <Badge variant="outline" className="text-xs">
                                {notification.stock}%
                              </Badge>
                            )}
                          </div>
                        )}
                        <p className="text-xs text-gray-500">{notification.time}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Older */}
          {groupedNotifications.older.length > 0 && (
            <div>
              <h3 className="text-gray-700 mb-3">{t('notifications.older')}</h3>
              <div className="space-y-2">
                {groupedNotifications.older.map((notification) => (
                  <Card
                    key={notification.id}
                    onClick={() => markAsRead(notification.id)}
                    className="p-4 cursor-pointer hover:shadow-md transition-shadow opacity-75"
                  >
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-gray-400 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-gray-900 mb-1">{notification.title}</p>
                        <p className="text-sm text-gray-700 mb-2">{notification.message}</p>
                        {notification.cropName && (
                          <div className="flex items-center gap-2 mb-2">
                            <Sprout className="w-4 h-4 text-gray-400" />
                            <span className="text-xs text-gray-500">{notification.cropName}</span>
                            {notification.stock !== undefined && (
                              <Badge variant="outline" className="text-xs border-gray-300">
                                {notification.stock}%
                              </Badge>
                            )}
                          </div>
                        )}
                        <p className="text-xs text-gray-500">{notification.time}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}

// Settings Page Component
function SettingsPage({ user }: { user: any }) {
  const { t, language, setLanguage } = useLanguage();
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [stockAlerts, setStockAlerts] = useState(true);
  const [marketUpdates, setMarketUpdates] = useState(true);
  const [aiRecommendations, setAiRecommendations] = useState(true);

  const saveSettings = () => {
    notify.success(t('settings.changesSaved'), t('settings.changesSavedDesc'));
  };

  return (
    <>
      <div className="mb-8">
        <h1 className="text-[#2D6A4F] mb-2">{t('settings.title')}</h1>
        <p className="text-gray-600">{t('settings.subtitle')}</p>
      </div>

      <div className="space-y-6">
        {/* Account Settings */}
        <Card className="p-6">
          <h2 className="text-[#2D6A4F] mb-4">{t('settings.accountSettings')}</h2>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-600">{t('profile.fullName')}</label>
              <p className="text-gray-900">{user?.fullName || 'Not set'}</p>
            </div>
            <div>
              <label className="text-sm text-gray-600">{t('profile.email')}</label>
              <p className="text-gray-900">{user?.email || 'Not set'}</p>
            </div>
            <Link to="/profile">
              <Button variant="outline" className="rounded-full">
                {t('profile.editProfile')}
              </Button>
            </Link>
          </div>
        </Card>

        {/* Language Settings */}
        <Card className="p-6">
          <h2 className="text-[#2D6A4F] mb-4">{t('settings.languageSettings')}</h2>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-600 mb-2 block">
                {t('settings.currentLanguage')}
              </label>
              <div className="flex gap-2">
                <Button
                  variant={language === 'en' ? 'default' : 'outline'}
                  onClick={() => setLanguage('en')}
                  className={language === 'en' ? 'bg-[#2D6A4F] hover:bg-[#2D6A4F]/90' : ''}
                >
                  English
                </Button>
                <Button
                  variant={language === 'ar' ? 'default' : 'outline'}
                  onClick={() => setLanguage('ar')}
                  className={language === 'ar' ? 'bg-[#2D6A4F] hover:bg-[#2D6A4F]/90' : ''}
                >
                  العربية
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Notification Preferences */}
        <Card className="p-6">
          <h2 className="text-[#2D6A4F] mb-4">{t('settings.notificationSettings')}</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-900">{t('settings.emailNotifications')}</p>
                <p className="text-sm text-gray-600">{t('settings.emailNotificationsDesc')}</p>
              </div>
              <Button
                variant={emailNotifications ? 'default' : 'outline'}
                size="sm"
                onClick={() => setEmailNotifications(!emailNotifications)}
                className={emailNotifications ? 'bg-[#2D6A4F] hover:bg-[#2D6A4F]/90' : ''}
              >
                {emailNotifications ? 'ON' : 'OFF'}
              </Button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-900">{t('settings.pushNotifications')}</p>
                <p className="text-sm text-gray-600">{t('settings.pushNotificationsDesc')}</p>
              </div>
              <Button
                variant={pushNotifications ? 'default' : 'outline'}
                size="sm"
                onClick={() => setPushNotifications(!pushNotifications)}
                className={pushNotifications ? 'bg-[#2D6A4F] hover:bg-[#2D6A4F]/90' : ''}
              >
                {pushNotifications ? 'ON' : 'OFF'}
              </Button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-900">{t('settings.stockAlerts')}</p>
                <p className="text-sm text-gray-600">{t('settings.stockAlertsDesc')}</p>
              </div>
              <Button
                variant={stockAlerts ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStockAlerts(!stockAlerts)}
                className={stockAlerts ? 'bg-[#2D6A4F] hover:bg-[#2D6A4F]/90' : ''}
              >
                {stockAlerts ? 'ON' : 'OFF'}
              </Button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-900">{t('settings.marketUpdates')}</p>
                <p className="text-sm text-gray-600">{t('settings.marketUpdatesDesc')}</p>
              </div>
              <Button
                variant={marketUpdates ? 'default' : 'outline'}
                size="sm"
                onClick={() => setMarketUpdates(!marketUpdates)}
                className={marketUpdates ? 'bg-[#2D6A4F] hover:bg-[#2D6A4F]/90' : ''}
              >
                {marketUpdates ? 'ON' : 'OFF'}
              </Button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-900">{t('settings.aiRecommendations')}</p>
                <p className="text-sm text-gray-600">{t('settings.aiRecommendationsDesc')}</p>
              </div>
              <Button
                variant={aiRecommendations ? 'default' : 'outline'}
                size="sm"
                onClick={() => setAiRecommendations(!aiRecommendations)}
                className={aiRecommendations ? 'bg-[#2D6A4F] hover:bg-[#2D6A4F]/90' : ''}
              >
                {aiRecommendations ? 'ON' : 'OFF'}
              </Button>
            </div>
          </div>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button 
            onClick={saveSettings}
            className="bg-[#2D6A4F] hover:bg-[#2D6A4F]/90 rounded-full px-8"
          >
            {t('settings.saveChanges')}
          </Button>
        </div>
      </div>
    </>
  );
}

