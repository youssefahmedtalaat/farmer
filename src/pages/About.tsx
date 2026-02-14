import { Card } from '../components/ui/card';
import { Leaf, Target, Users, Heart, Award, TrendingUp, BarChart3, Shield } from 'lucide-react';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { useLanguage } from '../utils/language';
import { useAuth } from '../utils/auth';


export function About() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  
  const values = isAdmin
    ? [
        {
          icon: <Shield className="w-8 h-8" />,
          title: 'Platform Management',
          description: 'Comprehensive tools to manage farmers, subscriptions, and monitor platform performance',
          color: 'from-[#2D6A4F] to-[#95D5B2]',
        },
        {
          icon: <BarChart3 className="w-8 h-8" />,
          title: 'Analytics & Insights',
          description: 'Track profits, analyze subscription distribution, and gain insights into platform growth',
          color: 'from-[#74C0FC] to-[#95D5B2]',
        },
        {
          icon: <Users className="w-8 h-8" />,
          title: 'Farmer Support',
          description: 'Monitor farmer activity, manage subscriptions, and ensure platform success',
          color: 'from-[#BC6C25] to-[#2D6A4F]',
        },
      ]
    : [
        {
          icon: <Target className="w-8 h-8" />,
          title: t('about.mission.title'),
          description: t('about.mission.description'),
          color: 'from-[#2D6A4F] to-[#95D5B2]',
        },
        {
          icon: <Heart className="w-8 h-8" />,
          title: t('about.vision.title'),
          description: t('about.vision.description'),
          color: 'from-[#74C0FC] to-[#95D5B2]',
        },
        {
          icon: <Leaf className="w-8 h-8" />,
          title: t('about.values.title'),
          description: t('about.values.description'),
          color: 'from-[#BC6C25] to-[#2D6A4F]',
        },
      ];

  const impact = isAdmin
    ? [
        { number: '500+', label: 'Total Farmers' },
        { number: '85%', label: 'Active Subscriptions' },
        { number: '2.5M+', label: 'Total Revenue (EGP)' },
        { number: '12', label: 'Platform Regions' },
      ]
    : [
        { number: '10,000+', label: t('about.impact.activeFarmers') },
        { number: '50,000+', label: t('about.impact.hectaresManaged') },
        { number: '30%', label: t('about.impact.yieldIncrease') },
        { number: '25%', label: t('about.impact.wasteReduction') },
      ];

  const team = [
    {
      name: t('about.team.member1.name'),
      role: t('about.team.member1.role'),
      bio: t('about.team.member1.bio'),
    },
    {
      name: t('about.team.member2.name'),
      role: t('about.team.member2.role'),
      bio: t('about.team.member2.bio'),
    },
    {
      name: t('about.team.member3.name'),
      role: t('about.team.member3.role'),
      bio: t('about.team.member3.bio'),
    },
    {
      name: t('about.team.member4.name'),
      role: t('about.team.member4.role'),
      bio: t('about.team.member4.bio'),
    },
  ];
  
  return (
    <div className="min-h-screen bg-[#FAF9F6]">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[#2D6A4F] to-[#95D5B2] py-20">
        <div className="absolute inset-0 opacity-10">
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1721424759830-e4b892acf1d7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdXN0YWluYWJsZSUyMGZhcm1pbmd8ZW58MXx8fHwxNzYxNjYyNDQ4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
            alt="Sustainable farming"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-white mb-6">
            {isAdmin ? 'Admin Platform - About Your Management System' : `${t('about.hero.title')} ${t('app.name')}`}
          </h1>
          <p className="text-white/90 text-xl max-w-3xl mx-auto">
            {isAdmin 
              ? 'Your comprehensive platform for managing farmers, tracking subscriptions, and analyzing profits across the farming network'
              : t('about.hero.subtitle')
            }
          </p>
        </div>
      </section>

      {/* Mission, Vision, Values */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            {values.map((value, index) => (
              <Card key={index} className="p-8 text-center hover:shadow-xl transition-shadow">
                <div
                  className={`w-16 h-16 bg-gradient-to-br ${value.color} rounded-2xl flex items-center justify-center mx-auto mb-6 text-white`}
                >
                  {value.icon}
                </div>
                <h3 className="text-[#2D6A4F] mb-4">{value.title}</h3>
                <p className="text-gray-600">{value.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Impact Stats */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-[#2D6A4F] mb-4">
              {isAdmin ? 'Platform Statistics' : t('about.impact.title')}
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              {isAdmin 
                ? 'Key metrics and statistics about your farming platform'
                : t('about.impact.subtitle')
              }
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {impact.map((stat, index) => (
              <Card key={index} className="p-8 text-center bg-gradient-to-br from-[#2D6A4F]/5 to-[#95D5B2]/5">
                <div className="mb-3">
                  <TrendingUp className="w-8 h-8 text-[#2D6A4F] mx-auto" />
                </div>
                <p className="text-[#2D6A4F] mb-2">{stat.number}</p>
                <p className="text-gray-600">{stat.label}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section - Only for non-admin */}
      {!isAdmin && (
        <section className="py-20 bg-[#FAF9F6]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-[#2D6A4F] mb-4">{t('about.team.title')}</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                {t('about.team.subtitle')}
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {team.map((member, index) => (
                <Card key={index} className="p-6 text-center hover:shadow-lg transition-shadow">
                  <div className="w-24 h-24 bg-gradient-to-br from-[#2D6A4F] to-[#95D5B2] rounded-full mx-auto mb-4 flex items-center justify-center">
                    <Users className="w-12 h-12 text-white" />
                  </div>
                  <h3 className="text-[#2D6A4F] mb-1">{member.name}</h3>
                  <p className="text-sm text-gray-600 mb-3">{member.role}</p>
                  <p className="text-sm text-gray-600">{member.bio}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Admin Features Section */}
      {isAdmin && (
        <section className="py-20 bg-[#FAF9F6]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-[#2D6A4F] mb-4">Admin Platform Features</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Powerful tools to manage and grow your farming platform
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
              <Card className="p-6 text-center hover:shadow-lg transition-shadow">
                <div className="w-24 h-24 bg-gradient-to-br from-[#2D6A4F] to-[#95D5B2] rounded-full mx-auto mb-4 flex items-center justify-center">
                  <Users className="w-12 h-12 text-white" />
                </div>
                <h3 className="text-[#2D6A4F] mb-1">Farmer Management</h3>
                <p className="text-sm text-gray-600 mb-3">View and manage all registered farmers</p>
                <p className="text-sm text-gray-600">Track subscriptions, activity, and engagement</p>
              </Card>
              <Card className="p-6 text-center hover:shadow-lg transition-shadow">
                <div className="w-24 h-24 bg-gradient-to-br from-[#74C0FC] to-[#95D5B2] rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-2xl font-bold text-white">EGP</span>
                </div>
                <h3 className="text-[#2D6A4F] mb-1">Profit Tracking</h3>
                <p className="text-sm text-gray-600 mb-3">Monitor profits per farmer</p>
                <p className="text-sm text-gray-600">Analyze revenue and financial performance</p>
              </Card>
              <Card className="p-6 text-center hover:shadow-lg transition-shadow">
                <div className="w-24 h-24 bg-gradient-to-br from-[#BC6C25] to-[#2D6A4F] rounded-full mx-auto mb-4 flex items-center justify-center">
                  <BarChart3 className="w-12 h-12 text-white" />
                </div>
                <h3 className="text-[#2D6A4F] mb-1">Analytics Dashboard</h3>
                <p className="text-sm text-gray-600 mb-3">View subscription distribution</p>
                <p className="text-sm text-gray-600">Platform-wide statistics and insights</p>
              </Card>
              <Card className="p-6 text-center hover:shadow-lg transition-shadow">
                <div className="w-24 h-24 bg-gradient-to-br from-[#2D6A4F] to-[#74C0FC] rounded-full mx-auto mb-4 flex items-center justify-center">
                  <Shield className="w-12 h-12 text-white" />
                </div>
                <h3 className="text-[#2D6A4F] mb-1">System Control</h3>
                <p className="text-sm text-gray-600 mb-3">Manage platform settings</p>
                <p className="text-sm text-gray-600">Control access and permissions</p>
              </Card>
            </div>
          </div>
        </section>
      )}

      {/* Sustainability Section - Only for non-admin */}
      {!isAdmin && (
        <section className="py-20 bg-gradient-to-br from-[#2D6A4F] to-[#95D5B2]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6 text-white">
                <div className="flex items-center gap-3">
                  <Leaf className="w-12 h-12" />
                  <h2>{t('about.sustainability.title')}</h2>
                </div>
                <p className="text-white/90 text-lg">
                  {t('about.sustainability.description')}
                </p>
                <div className="space-y-4 pt-4">
                  <div className="flex items-start gap-3">
                    <Award className="w-6 h-6 flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="mb-1">{t('about.sustainability.chemical.title')}</h4>
                      <p className="text-white/80 text-sm">
                        {t('about.sustainability.chemical.description')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Award className="w-6 h-6 flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="mb-1">{t('about.sustainability.waste.title')}</h4>
                      <p className="text-white/80 text-sm">
                        {t('about.sustainability.waste.description')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Award className="w-6 h-6 flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="mb-1">{t('about.sustainability.resources.title')}</h4>
                      <p className="text-white/80 text-sm">
                        {t('about.sustainability.resources.description')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative">
                <Card className="p-8 bg-white/10 backdrop-blur-sm border-white/20">
                  <ImageWithFallback
                    src="https://images.unsplash.com/photo-1721424759830-e4b892acf1d7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdXN0YWluYWJsZSUyMGZhcm1pbmd8ZW58MXx8fHwxNzYxNjYyNDQ4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                    alt="Sustainable farming practices"
                    className="w-full h-80 object-cover rounded-xl"
                  />
                </Card>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Admin Platform Benefits */}
      {isAdmin && (
        <section className="py-20 bg-gradient-to-br from-[#2D6A4F] to-[#95D5B2]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6 text-white">
                <div className="flex items-center gap-3">
                  <Shield className="w-12 h-12" />
                  <h2>Platform Management Benefits</h2>
                </div>
                <p className="text-white/90 text-lg">
                  Comprehensive admin tools to efficiently manage your farming platform and support your farmers
                </p>
                <div className="space-y-4 pt-4">
                  <div className="flex items-start gap-3">
                    <Award className="w-6 h-6 flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="mb-1">Centralized Control</h4>
                      <p className="text-white/80 text-sm">
                        Manage all farmers, subscriptions, and platform settings from one dashboard
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Award className="w-6 h-6 flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="mb-1">Real-time Analytics</h4>
                      <p className="text-white/80 text-sm">
                        Track profits, revenue, and subscription metrics in real-time
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Award className="w-6 h-6 flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="mb-1">Farmer Insights</h4>
                      <p className="text-white/80 text-sm">
                        Monitor farmer activity, subscription status, and engagement levels
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative">
                <Card className="p-8 bg-white/10 backdrop-blur-sm border-white/20">
                  <div className="w-full h-80 bg-gradient-to-br from-white/20 to-white/10 rounded-xl flex items-center justify-center">
                    <BarChart3 className="w-32 h-32 text-white/50" />
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Story Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-[#2D6A4F] mb-4">
              {isAdmin ? 'About the Admin Platform' : t('about.story.title')}
            </h2>
          </div>
          <div className="prose prose-lg max-w-none">
            {isAdmin ? (
              <>
                <p className="text-gray-600 text-lg leading-relaxed mb-6">
                  The {t('app.name')} Admin Platform provides comprehensive tools for managing your farming network. 
                  As an administrator, you have access to powerful features that help you monitor farmers, 
                  track subscriptions, and analyze platform performance.
                </p>
                <p className="text-gray-600 text-lg leading-relaxed mb-6">
                  Our admin dashboard gives you real-time insights into farmer activity, subscription distribution, 
                  and profit tracking. You can view detailed statistics about each farmer, their subscription plans, 
                  and their total profits, helping you make informed decisions about platform growth and support.
                </p>
                <p className="text-gray-600 text-lg leading-relaxed">
                  With {t('app.name')}, you can efficiently manage your entire farming platform from one centralized 
                  location, ensuring smooth operations and providing the best support to your farmers.
                </p>
              </>
            ) : (
              <>
                <p className="text-gray-600 text-lg leading-relaxed mb-6">
                  {t('app.name')} {t('about.story.paragraph1')}
                </p>
                <p className="text-gray-600 text-lg leading-relaxed mb-6">
                  {t('about.story.paragraph2')}
                </p>
                <p className="text-gray-600 text-lg leading-relaxed">
                  {t('about.story.paragraph3.start')} {t('app.name')} {t('about.story.paragraph3.end')}
                </p>
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
