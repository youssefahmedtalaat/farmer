import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../components/ui/dialog';
import { CheckCircle2, Shield, CreditCard, Sparkles } from 'lucide-react';
import { notify } from '../utils/notifications';
import { subscriptionApi, activitiesApi } from '../utils/api';
import { useLanguage } from '../utils/language';

interface Plan {
  id: string;
  name: string;
  price: number;
  period: string;
  duration: string;
  description: string;
  features: string[];
  popular?: boolean;
  color: string;
  isFree?: boolean;
}

export function Subscription() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [showPayment, setShowPayment] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [formData, setFormData] = useState({
    cardName: '',
    cardNumber: '',
    expiry: '',
    cvv: '',
  });

  // Plans with translations and EGP currency
  const plans: Plan[] = [
    {
      id: 'basic',
      name: t('plan.basic.name'),
      price: 4000, // Updated price
      period: t('plan.basic.period'),
      duration: t('plan.basic.duration'),
      description: t('plan.basic.description'),
      features: [
        t('plan.basic.feature1'),
        t('plan.basic.feature2'),
        t('plan.basic.feature3'),
        t('plan.basic.feature4'),
        t('plan.basic.feature5'),
        t('plan.basic.feature6'),
      ],
      color: 'from-[#2D6A4F] to-[#95D5B2]',
    },
    {
      id: 'pro',
      name: t('plan.pro.name'),
      price: 9000, // Updated price
      period: t('plan.pro.period'),
      duration: t('plan.pro.duration'),
      description: t('plan.pro.description'),
      features: [
        t('plan.pro.feature1'),
        t('plan.pro.feature2'),
        t('plan.pro.feature3'),
        t('plan.pro.feature4'),
        t('plan.pro.feature5'),
        t('plan.pro.feature6'),
        t('plan.pro.feature7'),
        t('plan.pro.feature8'),
      ],
      popular: true,
      color: 'from-[#edd290] to-[#e6c165]',
    },
    {
      id: 'premium',
      name: t('plan.premium.name'),
      price: 15000, // Updated price
      period: t('plan.premium.period'),
      duration: t('plan.premium.duration'),
      description: t('plan.premium.description'),
      features: [
        t('plan.premium.feature1'),
        t('plan.premium.feature2'),
        t('plan.premium.feature3'),
        t('plan.premium.feature4'),
        t('plan.premium.feature5'),
        t('plan.premium.feature6'),
        t('plan.premium.feature7'),
        t('plan.premium.feature8'),
        t('plan.premium.feature9'),
      ],
      color: 'from-[#BC6C25] to-[#2D6A4F]',
    },
    {
      id: 'trial',
      name: 'Free Trial',
      price: 0,
      period: '2 weeks',
      duration: '2 weeks',
      description: 'Manage your crops free for 2 weeks - no credit card required',
      features: [
        '2-week free crop management',
        'Add, edit, and track your crops',
        'Monitor stock levels',
        'View crop status',
        'After trial: Crop management will be suspended',
        'Upgrade to continue managing crops',
      ],
      color: 'from-[#74C0FC] to-[#95D5B2]',
      isFree: true,
    },
  ];

  const handleSelectPlan = async (planId: string) => {
    const plan = plans.find(p => p.id === planId);
    setSelectedPlan(planId);
    setFormData({ cardName: '', cardNumber: '', expiry: '', cvv: '' });
    
    // If it's a free trial, skip payment and directly create subscription
    if (plan && plan.isFree) {
      setIsProcessing(true);
      try {
        await subscriptionApi.create({
          planId: plan.id,
          planName: plan.name,
          price: plan.price,
          duration: plan.duration,
        });

        await activitiesApi.log({
          action: 'Free trial started',
          detail: `${plan.name} - ${plan.duration}`,
        });

        notify.success('Free Trial Started', `Your ${plan.duration} free trial has been activated!`);
        
        setTimeout(() => {
          navigate('/dashboard/subscription', { 
            state: { 
              subscriptionPlan: plan.name,
              justSubscribed: true 
            },
            replace: true
          });
        }, 1500);
      } catch (error: any) {
        notify.error('Error', error.message || 'Failed to start free trial');
      } finally {
        setIsProcessing(false);
      }
      return;
    }
    
    // For paid plans, show payment dialog
    setTimeout(() => {
      setShowPayment(true);
      if (plan) {
        notify.info(`${plan.name} ${t('payment.plan')}`, `${t('payment.completeSubscription')}`);
      }
    }, 0);
  };

  const formatCardNumber = (value: string) => {
    const digitsOnly = value.replace(/\D/g, '');
    const formatted = digitsOnly.replace(/(\d{4})(?=\d)/g, '$1 ');
    return formatted;
  };

  const formatExpiry = (value: string) => {
    const digitsOnly = value.replace(/\D/g, '');
    if (digitsOnly.length <= 2) {
      return digitsOnly;
    }
    return `${digitsOnly.slice(0, 2)}/${digitsOnly.slice(2, 4)}`;
  };

  const formatCVV = (value: string) => {
    return value.replace(/\D/g, '');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    
    let formattedValue = value;
    
    if (id === 'cardNumber') {
      formattedValue = formatCardNumber(value);
    } else if (id === 'expiry') {
      formattedValue = formatExpiry(value);
    } else if (id === 'cvv') {
      formattedValue = formatCVV(value);
    }
    
    setFormData((prev) => ({ ...prev, [id]: formattedValue }));
  };

  const validateForm = () => {
    if (!formData.cardName.trim()) {
      notify.error('Missing Information', 'Please enter cardholder name');
      return false;
    }
    if (!formData.cardNumber.trim() || formData.cardNumber.replace(/\s/g, '').length < 13) {
      notify.error('Invalid Card', 'Please enter a valid card number');
      return false;
    }
    if (!formData.expiry.trim() || !/^\d{2}\/\d{2}$/.test(formData.expiry)) {
      notify.error('Invalid Expiry', 'Please enter a valid expiry date (MM/YY)');
      return false;
    }
    if (!formData.cvv.trim() || formData.cvv.length < 3) {
      notify.error('Invalid CVV', 'Please enter a valid CVV code');
      return false;
    }
    return true;
  };

  const handlePayment = async () => {
    if (!validateForm()) return;

    setIsProcessing(true);

    // Simulate payment processing
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));

      if (selectedPlanData) {
        // Save subscription to backend
        await subscriptionApi.create({
          planId: selectedPlanData.id,
          planName: selectedPlanData.name,
          price: selectedPlanData.price,
          duration: selectedPlanData.duration,
        });

        // Log activity
        await activitiesApi.log({
          action: 'Subscription purchased',
          detail: `${selectedPlanData.name} plan - ${selectedPlanData.price} EGP`,
        });
      }

      // Payment successful
      if (selectedPlanData) {
        notify.subscription.subscribed(selectedPlanData.name);
      }

      setShowPayment(false);
      setFormData({ cardName: '', cardNumber: '', expiry: '', cvv: '' });
      
      // Redirect to dashboard with subscription tab
      setTimeout(() => {
        navigate('/dashboard/subscription', { 
          state: { 
            subscriptionPlan: selectedPlanData?.name,
            justSubscribed: true 
          },
          replace: true
        });
      }, 1500);
    } catch (error: any) {
      notify.error('Payment Failed', error.message || 'Please try again');
    } finally {
      setIsProcessing(false);
    }
  };

  const selectedPlanData = plans.find((plan) => plan.id === selectedPlan);

  return (
    <div className="min-h-screen bg-[#FAF9F6] py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-[#2D6A4F]/10 px-4 py-2 rounded-full mb-4">
            <Sparkles className="w-4 h-4 text-[#2D6A4F]" />
            <span className="text-sm text-[#2D6A4F]">{t('subscription.chooseYourPlan')}</span>
          </div>
          <h1 className="text-[#2D6A4F] mb-4">{t('subscription.title')}</h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            {t('subscription.subtitle')}
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {plans.filter(plan => !plan.isFree).map((plan) => (
            <Card
              key={plan.id}
              className={`relative overflow-hidden ${
                plan.popular ? 'ring-2 ring-[#2D6A4F] shadow-2xl scale-105' : 'shadow-lg'
              }`}
            >
              
              {plan.popular && (
  <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-[#edd290] to-[#e6c165] text-white font-semibold text-center py-2 text-sm shadow-md">
    {t('subscription.mostPopular')}
  </div>
)}
              <div className={`h-32 bg-gradient-to-br ${plan.color} ${plan.popular ? 'mt-10' : ''}`}>
                <div className="flex items-center justify-center h-full">
                  <div className="text-center text-white">
                    <p className="text-sm opacity-90">{plan.duration}</p>
                    <div className="flex items-baseline justify-center gap-1 mt-2">
                      <span className="text-4xl">{plan.price} EGP</span>
                      <span className="text-sm opacity-80">/{plan.period}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-8">
                <h3 className="text-[#2D6A4F] mb-2">{plan.name}</h3>
                <p className="text-gray-600 text-sm mb-6">{plan.description}</p>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle2 className="w-5 h-5 text-[#2D6A4F] flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700 text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  onClick={(e) => {
                    e.preventDefault();
                    handleSelectPlan(plan.id);
                  }}
                  type="button"
                  variant="outline"
                  className={`w-full rounded-full border-2 transition-all duration-300 ${
                    plan.popular
                      ? 'border-[#2D6A4F] text-[#2D6A4F] hover:bg-[#2D6A4F] hover:text-white'
                      : 'border-gray-800 text-gray-800 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  {t('subscription.getStarted')}
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {/* Free Trial Card */}
        <div className="max-w-md mx-auto mb-16">
          {plans.filter(plan => plan.isFree).map((plan) => (
            <Card
              key={plan.id}
              className="relative overflow-hidden shadow-lg border-2 border-[#74C0FC]"
            >
              <div className={`h-32 bg-gradient-to-br ${plan.color}`}>
                <div className="flex items-center justify-center h-full">
                  <div className="text-center text-white">
                    <p className="text-sm opacity-90">{plan.duration}</p>
                    <div className="flex items-baseline justify-center gap-1 mt-2">
                      <span className="text-4xl font-bold">FREE</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-8">
                <h3 className="text-[#2D6A4F] mb-2 text-xl font-semibold">{plan.name}</h3>
                <p className="text-gray-600 text-sm mb-6">{plan.description}</p>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle2 className="w-5 h-5 text-[#2D6A4F] flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700 text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  onClick={(e) => {
                    e.preventDefault();
                    handleSelectPlan(plan.id);
                  }}
                  type="button"
                  disabled={isProcessing}
                  className="w-full rounded-full bg-[#74C0FC] hover:bg-[#74C0FC]/90 text-white border-0 transition-all duration-300"
                >
                  {isProcessing ? 'Processing...' : 'Start Free Trial'}
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {/* Security Badge */}
        <div className="flex items-center justify-center gap-8 flex-wrap text-gray-600">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-[#2D6A4F]" />
            <span className="text-sm">{t('subscription.securePayment')}</span>
          </div>
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-[#2D6A4F]" />
            <span className="text-sm">{t('subscription.sslEncrypted')}</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-[#2D6A4F]" />
            <span className="text-sm">{t('subscription.freeTrial')}</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-[#2D6A4F]" />
            <span className="text-sm">{t('subscription.cancelAnytime')}</span>
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-20 max-w-3xl mx-auto">
          <h2 className="text-[#2D6A4F] text-center mb-8">{t('subscription.faq')}</h2>
          <div className="space-y-4">
            <Card className="p-6">
              <h3 className="text-[#2D6A4F] mb-2">{t('subscription.faqChangePlan')}</h3>
              <p className="text-gray-600 text-sm">
                {t('subscription.faqChangePlanAnswer')}
              </p>
            </Card>
            <Card className="p-6">
              <h3 className="text-[#2D6A4F] mb-2">{t('subscription.faqPaymentMethods')}</h3>
              <p className="text-gray-600 text-sm">
                {t('subscription.faqPaymentMethodsAnswer')}
              </p>
            </Card>
            <Card className="p-6">
              <h3 className="text-[#2D6A4F] mb-2">{t('subscription.faqRefund')}</h3>
              <p className="text-gray-600 text-sm">
                {t('subscription.faqRefundAnswer')}
              </p>
            </Card>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      <Dialog open={showPayment} onOpenChange={setShowPayment}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[#2D6A4F]">{t('payment.completeSubscription')}</DialogTitle>
            <DialogDescription>
              {t('payment.enterDetails')}
            </DialogDescription>
          </DialogHeader>

          {selectedPlanData && (
            <div className="space-y-6">
              <Card className="p-4 bg-[#2D6A4F]/5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-900">{selectedPlanData.name} {t('payment.plan')}</p>
                    <p className="text-sm text-gray-600">{selectedPlanData.duration} {t('payment.access')}</p>
                  </div>
                  <p className="text-[#2D6A4F]">{selectedPlanData.price} EGP</p>
                </div>
              </Card>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="cardName">{t('payment.cardholderName')}</Label>
                  <Input
                    id="cardName"
                    placeholder="أحمد محمد"
                    className="mt-1"
                    value={formData.cardName}
                    onChange={handleInputChange}
                    disabled={isProcessing}
                  />
                </div>

                <div>
                  <Label htmlFor="cardNumber">{t('payment.cardNumber')}</Label>
                  <Input
                    id="cardNumber"
                    placeholder="1234 5678 9012 3456"
                    className="mt-1"
                    value={formData.cardNumber}
                    onChange={handleInputChange}
                    maxLength={19}
                    disabled={isProcessing}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="expiry">{t('payment.expiryDate')}</Label>
                    <Input
                      id="expiry"
                      placeholder="MM/YY"
                      className="mt-1"
                      value={formData.expiry}
                      onChange={handleInputChange}
                      maxLength={5}
                      disabled={isProcessing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="cvv">{t('payment.cvv')}</Label>
                    <Input
                      id="cvv"
                      placeholder="123"
                      className="mt-1"
                      value={formData.cvv}
                      onChange={handleInputChange}
                      maxLength={4}
                      inputMode="numeric"
                      disabled={isProcessing}
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Shield className="w-4 h-4 text-[#2D6A4F]" />
                <span>{t('payment.secureInfo')}</span>
              </div>

              <Button
                onClick={handlePayment}
                disabled={isProcessing}
                className="w-full bg-[#2D6A4F] hover:bg-[#2D6A4F]/90 rounded-full py-6 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? t('payment.processing') : `${t('payment.completePayment')} - ${selectedPlanData.price} EGP`}
              </Button>

              <p className="text-xs text-gray-500 text-center">
                {t('payment.termsAgree')} {selectedPlanData.price} EGP {t('payment.afterTrial')}
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
