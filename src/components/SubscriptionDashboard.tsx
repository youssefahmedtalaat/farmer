import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { CheckCircle2, Calendar, CreditCard, Package, Crown, Sparkles } from 'lucide-react';
import { subscriptionApi } from '../utils/api';
import { notify } from '../utils/notifications';
import { useLanguage } from '../utils/language';

interface Subscription {
  planName: string;
  price: number;
  duration: string;
  status: string;
  startDate: string;
  endDate: string;
  trialEndsAt?: string;
}

export function SubscriptionDashboard() {
  const location = useLocation();
  const { t, language } = useLanguage();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const justSubscribed = location.state?.justSubscribed;

  useEffect(() => {
    loadSubscription();
  }, []);

  useEffect(() => {
    // Show success message if just subscribed
    if (justSubscribed) {
      notify.success(
        t('subscriptionDashboard.welcome'),
        t('subscriptionDashboard.welcomeDesc')
      );
      
      // Clear the state
      window.history.replaceState({}, document.title);
    }
  }, [justSubscribed, t]);

  const loadSubscription = async () => {
    try {
      const data: any = await subscriptionApi.get();
      setSubscription(data.subscription);
    } catch (error) {
      // Error loading subscription
    } finally {
      setLoading(false);
    }
  };


  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500';
      case 'trial':
        return 'bg-blue-500';
      case 'expired':
        return 'bg-red-500';
      case 'cancelled':
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getPlanIcon = (planName: string) => {
    if (planName?.toLowerCase().includes('premium')) {
      return <Crown className="w-6 h-6 text-[#BC6C25]" />;
    } else if (planName?.toLowerCase().includes('pro')) {
      return <Sparkles className="w-6 h-6 text-[#2D6A4F]" />;
    }
    return <Package className="w-6 h-6 text-gray-600" />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2D6A4F]"></div>
      </div>
    );
  }

  if (!subscription) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CreditCard className="w-8 h-8 text-gray-400" />
          </div>
          <h2 className="text-[#2D6A4F] mb-2">{t('subscriptionDashboard.noSubscription')}</h2>
          <p className="text-gray-600 mb-6">
            {t('subscriptionDashboard.noSubscriptionDesc')}
          </p>
          <Button
            onClick={() => window.location.href = '/subscription'}
            className="bg-[#2D6A4F] hover:bg-[#2D6A4F]/90 rounded-full"
          >
            {t('subscriptionDashboard.viewPlans')}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-[#2D6A4F] mb-2">{t('subscriptionDashboard.title')}</h1>
        <p className="text-gray-600">{t('subscriptionDashboard.subtitle')}</p>
      </div>

      {/* Current Plan Card */}
      <Card className="overflow-hidden">
        <div className={`p-6 bg-gradient-to-r ${
          subscription.planName?.toLowerCase().includes('premium')
            ? 'from-[#BC6C25] to-[#2D6A4F]'
            : subscription.planName?.toLowerCase().includes('pro')
            ? 'from-[#2D6A4F] to-[#95D5B2]'
            : 'from-gray-600 to-gray-800'
        }`}>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                {getPlanIcon(subscription.planName)}
              </div>
              <div className="text-white">
                <h2 className="text-white mb-1">{subscription.planName || t('plan.basic.name')} {t('subscriptionDashboard.plan')}</h2>
                <p className="text-white/80 text-sm">{subscription.duration || t('subscriptionDashboard.monthly')} {t('subscriptionDashboard.subscription')}</p>
              </div>
            </div>
            <Badge className={`${getStatusColor(subscription.status || 'active')} text-white hover:${getStatusColor(subscription.status || 'active')}`}>
              {subscription.status ? t(`subscriptionDashboard.status.${subscription.status}`) : t('subscriptionDashboard.status.active')}
            </Badge>
          </div>

          <div className="mt-6 flex items-baseline gap-2">
            <span className="text-white text-4xl">{subscription.price || 0} EGP</span>
            <span className="text-white/80">/ {subscription.duration || 'month'}</span>
          </div>
        </div>

        <div className="p-6 space-y-4">
          {/* Subscription Details */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-[#2D6A4F] mt-0.5" />
              <div>
                <p className="text-sm text-gray-600">{t('subscriptionDashboard.startDate')}</p>
                <p className="text-gray-900">{subscription.startDate ? formatDate(subscription.startDate) : t('subscriptionDashboard.notAvailable')}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-[#2D6A4F] mt-0.5" />
              <div>
                <p className="text-sm text-gray-600">{t('subscriptionDashboard.endDate')}</p>
                <p className="text-gray-900">{subscription.endDate ? formatDate(subscription.endDate) : t('subscriptionDashboard.notAvailable')}</p>
              </div>
            </div>
          </div>

          {/* Trial Info */}
          {subscription.status === 'trial' && subscription.trialEndsAt && (
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-blue-900">{t('subscriptionDashboard.trialActive')}</p>
                  <p className="text-sm text-blue-700">
                    {t('subscriptionDashboard.trialEnds').replace('{date}', formatDate(subscription.trialEndsAt))}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Features Card */}
      <Card className="p-6">
        <h3 className="text-[#2D6A4F] mb-4">{t('subscriptionDashboard.planFeatures')}</h3>
        <div className="grid md:grid-cols-2 gap-4">
          {subscription.planName?.toLowerCase().includes('premium') && (
            <>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#2D6A4F]" />
                <span className="text-gray-700">{t('subscriptionDashboard.feature.aiRecommendations')}</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#2D6A4F]" />
                <span className="text-gray-700">{t('subscriptionDashboard.feature.unlimitedCrops')}</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#2D6A4F]" />
                <span className="text-gray-700">{t('subscriptionDashboard.feature.prioritySupport')}</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#2D6A4F]" />
                <span className="text-gray-700">{t('subscriptionDashboard.feature.predictiveAnalytics')}</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#2D6A4F]" />
                <span className="text-gray-700">{t('subscriptionDashboard.feature.customIntegrations')}</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#2D6A4F]" />
                <span className="text-gray-700">{t('subscriptionDashboard.feature.earlyAccess')}</span>
              </div>
            </>
          )}

          {subscription.planName?.toLowerCase().includes('pro') && !subscription.planName?.toLowerCase().includes('premium') && (
            <>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#2D6A4F]" />
                <span className="text-gray-700">{t('subscriptionDashboard.feature.advancedAnalytics')}</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#2D6A4F]" />
                <span className="text-gray-700">{t('subscriptionDashboard.feature.unlimitedCrops')}</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#2D6A4F]" />
                <span className="text-gray-700">{t('subscriptionDashboard.feature.weatherIntegration')}</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#2D6A4F]" />
                <span className="text-gray-700">{t('subscriptionDashboard.feature.prioritySupport')}</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#2D6A4F]" />
                <span className="text-gray-700">{t('subscriptionDashboard.feature.marketInsights')}</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#2D6A4F]" />
                <span className="text-gray-700">{t('subscriptionDashboard.feature.exportReports')}</span>
              </div>
            </>
          )}

          {subscription.planName?.toLowerCase().includes('basic') && (
            <>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#2D6A4F]" />
                <span className="text-gray-700">{t('subscriptionDashboard.feature.basicNotifications')}</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#2D6A4F]" />
                <span className="text-gray-700">{t('subscriptionDashboard.feature.cropTracking')}</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#2D6A4F]" />
                <span className="text-gray-700">{t('subscriptionDashboard.feature.emailSupport')}</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#2D6A4F]" />
                <span className="text-gray-700">{t('subscriptionDashboard.feature.stockMonitoring')}</span>
              </div>
            </>
          )}
        </div>
      </Card>

      {/* Actions */}
      <Card className="p-6">
        <h3 className="text-[#2D6A4F] mb-4">{t('subscriptionDashboard.manageSubscription')}</h3>
        <div className="flex flex-wrap gap-3">
          <Button
            onClick={() => window.location.href = '/subscription'}
            variant="outline"
            className="border-2 border-[#2D6A4F] text-[#2D6A4F] hover:bg-[#2D6A4F] hover:text-white rounded-full"
          >
            {t('subscriptionDashboard.changePlan')}
          </Button>
        </div>
      </Card>
    </div>
  );
}
