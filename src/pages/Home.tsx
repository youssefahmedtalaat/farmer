
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import {
  Sprout,
  TrendingUp,
  Bell,
  ShoppingBag,
  BarChart3,
  CloudSun,
  MapPin,
  Sparkles,
  CheckCircle2,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { useLanguage } from "../utils/language";
import { useAuth } from "../utils/auth";

export function Home() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const features = [
    {
      icon: <Sprout className="w-8 h-8" />,
      title: t('home.features.crop.title'),
      description: t('home.features.crop.description'),
    },
    {
      icon: <CloudSun className="w-8 h-8" />,
      title: t('home.features.weather.title'),
      description: t('home.features.weather.description'),
    },
    {
      icon: <ShoppingBag className="w-8 h-8" />,
      title: t('home.features.market.title'),
      description: t('home.features.market.description'),
    },
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: t('home.features.stock.title'),
      description: t('home.features.stock.description'),
    },
  ];

  const steps = [
    {
      icon: <Sprout className="w-12 h-12" />,
      title: t('home.step1.title'),
      description: t('home.step1.description'),
      color: "from-[#2D6A4F] to-[#95D5B2]",
    },
    {
      icon: <Bell className="w-12 h-12" />,
      title: t('home.step2.title'),
      description: t('home.step2.description'),
      color: "from-[#74C0FC] to-[#95D5B2]",
    },
    {
      icon: <MapPin className="w-12 h-12" />,
      title: t('home.step3.title'),
      description: t('home.step3.description'),
      color: "from-[#BC6C25] to-[#95D5B2]",
    },
  ];

  const plans = [
    {
      name: t('home.plan.basic'),
      price: "4000 EGP",
      period: t('home.plan.month'),
      features: [
        t('home.plan.basic.feature1'),
        t('home.plan.basic.feature2'),
        t('home.plan.basic.feature3'),
        t('home.plan.basic.feature4'),
      ],
    },
    {
      name: t('home.plan.pro'),
      price: "9000 EGP",
      period: t('home.plan.6months'),
      features: [
        t('home.plan.pro.feature1'),
        t('home.plan.pro.feature2'),
        t('home.plan.pro.feature3'),
        t('home.plan.pro.feature4'),
      ],
      popular: true,
    },
    {
      name: t('home.plan.premium'),
      price: "15000 EGP",
      period: t('home.plan.year'),
      features: [
        t('home.plan.premium.feature1'),
        t('home.plan.premium.feature2'),
        t('home.plan.premium.feature3'),
        t('home.plan.premium.feature4'),
      ],
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[#2D6A4F] via-[#95D5B2] to-[#74C0FC] overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1758873115193-bc8eab1b87bf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBhZ3JpY3VsdHVyZSUyMGZpZWxkfGVufDF8fHx8MTc2MTczNDM5N3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
            alt="Agriculture field"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
          <div className="text-center space-y-8">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
              <Sparkles className="w-4 h-4 text-white" />
              <span className="text-sm text-white">
                {t('home.hero.badge')}
              </span>
            </div>

            <h1 className="text-white max-w-4xl mx-auto">
              {isAdmin ? t('admin.home.hero.title') : t('home.hero.title')}
            </h1>

            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              {isAdmin 
                ? t('admin.home.hero.subtitle')
                : t('home.hero.subtitle')
              }
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              {isAdmin ? (
                <>
                  <Link to="/dashboard/explore-farms">
                    <Button className="bg-white text-[#2D6A4F] hover:bg-white/90 rounded-full px-8 py-6">
                      {t('admin.home.exploreFarms')}
                    </Button>
                  </Link>
                  <Link to="/dashboard">
                    <Button
                      variant="outline"
                      className="border-2 border-[#2D6A4F] bg-transparent text-[#2D6A4F] hover:bg-[#2D6A4F] hover:text-white rounded-full px-8 py-6 transition-all duration-300"
                    >
                      {t('admin.home.profit')}
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/login">
                    <Button className="bg-white text-[#2D6A4F] hover:bg-white/90 rounded-full px-8 py-6">
                      {t('home.hero.cta')}
                    </Button>
                  </Link>
                  <Link to="/subscription">
                    <Button
                      variant="outline"
                      className="border-2 border-[#2D6A4F] bg-transparent text-[#2D6A4F] hover:bg-[#2D6A4F] hover:text-white rounded-full px-8 py-6 transition-all duration-300"
                    >
                      {t('home.hero.viewPlans')}
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Content Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Section - Title and Description */}
            <div className="space-y-6">
              <h2 className="text-[#2D6A4F] text-3xl md:text-4xl font-bold">
                {isAdmin 
                  ? t('admin.home.featured.title')
                  : t('home.featured.title')
                }
              </h2>
              <p className="text-gray-600 text-lg leading-relaxed">
                {isAdmin
                  ? t('admin.home.featured.description')
                  : t('home.featured.description')
                }
              </p>
              {isAdmin ? (
                <div className="flex gap-4 pt-4">
                  <Link to="/dashboard">
                    <Button className="bg-[#2D6A4F] hover:bg-[#2D6A4F]/90 text-white rounded-full px-6">
                      {t('admin.home.goToDashboard')}
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="flex gap-4 pt-4">
                  <Link to="/login">
                    <Button className="bg-[#2D6A4F] hover:bg-[#2D6A4F]/90 text-white rounded-full px-6">
                      {t('home.featured.getStarted')}
                    </Button>
                  </Link>
                </div>
              )}
            </div>

            {/* Right Section - Image */}
            <div className="relative">
              <div className="rounded-2xl overflow-hidden shadow-2xl">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1758873115193-bc8eab1b87bf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBhZ3JpY3VsdHVyZSUyMGZpZWxkfGVufDF8fHx8MTc2MTczNDM5N3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                  alt={isAdmin ? "Admin dashboard and analytics" : "Modern farming technology"}
                  className="w-full h-[400px] md:h-[500px] object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-gradient-to-br from-[#2D6A4F] to-[#95D5B2] rounded-full opacity-20 blur-2xl" />
            </div>
          </div>
        </div>
      </section>

      {/* How It Works / Admin Features */}
      {!isAdmin ? (
        <section className="py-20 bg-[#FAF9F6]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-[#2D6A4F] mb-4">
                {t('home.howItWorks.title')}
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                {t('home.howItWorks.subtitle')}
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {steps.map((step, index) => (
                <Card
                  key={index}
                  className="p-8 text-center hover:shadow-lg transition-shadow"
                >
                  <div
                    className={`w-20 h-20 bg-gradient-to-br ${step.color} rounded-2xl flex items-center justify-center mx-auto mb-6 text-white`}
                  >
                    {step.icon}
                  </div>
                  <h3 className="text-[#2D6A4F] mb-3">
                    {step.title}
                  </h3>
                  <p className="text-gray-600">
                    {step.description}
                  </p>
                </Card>
              ))}
            </div>
          </div>
        </section>
      ) : (
        <section className="py-20 bg-[#FAF9F6]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-[#2D6A4F] mb-4">
                {t('admin.home.features.title')}
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                {t('admin.home.features.subtitle')}
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <Card className="p-8 text-center hover:shadow-lg transition-shadow">
                <div className="w-20 h-20 bg-gradient-to-br from-[#2D6A4F] to-[#95D5B2] rounded-2xl flex items-center justify-center mx-auto mb-6 text-white">
                  <Users className="w-12 h-12" />
                </div>
                <h3 className="text-[#2D6A4F] mb-3">
                  {t('admin.home.features.manageFarmers.title')}
                </h3>
                <p className="text-gray-600">
                  {t('admin.home.features.manageFarmers.description')}
                </p>
              </Card>
              <Card className="p-8 text-center hover:shadow-lg transition-shadow">
                <div className="w-20 h-20 bg-gradient-to-br from-[#74C0FC] to-[#95D5B2] rounded-2xl flex items-center justify-center mx-auto mb-6 text-white">
                  <TrendingUp className="w-12 h-12" />
                </div>
                <h3 className="text-[#2D6A4F] mb-3">
                  {t('admin.home.features.trackProfits.title')}
                </h3>
                <p className="text-gray-600">
                  {t('admin.home.features.trackProfits.description')}
                </p>
              </Card>
              <Card className="p-8 text-center hover:shadow-lg transition-shadow">
                <div className="w-20 h-20 bg-gradient-to-br from-[#BC6C25] to-[#95D5B2] rounded-2xl flex items-center justify-center mx-auto mb-6 text-white">
                  <BarChart3 className="w-12 h-12" />
                </div>
                <h3 className="text-[#2D6A4F] mb-3">
                  {t('admin.home.features.analytics.title')}
                </h3>
                <p className="text-gray-600">
                  {t('admin.home.features.analytics.description')}
                </p>
              </Card>
            </div>
          </div>
        </section>
      )}

      {/* AI Assistant Preview - Only for non-admin */}
      {!isAdmin && (
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 bg-[#74C0FC]/10 px-4 py-2 rounded-full">
                <Sparkles className="w-4 h-4 text-[#74C0FC]" />
                <span className="text-sm text-[#74C0FC]">
                  {t('home.ai.badge')}
                </span>
              </div>

              <h2 className="text-[#2D6A4F]">
                {t('home.ai.title')}
              </h2>

              <p className="text-gray-600 text-lg">
                {t('home.ai.description')}
              </p>

              <div className="space-y-3 pt-4">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-[#2D6A4F]/10 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <CheckCircle2 className="w-4 h-4 text-[#2D6A4F]" />
                  </div>
                  <div>
                    <p className="text-gray-800">
                      {t('home.ai.feature1.title')}
                    </p>
                    <p className="text-sm text-gray-600">
                      {t('home.ai.feature1.description')}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-[#2D6A4F]/10 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <CheckCircle2 className="w-4 h-4 text-[#2D6A4F]" />
                  </div>
                  <div>
                    <p className="text-gray-800">
                      {t('home.ai.feature2.title')}
                    </p>
                    <p className="text-sm text-gray-600">
                      {t('home.ai.feature2.description')}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-[#2D6A4F]/10 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <CheckCircle2 className="w-4 h-4 text-[#2D6A4F]" />
                  </div>
                  <div>
                    <p className="text-gray-800">
                      {t('home.ai.feature3.title')}
                    </p>
                    <p className="text-sm text-gray-600">
                      {t('home.ai.feature3.description')}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="bg-gradient-to-br from-[#2D6A4F] to-[#95D5B2] rounded-3xl p-8 shadow-2xl">
                <div className="bg-white rounded-2xl p-6 space-y-4">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-br from-[#2D6A4F] to-[#95D5B2] rounded-full flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-gray-800">FarmBot</p>
                      <p className="text-xs text-gray-500">
                        {t('home.ai.status')}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="bg-gray-100 rounded-2xl rounded-bl-sm p-3 max-w-[80%]">
                      <p className="text-sm text-gray-800">
                        {t('home.ai.chat.greeting')}
                      </p>
                    </div>
                    <div className="bg-[#2D6A4F] text-white rounded-2xl rounded-br-sm p-3 max-w-[80%] ml-auto">
                      <p className="text-sm">
                        {t('home.ai.chat.question')}
                      </p>
                    </div>
                    <div className="bg-gray-100 rounded-2xl rounded-bl-sm p-3 max-w-[80%]">
                      <p className="text-sm text-gray-800">
                        {t('home.ai.chat.response')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-[#74C0FC] rounded-full opacity-20 blur-2xl" />
            </div>
          </div>
        </div>
      </section>
      )}

      {/* AI Chat Assistant Section - For Admin */}
      {isAdmin && (
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left Section - Image */}
              <div className="relative order-2 lg:order-1">
                <div className="rounded-2xl overflow-hidden shadow-2xl">
                  <ImageWithFallback
                    src="https://images.unsplash.com/photo-1677442136019-21780ecad995?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhaSUyMGFzc2lzdGFudCUyMGNoYXR8ZW58MXx8fHwxNzYxNzM0Mzk3fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                    alt="AI Chat Assistant"
                    className="w-full h-[400px] md:h-[500px] object-cover"
                  />
                </div>
                <div className="absolute -top-6 -left-6 w-32 h-32 bg-gradient-to-br from-[#74C0FC] to-[#95D5B2] rounded-full opacity-20 blur-2xl" />
              </div>

              {/* Right Section - Title and Description */}
              <div className="space-y-6 order-1 lg:order-2">
                <div className="inline-flex items-center gap-2 bg-[#74C0FC]/10 px-4 py-2 rounded-full">
                  <Sparkles className="w-4 h-4 text-[#74C0FC]" />
                  <span className="text-sm text-[#74C0FC]">
                    {t('admin.home.ai.badge')}
                  </span>
                </div>
                <h2 className="text-[#2D6A4F] text-3xl md:text-4xl font-bold">
                  {t('admin.home.ai.title')}
                </h2>
                <p className="text-gray-600 text-lg leading-relaxed">
                  {t('admin.home.ai.description')}
                </p>
                <div className="space-y-3 pt-4">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-[#2D6A4F]/10 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <CheckCircle2 className="w-4 h-4 text-[#2D6A4F]" />
                    </div>
                    <div>
                      <p className="text-gray-800 font-medium">
                        {t('admin.home.ai.feature1.title')}
                      </p>
                      <p className="text-sm text-gray-600">
                        {t('admin.home.ai.feature1.description')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-[#2D6A4F]/10 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <CheckCircle2 className="w-4 h-4 text-[#2D6A4F]" />
                    </div>
                    <div>
                      <p className="text-gray-800 font-medium">
                        {t('admin.home.ai.feature2.title')}
                      </p>
                      <p className="text-sm text-gray-600">
                        {t('admin.home.ai.feature2.description')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-[#2D6A4F]/10 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <CheckCircle2 className="w-4 h-4 text-[#2D6A4F]" />
                    </div>
                    <div>
                      <p className="text-gray-800 font-medium">
                        {t('admin.home.ai.feature3.title')}
                      </p>
                      <p className="text-sm text-gray-600">
                        {t('admin.home.ai.feature3.description')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Benefits Section */}
      <section className="py-20 bg-[#FAF9F6]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-[#2D6A4F] mb-4">
              {t('home.features.title')}
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              {t('home.features.subtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="p-6 hover:shadow-lg transition-all hover:-translate-y-1"
              >
                <div className="w-14 h-14 bg-gradient-to-br from-[#2D6A4F] to-[#95D5B2] rounded-xl flex items-center justify-center text-white mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-[#2D6A4F] mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-sm">
                  {feature.description}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Subscription Highlight - Only for non-admin */}
      {!isAdmin && (
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-[#2D6A4F] mb-4">
                {t('home.subscription.title')}
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                {t('home.subscription.subtitle')}
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {plans.map((plan, index) => (
                <Card
                  key={index}
                  className={`p-8 relative ${
                    plan.popular
                      ? "ring-2 ring-[#2D6A4F] shadow-xl"
                      : ""
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#2D6A4F] text-white px-4 py-1 rounded-full text-sm">
                      {t('home.subscription.popular')}
                    </div>
                  )}
                  <div className="text-center mb-6">
                    <h3 className="text-[#2D6A4F] mb-2">
                      {plan.name}
                    </h3>
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="text-gray-800">
                        {plan.price}
                      </span>
                      <span className="text-gray-600">
                        /{plan.period}
                      </span>
                    </div>
                  </div>
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, fIndex) => (
                      <li
                        key={fIndex}
                        className="flex items-center gap-2"
                      >
                        <CheckCircle2 className="w-5 h-5 text-[#2D6A4F] flex-shrink-0" />
                        <span className="text-gray-700 text-sm">
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <Link to="/subscription">
                    <Button
                      className={`w-full rounded-full ${
                        plan.popular
                          ? "bg-[#2D6A4F] hover:bg-[#2D6A4F]/90"
                          : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                      }`}
                    >
                      {t('home.subscription.getStarted')}
                    </Button>
                  </Link>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section - Only for non-admin */}
      {!isAdmin && (
        <section className="py-20 bg-gradient-to-r from-[#2D6A4F] to-[#95D5B2]">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-white mb-6">
              {t('home.cta.title')}
            </h2>
            <p className="text-white/90 text-lg mb-8">
              {t('home.cta.subtitle')}
            </p>
            <Link to="/login">
              <Button className="bg-white text-[#2D6A4F] hover:bg-white/90 rounded-full px-8 py-6">
                {t('home.cta.button')}
              </Button>
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}