import { useState, useEffect } from 'react';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { Avatar, AvatarImage, AvatarFallback } from '../components/ui/avatar';
import {
  Users,
  CreditCard,
  TrendingUp,
  Package,
  Crown,
  Sparkles,
  BarChart3,
  Sprout,
  DollarSign,
} from 'lucide-react';
import { useLanguage } from '../utils/language';
import { cropsApi, subscriptionApi, profileApi } from '../utils/api';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../components/ui/dialog';

export function FarmersSubscriptions() {
  const { t } = useLanguage();
  const [farmers, setFarmers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFarmer, setSelectedFarmer] = useState<any>(null);
  const [showProfitDialog, setShowProfitDialog] = useState(false);
  const [farmerCrops, setFarmerCrops] = useState<any[]>([]);
  const [isLoadingCrops, setIsLoadingCrops] = useState(false);
  const [stats, setStats] = useState({
    totalFarmers: 0,
    subscribedFarmers: 0,
    totalRevenue: 0, // Fixed: Now calculated from actual subscription prices
    totalProfit: 0,
    basicPlan: 0,
    proPlan: 0,
    premiumPlan: 0,
  });

  // Calculate profit for a crop
  const calculateProfit = (crop: any): { total: number; perUnit: number } => {
    const quantityMatch = crop.quantity?.match(/([\d.]+)/);
    const quantity = quantityMatch ? parseFloat(quantityMatch[1]) : 0;
    
    const cropPrices: { [key: string]: number } = {
      'wheat': 8500, 'corn': 7200, 'rice': 12000, 'soybeans': 9500, 'soybean': 9500,
      'tomato': 15000, 'tomatoes': 15000, 'lettuce': 8000, 'carrot': 10000, 'carrots': 10000,
      'green beans': 12000, 'greenbeans': 12000, 'green bean': 12000,
      'potato': 6000, 'potatoes': 6000, 'onion': 7000, 'onions': 7000,
      'cucumber': 9000, 'cucumbers': 9000,
    };
    
    const cropNameKey = (crop.name || '').toLowerCase().trim();
    const pricePerTon = cropPrices[cropNameKey] || 8000;
    const revenue = quantity * pricePerTon;
    const cost = revenue * 0.7;
    const profit = revenue - cost;
    const profitPerUnit = quantity > 0 ? profit / quantity : 0;
    
    return {
      total: Math.round(profit),
      perUnit: Math.round(profitPerUnit),
    };
  };

  useEffect(() => {
    loadFarmersData();
  }, []);

  const loadFarmersData = async () => {
    setIsLoading(true);
    try {
      // Fetch all users and all subscriptions in parallel
      const [usersData, subscriptionsData] = await Promise.all([
        profileApi.getAll().catch(() => ({ users: [] })),
        subscriptionApi.getAll().catch(() => ({ subscriptions: [] }))
      ]);

      const allUsers = usersData.users || [];
      const allSubscriptions = subscriptionsData.subscriptions || [];

      // Create a map of subscriptions by userId for quick lookup
      const subscriptionMap = new Map();
      allSubscriptions.forEach((sub: any) => {
        subscriptionMap.set(sub.userId, {
          planName: sub.planName,
          price: sub.price || 0,
          duration: sub.duration,
          status: sub.status,
          endDate: sub.endDate, // Include endDate to check if subscription is expired
        });
      });

      // Map all users to farmers format, merging with subscription data
      const farmersFromApi = allUsers.map((user: any) => ({
        id: user.id,
        fullName: user.fullName || 'Unknown',
        email: user.email || '',
        profileImage: user.profileImage || '',
        subscription: subscriptionMap.get(user.id) || null,
        totalProfit: 0, // Will be calculated from crops
      }));
          
      // Calculate profit for each farmer from their crops (in parallel for better performance)
      await Promise.all(
        farmersFromApi.map(async (farmer) => {
          try {
            const cropsData = await cropsApi.getByUserId(farmer.id);
            if (cropsData.crops && cropsData.crops.length > 0) {
              // Sum up profit from all crops
              const totalProfit = cropsData.crops.reduce((sum: number, crop: any) => {
                const cropProfit = calculateProfit(crop).total;
                return sum + cropProfit;
              }, 0);
              farmer.totalProfit = totalProfit;
            } else {
              farmer.totalProfit = 0;
            }
          } catch (error) {
            console.error(`Error fetching crops for farmer ${farmer.id}:`, error);
            farmer.totalProfit = 0;
          }
        })
      );
          
      setFarmers(farmersFromApi);
          
      // Calculate statistics
      // Count all farmers with subscriptions that are active and not expired
      const now = new Date();
      const subscribed = farmersFromApi.filter(f => {
        if (!f.subscription) return false;
        
        // Check if subscription status is active or trial
        const isActiveStatus = f.subscription.status === 'active' || f.subscription.status === 'trial';
        
        // Check if subscription hasn't expired (endDate hasn't passed)
        if (f.subscription.endDate) {
          const endDate = new Date(f.subscription.endDate);
          if (endDate < now) {
            return false; // Subscription has expired/finished
          }
        }
        
        return isActiveStatus;
      });
          
      // Case-insensitive plan name matching
      const basic = subscribed.filter(f => {
        const planName = (f.subscription?.planName || '').toLowerCase();
        return planName.includes('basic');
      });
          
      const pro = subscribed.filter(f => {
        const planName = (f.subscription?.planName || '').toLowerCase();
        return planName.includes('pro') && !planName.includes('premium');
      });
          
      const premium = subscribed.filter(f => {
        const planName = (f.subscription?.planName || '').toLowerCase();
        return planName.includes('premium');
      });
          
      // Calculate total revenue from actual subscription prices
      // Only includes subscriptions that are active/trial and not expired
      // Revenue equals the sum of subscription prices for currently active subscriptions
      const totalRevenue = subscribed.reduce((sum, f) => {
        return sum + (f.subscription?.price || 0);
      }, 0);
          
      const totalProfit = farmersFromApi.reduce((sum, f) => sum + (f.totalProfit || 0), 0);
          
      setStats({
        totalFarmers: farmersFromApi.length,
        subscribedFarmers: subscribed.length,
        totalRevenue: totalRevenue, // Now uses actual prices
        totalProfit: totalProfit,
        basicPlan: basic.length,
        proPlan: pro.length,
        premiumPlan: premium.length,
      });
    } catch (error) {
      console.error('Error loading farmers data:', error);
      // If API fails, set empty arrays
      setFarmers([]);
      setStats({
        totalFarmers: 0,
        subscribedFarmers: 0,
        totalRevenue: 0,
        totalProfit: 0,
        basicPlan: 0,
        proPlan: 0,
        premiumPlan: 0,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getPlanColor = (planName: string) => {
    if (planName?.includes('Premium')) return 'from-[#BC6C25] to-[#2D6A4F]';
    if (planName?.includes('Pro')) return 'from-[#edd290] to-[#e6c165]';
    return 'from-[#2D6A4F] to-[#95D5B2]';
  };

  const getPlanIcon = (planName: string) => {
    if (planName?.includes('Premium')) return <Crown className="w-5 h-5" />;
    if (planName?.includes('Pro')) return <Sparkles className="w-5 h-5" />;
    return <Package className="w-5 h-5" />;
  };

  const handleFarmerClick = async (farmer: any) => {
    setSelectedFarmer(farmer);
    setShowProfitDialog(true);
    setIsLoadingCrops(true);
    
    try {
      // Try to fetch crops for this farmer from API
      const data = await cropsApi.getByUserId(farmer.id);
      if (data.crops && data.crops.length > 0) {
        setFarmerCrops(data.crops);
      } else {
        setFarmerCrops([]);
      }
    } catch (error) {
      console.error('Error fetching farmer crops:', error);
      setFarmerCrops([]);
    } finally {
      setIsLoadingCrops(false);
    }
  };

  return (
    <>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-[#2D6A4F] mb-2">{t('admin.dashboard.farmersSubscriptions')}</h1>
        <p className="text-gray-600">{t('admin.farmers.viewAndManage')}</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">{t('admin.dashboard.totalFarmers')}</p>
            <Users className="w-5 h-5 text-[#2D6A4F]" />
          </div>
          <p className="text-gray-900 text-2xl font-semibold">{stats.totalFarmers}</p>
          <p className="text-sm text-gray-600 mt-1">{t('admin.dashboard.registeredUsers')}</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">{t('admin.dashboard.subscribedFarmers')}</p>
            <CreditCard className="w-5 h-5 text-[#2D6A4F]" />
          </div>
          <p className="text-gray-900 text-2xl font-semibold">{stats.subscribedFarmers}</p>
          <p className="text-sm text-green-600 flex items-center gap-1 mt-1">
            <TrendingUp className="w-3 h-3" />
            {t('admin.dashboard.activeSubscriptions')}
          </p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">{t('admin.farmers.subscriptionRevenue')}</p>
            <DollarSign className="w-5 h-5 text-[#2D6A4F]" />
          </div>
          <p className="text-gray-900 text-2xl font-semibold">
            {stats.totalRevenue.toLocaleString()} EGP
          </p>
          <p className="text-sm text-gray-600 mt-1">
            {t('admin.farmers.fromActiveSubscriptions').replace('{count}', stats.subscribedFarmers.toString())}
          </p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">{t('admin.farmers.totalCropProfit')}</p>
            <BarChart3 className="w-5 h-5 text-[#2D6A4F]" />
          </div>
          <p className="text-gray-900 text-2xl font-semibold">
            {stats.totalProfit.toLocaleString()} EGP
          </p>
          <p className="text-sm text-gray-600 mt-1">{t('admin.farmers.fromAllCropSales')}</p>
        </Card>
      </div>

      {/* Summary Section */}
      <Card className="p-6 mb-8 bg-[#2D6A4F] text-white">
        <h2 className="text-xl font-semibold mb-4">{t('admin.farmers.totalProfitSummary')}</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm opacity-90 mb-1">{t('admin.farmers.subscriptionRevenue')}</p>
            <p className="text-3xl font-bold">{stats.totalRevenue.toLocaleString()} EGP</p>
            <p className="text-sm opacity-75 mt-1">{t('admin.farmers.fromActivePayments')}</p>
          </div>
          <div>
            <p className="text-sm opacity-90 mb-1">{t('admin.farmers.cropProfit')}</p>
            <p className="text-3xl font-bold">{stats.totalProfit.toLocaleString()} EGP</p>
            <p className="text-sm opacity-75 mt-1">{t('admin.farmers.fromCropSales')}</p>
          </div>
        </div>
        <div className="mt-6 pt-6 border-t border-white/20">
          <div className="flex items-center justify-between">
            <span className="text-lg font-semibold">{t('admin.farmers.combinedTotal')}</span>
            <span className="text-2xl font-bold">
              {(stats.totalRevenue + stats.totalProfit).toLocaleString()} EGP
            </span>
          </div>
        </div>
      </Card>

      {/* Subscription Plans Breakdown */}
      <Card className="p-6 mb-8">
        <h2 className="text-[#2D6A4F] mb-4">{t('admin.dashboard.subscriptionPlansDistribution')}</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="p-4 bg-[#2D6A4F]/10 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Package className="w-5 h-5 text-[#2D6A4F]" />
              <span className="font-semibold text-[#2D6A4F]">{t('admin.dashboard.basicPlan')}</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.basicPlan}</p>
            <p className="text-sm text-gray-600">{t('admin.dashboard.farmers')}</p>
          </div>
          <div className="p-4 bg-[#edd290]/20 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-[#BC6C25]" />
              <span className="font-semibold text-[#BC6C25]">{t('admin.dashboard.proPlan')}</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.proPlan}</p>
            <p className="text-sm text-gray-600">{t('admin.dashboard.farmers')}</p>
          </div>
          <div className="p-4 bg-[#BC6C25]/10 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Crown className="w-5 h-5 text-[#BC6C25]" />
              <span className="font-semibold text-[#BC6C25]">{t('admin.dashboard.premiumPlan')}</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.premiumPlan}</p>
            <p className="text-sm text-gray-600">{t('admin.dashboard.farmers')}</p>
          </div>
        </div>
      </Card>

      {/* Subscription Revenue Table */}
      <Card className="p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-[#2D6A4F] text-xl font-semibold">{t('admin.farmers.subscriptionRevenue')}</h2>
            <p className="text-sm text-gray-600 mt-1">{t('admin.farmers.revenueDescription')}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">{t('admin.farmers.totalRevenue')}</p>
            <p className="text-2xl font-bold text-[#2D6A4F]">{stats.totalRevenue.toLocaleString()} EGP</p>
          </div>
        </div>
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2D6A4F] mx-auto"></div>
            <p className="text-gray-600 mt-4">{t('admin.dashboard.loadingFarmers')}</p>
          </div>
        ) : farmers.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">{t('admin.dashboard.noFarmers')}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">{t('admin.farmers.farmer')}</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">{t('admin.farmers.email')}</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">{t('admin.farmers.subscriptionPlan')}</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">{t('admin.farmers.subscriptionProfit')}</th>
                </tr>
              </thead>
              <tbody>
                {farmers.map((farmer) => {
                  const subscriptionProfit = farmer.subscription && 
                    (farmer.subscription.status === 'active' || farmer.subscription.status === 'trial') &&
                    (!farmer.subscription.endDate || new Date(farmer.subscription.endDate) >= new Date())
                    ? (farmer.subscription.price || 0)
                    : 0;
                  
                  return (
                    <tr key={farmer.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="w-10 h-10 border-2 border-[#2D6A4F]/20">
                            <AvatarImage src={farmer.profileImage} alt={farmer.fullName || farmer.email} />
                            <AvatarFallback className="bg-gradient-to-br from-[#2D6A4F] to-[#95D5B2] text-white font-semibold text-sm">
                              {(farmer.fullName || farmer.email || 'F')[0].toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium text-gray-900">{farmer.fullName || t('admin.farmers.unknown')}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-600">{farmer.email}</td>
                      <td className="py-4 px-4">
                        {farmer.subscription ? (
                          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-r ${getPlanColor(farmer.subscription.planName)} text-white text-sm`}>
                            {getPlanIcon(farmer.subscription.planName)}
                            <span className="font-semibold">{farmer.subscription.planName}</span>
                            <span className="text-xs opacity-90">({farmer.subscription.duration})</span>
                          </div>
                        ) : (
                          <Badge variant="outline" className="text-gray-500">
                            {t('admin.dashboard.noSubscription')}
                          </Badge>
                        )}
                      </td>
                      <td className="py-4 px-4 text-right">
                        <span className="text-lg font-semibold text-[#2D6A4F]">
                          {subscriptionProfit.toLocaleString()} EGP
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Crop Profit Table */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-[#2D6A4F] text-xl font-semibold">{t('admin.farmers.cropProfit')}</h2>
            <p className="text-sm text-gray-600 mt-1">{t('admin.farmers.cropProfitDescription')}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">{t('admin.farmers.totalCropProfitLabel')}</p>
            <p className="text-2xl font-bold text-[#2D6A4F]">{stats.totalProfit.toLocaleString()} EGP</p>
          </div>
        </div>
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2D6A4F] mx-auto"></div>
            <p className="text-gray-600 mt-4">{t('admin.dashboard.loadingFarmers')}</p>
          </div>
        ) : farmers.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">{t('admin.dashboard.noFarmers')}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">{t('admin.farmers.farmer')}</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">{t('admin.farmers.email')}</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">{t('admin.farmers.cropProfit')}</th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">{t('admin.farmers.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {farmers.map((farmer) => (
                  <tr 
                    key={farmer.id} 
                    className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleFarmerClick(farmer)}
                  >
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10 border-2 border-[#2D6A4F]/20">
                          <AvatarImage src={farmer.profileImage} alt={farmer.fullName || farmer.email} />
                          <AvatarFallback className="bg-gradient-to-br from-[#2D6A4F] to-[#95D5B2] text-white font-semibold text-sm">
                            {(farmer.fullName || farmer.email || 'F')[0].toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium text-gray-900">{farmer.fullName || t('admin.farmers.unknown')}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-600">{farmer.email}</td>
                    <td className="py-4 px-4 text-right">
                      <span className="text-lg font-semibold text-[#2D6A4F]">
                        {farmer.totalProfit?.toLocaleString() || '0'} EGP
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <button 
                        className="text-[#2D6A4F] hover:text-[#1e4a3a] text-sm font-medium"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleFarmerClick(farmer);
                        }}
                      >
                        {t('admin.farmers.viewDetails')}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Profit Distribution Dialog */}
      <Dialog open={showProfitDialog} onOpenChange={setShowProfitDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-[#2D6A4F] text-xl">
              {t('admin.farmers.profitDistribution').replace('{name}', selectedFarmer?.fullName || t('admin.farmers.farmer'))}
            </DialogTitle>
            <DialogDescription>
              {isLoadingCrops ? (
                t('admin.farmers.loadingCrops')
              ) : farmerCrops.length === 0 ? (
                t('admin.farmers.totalProfitZero')
              ) : (
                (() => {
                  // Calculate total profit from displayed crops
                  const totalFromCrops = farmerCrops.reduce((sum: number, crop: any) => {
                    return sum + calculateProfit(crop).total;
                  }, 0);
                  return (
                    <>
                      {t('admin.farmers.totalProfit')} <span className="font-semibold text-[#2D6A4F]">
                        {totalFromCrops.toLocaleString()} EGP
                      </span>
                    </>
                  );
                })()
              )}
            </DialogDescription>
          </DialogHeader>

          {isLoadingCrops ? (
            <div className="py-12 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2D6A4F] mx-auto"></div>
              <p className="text-gray-600 mt-4">{t('admin.farmers.loadingCrops')}</p>
            </div>
          ) : farmerCrops.length === 0 ? (
            <div className="py-12 text-center">
              <Sprout className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">{t('admin.farmers.noCropsFound')}</p>
            </div>
          ) : (
            <div className="space-y-4 mt-4">
              {/* Calculate total profit from all crops */}
              {(() => {
                const cropsWithProfit = farmerCrops.map(crop => ({
                  ...crop,
                  profit: calculateProfit(crop).total,
                }));
                const totalCropProfit = cropsWithProfit.reduce((sum, crop) => sum + crop.profit, 0);
                
                return (
                  <>
                    <div className="grid gap-4">
                      {cropsWithProfit.map((crop) => {
                        const percentage = totalCropProfit > 0 
                          ? ((crop.profit / totalCropProfit) * 100).toFixed(1)
                          : '0';
                        
                        return (
                          <Card key={crop.id} className="p-4">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-[#2D6A4F] to-[#95D5B2] rounded-lg flex items-center justify-center">
                                  <Sprout className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                  <h4 className="font-semibold text-gray-900">{crop.name}</h4>
                                  <p className="text-sm text-gray-600">{crop.quantity}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-lg font-semibold text-[#2D6A4F]">
                                  {crop.profit.toLocaleString()} EGP
                                </p>
                                <p className="text-sm text-gray-600">{percentage}%</p>
                              </div>
                            </div>
                            <Progress 
                              value={parseFloat(percentage)} 
                              className="h-2 mt-2"
                            />
                          </Card>
                        );
                      })}
                    </div>
                  </>
                );
              })()}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

