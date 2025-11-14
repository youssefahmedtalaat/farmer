import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { CheckCircle2, Calendar, CreditCard, Package, Crown, Sparkles } from 'lucide-react';
import { subscriptionApi } from '../utils/api';
import { notify } from '../utils/notifications';

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
        'Welcome to your subscription!',
        'Your subscription is now active. Enjoy all the premium features!'
      );
      
      // Clear the state
      window.history.replaceState({}, document.title);
    }
  }, [justSubscribed]);

  const loadSubscription = async () => {
    try {
      const data: any = await subscriptionApi.get();
      setSubscription(data.subscription);
    } catch (error) {
      console.error('Error loading subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
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
          <h2 className="text-[#2D6A4F] mb-2">No Active Subscription</h2>
          <p className="text-gray-600 mb-6">
            Subscribe to a plan to unlock all features and get AI-powered recommendations.
          </p>
          <Button
            onClick={() => window.location.href = '/subscription'}
            className="bg-[#2D6A4F] hover:bg-[#2D6A4F]/90 rounded-full"
          >
            View Plans
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-[#2D6A4F] mb-2">Subscription</h1>
        <p className="text-gray-600">Manage your subscription and billing information</p>
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
                <h2 className="text-white mb-1">{subscription.planName || 'Basic'} Plan</h2>
                <p className="text-white/80 text-sm">{subscription.duration || 'monthly'} subscription</p>
              </div>
            </div>
            <Badge className={`${getStatusColor(subscription.status || 'active')} text-white hover:${getStatusColor(subscription.status || 'active')}`}>
              {subscription.status ? subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1) : 'Active'}
            </Badge>
          </div>

          <div className="mt-6 flex items-baseline gap-2">
            <span className="text-white text-4xl">${subscription.price || 0}</span>
            <span className="text-white/80">/ {subscription.duration || 'month'}</span>
          </div>
        </div>

        <div className="p-6 space-y-4">
          {/* Subscription Details */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-[#2D6A4F] mt-0.5" />
              <div>
                <p className="text-sm text-gray-600">Start Date</p>
                <p className="text-gray-900">{subscription.startDate ? formatDate(subscription.startDate) : 'N/A'}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-[#2D6A4F] mt-0.5" />
              <div>
                <p className="text-sm text-gray-600">End Date</p>
                <p className="text-gray-900">{subscription.endDate ? formatDate(subscription.endDate) : 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Trial Info */}
          {subscription.status === 'trial' && subscription.trialEndsAt && (
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-blue-900">7-Day Free Trial Active</p>
                  <p className="text-sm text-blue-700">
                    Your trial ends on {formatDate(subscription.trialEndsAt)}. You won't be charged until then.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Features Card */}
      <Card className="p-6">
        <h3 className="text-[#2D6A4F] mb-4">Your Plan Features</h3>
        <div className="grid md:grid-cols-2 gap-4">
          {subscription.planName?.toLowerCase().includes('premium') && (
            <>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#2D6A4F]" />
                <span className="text-gray-700">AI recommendations</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#2D6A4F]" />
                <span className="text-gray-700">Unlimited crop tracking</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#2D6A4F]" />
                <span className="text-gray-700">24/7 priority support</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#2D6A4F]" />
                <span className="text-gray-700">Predictive analytics</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#2D6A4F]" />
                <span className="text-gray-700">Custom integrations</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#2D6A4F]" />
                <span className="text-gray-700">Early access to features</span>
              </div>
            </>
          )}

          {subscription.planName?.toLowerCase().includes('pro') && !subscription.planName?.toLowerCase().includes('premium') && (
            <>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#2D6A4F]" />
                <span className="text-gray-700">Advanced analytics</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#2D6A4F]" />
                <span className="text-gray-700">Unlimited crop tracking</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#2D6A4F]" />
                <span className="text-gray-700">Weather integration</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#2D6A4F]" />
                <span className="text-gray-700">Priority support</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#2D6A4F]" />
                <span className="text-gray-700">Market insights</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#2D6A4F]" />
                <span className="text-gray-700">Export data reports</span>
              </div>
            </>
          )}

          {subscription.planName?.toLowerCase().includes('basic') && (
            <>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#2D6A4F]" />
                <span className="text-gray-700">Basic notifications</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#2D6A4F]" />
                <span className="text-gray-700">Crop tracking (5 types)</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#2D6A4F]" />
                <span className="text-gray-700">Email support</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#2D6A4F]" />
                <span className="text-gray-700">Stock monitoring</span>
              </div>
            </>
          )}
        </div>
      </Card>

      {/* Actions */}
      <Card className="p-6">
        <h3 className="text-[#2D6A4F] mb-4">Manage Subscription</h3>
        <div className="flex flex-wrap gap-3">
          <Button
            onClick={() => window.location.href = '/subscription'}
            variant="outline"
            className="border-2 border-[#2D6A4F] text-[#2D6A4F] hover:bg-[#2D6A4F] hover:text-white rounded-full"
          >
            Change Plan
          </Button>
          <Button
            variant="outline"
            className="border-2 border-gray-300 text-gray-700 hover:bg-gray-100 rounded-full"
            onClick={() => notify.info('Cancel Subscription', 'Contact support to cancel your subscription')}
          >
            Cancel Subscription
          </Button>
        </div>
      </Card>
    </div>
  );
}
