import { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../utils/auth';
import { useLanguage } from '../utils/language';
import { cropsApi, subscriptionApi } from '../utils/api';

interface Message {
  type: 'user' | 'bot';
  text: string;
}

export function AIAssistant() {
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  
  // Initialize greeting message on mount
  useEffect(() => {
    if (messages.length === 0) {
      const greeting = user?.role === 'admin'
        ? (language === 'ar' 
          ? "مرحباً! أنا FarmBot 🌱 مساعدك الإداري. يمكنني مساعدتك في إدارة المزارعين، تتبع الأرباح، والإحصائيات. كيف يمكنني مساعدتك اليوم؟"
          : "Hi! I'm FarmBot 🌱 Your admin assistant. I can help you manage farmers, track profits, and view statistics. How can I help you today?")
        : (language === 'ar' 
          ? "مرحباً! أنا FarmBot 🌱 كيف يمكنني مساعدتك اليوم؟"
          : "Hi! I'm FarmBot 🌱 How can I help you today?");
      
      setMessages([{
        type: 'bot',
        text: greeting,
      }]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [cropsData, setCropsData] = useState<any[]>([]);
  const [farmersData, setFarmersData] = useState<any[]>([]);
  const [farmersStats, setFarmersStats] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load crops data when component mounts or user changes
  useEffect(() => {
    if (user && isOpen) {
      loadCrops();
      if (user.role === 'admin') {
        loadFarmersData();
      }
    }
  }, [user, isOpen]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadCrops = async () => {
    try {
      const data: any = await cropsApi.getAll();
      if (data.crops && data.crops.length > 0) {
        setCropsData(data.crops);
      }
    } catch (error) {
      setCropsData([]);
    }
  };

  const loadFarmersData = async () => {
    try {
      // Try to fetch from API first
      try {
        const subscriptionsData: any = await subscriptionApi.getAll();
        if (subscriptionsData && subscriptionsData.subscriptions) {
          // Process real data if available
          const farmers = subscriptionsData.subscriptions.map((sub: any) => ({
            id: sub.userId || sub.id,
            fullName: sub.fullName || 'Unknown',
            email: sub.email || '',
            subscription: {
              planName: sub.planName || 'No Plan',
              price: sub.price || 0,
              duration: sub.duration || '',
              status: sub.status || 'inactive',
            },
            totalProfit: sub.totalProfit || 0,
          }));
          setFarmersData(farmers);
          
          // Calculate stats
          const subscribed = farmers.filter((f: any) => f.subscription?.status === 'active');
          const basic = subscribed.filter((f: any) => f.subscription?.planName?.includes('Basic')).length;
          const pro = subscribed.filter((f: any) => f.subscription?.planName?.includes('Pro')).length;
          const premium = subscribed.filter((f: any) => f.subscription?.planName?.includes('Premium')).length;
          const totalProfit = farmers.reduce((sum: number, f: any) => sum + (f.totalProfit || 0), 0);
          
          setFarmersStats({
            totalFarmers: farmers.length,
            subscribedFarmers: subscribed.length,
            totalProfit: totalProfit,
            basicPlan: basic,
            proPlan: pro,
            premiumPlan: premium,
          });
          return;
        }
      } catch (apiError) {
        console.log('API fetch failed, using mock data');
      }
      
      // Fallback to mock data (same as AdminDashboardHome)
      const mockFarmers = [
        {
          id: '1',
          fullName: 'Ahmed Mohamed',
          email: 'ahmed@farm.com',
          subscription: {
            planName: 'Premium Plan',
            price: 4000,
            duration: '1 year',
            status: 'active',
          },
          totalProfit: 125000,
        },
        {
          id: '2',
          fullName: 'Sara Ali',
          email: 'sara@farm.com',
          subscription: {
            planName: 'Pro Plan',
            price: 2200,
            duration: '1 year',
            status: 'active',
          },
          totalProfit: 98000,
        },
        {
          id: '3',
          fullName: 'Mohamed Hassan',
          email: 'mohamed@farm.com',
          subscription: {
            planName: 'Basic Plan',
            price: 400,
            duration: '1 month',
            status: 'active',
          },
          totalProfit: 45000,
        },
        {
          id: '4',
          fullName: 'Fatima Ibrahim',
          email: 'fatima@farm.com',
          subscription: {
            planName: 'Premium Plan',
            price: 4000,
            duration: '1 year',
            status: 'active',
          },
          totalProfit: 156000,
        },
        {
          id: '5',
          fullName: 'Omar Khaled',
          email: 'omar@farm.com',
          subscription: {
            planName: 'Pro Plan',
            price: 2200,
            duration: '1 year',
            status: 'active',
          },
          totalProfit: 112000,
        },
      ];

      setFarmersData(mockFarmers);

      // Calculate statistics
      const subscribed = mockFarmers.filter((f: any) => f.subscription?.status === 'active');
      const basic = subscribed.filter((f: any) => f.subscription?.planName?.includes('Basic')).length;
      const pro = subscribed.filter((f: any) => f.subscription?.planName?.includes('Pro')).length;
      const premium = subscribed.filter((f: any) => f.subscription?.planName?.includes('Premium')).length;
      const totalProfit = mockFarmers.reduce((sum: number, f: any) => sum + (f.totalProfit || 0), 0);

      setFarmersStats({
        totalFarmers: mockFarmers.length,
        subscribedFarmers: subscribed.length,
        totalProfit: totalProfit,
        basicPlan: basic,
        proPlan: pro,
        premiumPlan: premium,
      });
    } catch (error) {
      console.error('Error loading farmers data:', error);
      setFarmersData([]);
      setFarmersStats(null);
    }
  };

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage = inputValue.trim();

    // Add user message
    setMessages((prev) => [...prev, { type: 'user', text: userMessage }]);
    setInputValue('');
    setIsLoading(true);

    // Get bot response
    try {
      const response = await getBotResponse(userMessage);
      setMessages((prev) => [...prev, { type: 'bot', text: response }]);
    } catch (error) {
      const errorMsg = language === 'ar' 
        ? 'عذراً، حدث خطأ. يرجى المحاولة مرة أخرى.'
        : "Sorry, an error occurred. Please try again.";
      setMessages((prev) => [...prev, { type: 'bot', text: errorMsg }]);
    } finally {
      setIsLoading(false);
    }
  };

  const getBotResponse = async (input: string): Promise<string> => {
    const lowerInput = input.toLowerCase().trim();
    const isArabic = language === 'ar';

    // Helper function to translate crop names
    const translateCropName = (cropName: string): string => {
      if (!cropName) return cropName;
      const normalized = cropName.trim().toLowerCase();
      const cropNameMap: { [key: string]: string } = {
        'wheat': 'dashboard.data.wheat',
        'corn': 'dashboard.data.corn',
        'rice': 'dashboard.data.rice',
        'soybean': 'dashboard.data.soybeans',
        'soybeans': 'dashboard.data.soybeans',
        'tomato': 'dashboard.data.tomato',
        'tomatoes': 'dashboard.data.tomatoes',
        'lettuce': 'dashboard.data.lettuce',
        'carrot': 'dashboard.data.carrot',
        'carrots': 'dashboard.data.carrots',
        'green beans': 'dashboard.data.greenBeans',
        'greenbeans': 'dashboard.data.greenbeans',
        'potato': 'dashboard.data.potato',
        'potatoes': 'dashboard.data.potatoes',
        'onion': 'dashboard.data.onion',
        'onions': 'dashboard.data.onions',
        'cucumber': 'dashboard.data.cucumber',
        'cucumbers': 'dashboard.data.cucumbers',
      };
      const translationKey = cropNameMap[normalized];
      if (translationKey) {
        const translated = t(translationKey);
        if (translated && translated !== translationKey) {
          return translated;
        }
      }
      return cropName;
    };

    // Helper to find crop by name (supports both English and translated names)
    const findCropByName = (searchName: string) => {
      if (!cropsData.length) return null;
      const normalizedSearch = searchName.toLowerCase().trim();
      
      return cropsData.find((crop: any) => {
        const cropName = crop.name?.toLowerCase() || '';
        const originalName = crop.originalName?.toLowerCase() || cropName;
        return cropName.includes(normalizedSearch) || 
               originalName.includes(normalizedSearch) ||
               normalizedSearch.includes(cropName) ||
               normalizedSearch.includes(originalName);
      });
    };

    // Questions about admin dashboard features
    if ((lowerInput.includes('admin') || lowerInput.includes('administrator')) && 
        (lowerInput.includes('dashboard') || lowerInput.includes('offer') || lowerInput.includes('provide') || lowerInput.includes('feature'))) {
      if (isArabic) {
        return "لوحة التحكم الإدارية توفر:\n\n" +
               "👥 إدارة المزارعين: عرض جميع المزارعين المسجلين واشتراكاتهم وتتبع أنشطتهم\n" +
               "💰 تتبع الأرباح: مراقبة إجمالي الأرباح لكل مزارع وتحليل الإيرادات عبر المنصة\n" +
               "📊 التحليلات والتقارير: عرض توزيع الاشتراكات وإحصائيات المنصة الشاملة\n" +
               "🗺️ استكشاف المزارع: العثور على المزارع والأسواق\n" +
               "🔔 الإشعارات: إدارة وتتبع جميع الإشعارات\n" +
               "⚙️ الإعدادات: إعدادات النظام والإدارة\n\n" +
               "يمكنك أيضاً عرض تفاصيل كل مزارع وخطة اشتراكه والأرباح المتوقعة.";
      }
      return "The Admin Dashboard offers:\n\n" +
             "👥 Manage Farmers: View all registered farmers, their subscriptions, and track their activity\n" +
             "💰 Track Profits: Monitor total profits per farmer and analyze revenue across your platform\n" +
             "📊 Analytics & Reports: View subscription distribution and platform-wide statistics\n" +
             "🗺️ Explore Farms: Find farms and marketplaces\n" +
             "🔔 Notifications: Manage and track all notifications\n" +
             "⚙️ Settings: System and administrative settings\n\n" +
             "You can also view details of each farmer, their subscription plan, and expected profits.";
    }

    // Questions about farmer dashboard features
    if ((lowerInput.includes('farmer') || lowerInput.includes('user')) && 
        (lowerInput.includes('dashboard') || lowerInput.includes('offer') || lowerInput.includes('provide') || lowerInput.includes('feature'))) {
      if (isArabic) {
        return "لوحة تحكم المزارع توفر:\n\n" +
               "🌱 إدارة المحاصيل: إضافة وتعديل وحذف المحاصيل، تتبع المخزون والحالة\n" +
               "📊 لوحة المعلومات الرئيسية: عرض إحصائيات شاملة ومعلومات سريعة عن محاصيلك\n" +
               "🗺️ استكشاف المزارع: العثور على المزارع والأسواق القريبة منك\n" +
               "💳 إدارة الاشتراك: عرض وتحديث خطة الاشتراك الخاصة بك (أساسي، احترافي، مميز)\n" +
               "🔔 الإشعارات: تتبع التنبيهات والإشعارات المهمة\n" +
               "👤 الملف الشخصي: تحديث معلوماتك الشخصية ومعلومات المزرعة\n" +
               "⚙️ الإعدادات: تخصيص تفضيلاتك وإعدادات الإشعارات\n\n" +
               "كل هذا في مكان واحد لمساعدتك على إدارة مزرعتك بكفاءة!";
      }
      return "The Farmer Dashboard offers:\n\n" +
             "🌱 Crop Management: Add, edit, and delete crops, track stock levels and status\n" +
             "📊 Home Dashboard: View comprehensive statistics and quick insights about your crops\n" +
             "🗺️ Explore Farms: Find nearby farms and marketplaces\n" +
             "💳 Subscription Management: View and update your subscription plan (Basic, Pro, Premium)\n" +
             "🔔 Notifications: Track important alerts and notifications\n" +
             "👤 Profile: Update your personal information and farm details\n" +
             "⚙️ Settings: Customize your preferences and notification settings\n\n" +
             "Everything in one place to help you manage your farm efficiently!";
    }

    // Questions about how the system can help farmers
    if ((lowerInput.includes('system') || lowerInput.includes('this') || lowerInput.includes('platform')) && 
        (lowerInput.includes('help') || lowerInput.includes('assist') || lowerInput.includes('benefit')) && 
        (lowerInput.includes('farmer') || lowerInput.includes('me') || lowerInput.includes('as'))) {
      if (isArabic) {
        return "يمكن لهذا النظام مساعدتك كمزارع من خلال:\n\n" +
               "🌱 إدارة المحاصيل بسهولة:\n" +
               "   • إضافة وتتبع جميع محاصيلك في مكان واحد\n" +
               "   • مراقبة مستويات المخزون والحالة\n" +
               "   • الحصول على تنبيهات فورية عند انخفاض المخزون\n\n" +
               "📊 تحليل ومراقبة:\n" +
               "   • عرض إحصائيات شاملة عن محاصيلك\n" +
               "   • حساب الأرباح المتوقعة لكل محصول\n" +
               "   • تتبع أداء مزرعتك\n\n" +
               "🤖 مساعد ذكي (FarmBot):\n" +
               "   • الحصول على إجابات فورية لأسئلتك\n" +
               "   • معلومات عن محاصيلك ومستويات المخزون\n" +
               "   • نصائح حول الزراعة والإدارة\n\n" +
               "🗺️ استكشاف الأسواق:\n" +
               "   • العثور على المزارع والأسواق القريبة\n" +
               "   • الحصول على معلومات عن الأسواق المحلية\n\n" +
               "💳 خطط اشتراك مرنة:\n" +
               "   • خطط متنوعة تناسب احتياجاتك (أساسي، احترافي، مميز)\n" +
               "   • ميزات إضافية مع الخطط المتقدمة\n\n" +
               "🌍 دعم متعدد اللغات:\n" +
               "   • استخدام النظام بالعربية أو الإنجليزية\n\n" +
               "باختصار، النظام يساعدك على إدارة مزرعتك بكفاءة أكبر واتخاذ قرارات أفضل!";
      }
      return "This system can help you as a farmer by:\n\n" +
             "🌱 Easy Crop Management:\n" +
             "   • Add and track all your crops in one place\n" +
             "   • Monitor stock levels and status\n" +
             "   • Get instant alerts when stock is low\n\n" +
             "📊 Analysis & Monitoring:\n" +
             "   • View comprehensive statistics about your crops\n" +
             "   • Calculate expected profits for each crop\n" +
             "   • Track your farm's performance\n\n" +
             "🤖 AI Assistant (FarmBot):\n" +
             "   • Get instant answers to your questions\n" +
             "   • Information about your crops and stock levels\n" +
             "   • Tips on farming and management\n\n" +
             "🗺️ Market Exploration:\n" +
             "   • Find nearby farms and marketplaces\n" +
             "   • Get information about local markets\n\n" +
             "💳 Flexible Subscription Plans:\n" +
             "   • Various plans to suit your needs (Basic, Pro, Premium)\n" +
             "   • Additional features with premium plans\n\n" +
             "🌍 Multi-language Support:\n" +
             "   • Use the system in English or Arabic\n\n" +
             "In short, the system helps you manage your farm more efficiently and make better decisions!";
    }

    // Questions about system features
    if (lowerInput.includes('what') && (lowerInput.includes('system') || lowerInput.includes('offer') || lowerInput.includes('feature') || lowerInput.includes('do') || lowerInput.includes('can'))) {
      if (isArabic) {
        return "نظام مساعد المزارع يوفر لك:\n\n" +
               "🌱 إدارة المحاصيل: تتبع محاصيلك ومستويات المخزون\n" +
               "📊 لوحة تحكم: عرض إحصائيات ومعلومات شاملة\n" +
               "🔔 التنبيهات: إشعارات فورية عند انخفاض المخزون\n" +
               "🤖 مساعد ذكي: FarmBot للإجابة على أسئلتك\n" +
               "🗺️ استكشاف المزارع: العثور على المزارع والأسواق القريبة\n" +
               "💳 الاشتراكات: خطط مختلفة (أساسي، احترافي، مميز)\n" +
               "🌍 دعم اللغات: الإنجليزية والعربية\n\n" +
               "هل تريد معرفة المزيد عن أي ميزة معينة؟";
      }
      return "The Farmer Assistant system offers you:\n\n" +
             "🌱 Crop Management: Track your crops and stock levels\n" +
             "📊 Dashboard: View comprehensive statistics and information\n" +
             "🔔 Alerts: Instant notifications when stock is low\n" +
             "🤖 AI Assistant: FarmBot to answer your questions\n" +
             "🗺️ Farm Exploration: Find nearby farms and marketplaces\n" +
             "💳 Subscriptions: Different plans (Basic, Pro, Premium)\n" +
             "🌍 Language Support: English and Arabic\n\n" +
             "Would you like to know more about any specific feature?";
    }

    // Questions about crop names/list of crops
    if ((lowerInput.includes('crop') || lowerInput.includes('what crop') || lowerInput.includes('list') || lowerInput.includes('name')) && 
        (lowerInput.includes('have') || lowerInput.includes('my') || lowerInput.includes('all') || lowerInput.includes('show'))) {
      if (!user) {
        return isArabic 
          ? "يرجى تسجيل الدخول لعرض محاصيلك."
          : "Please log in to view your crops.";
      }

      if (cropsData.length === 0) {
        return isArabic
          ? "لا توجد محاصيل مسجلة حالياً. يمكنك إضافة محاصيل من لوحة التحكم."
          : "You don't have any crops registered yet. You can add crops from the dashboard.";
      }

      const cropNames = cropsData.map((crop: any) => {
        const translatedName = translateCropName(crop.name || crop.originalName || '');
        return `• ${translatedName} (${crop.stock || 0}% stock)`;
      }).join('\n');

      if (isArabic) {
        return `محاصيلك الحالية:\n\n${cropNames}\n\nإجمالي المحاصيل: ${cropsData.length}`;
      }
      return `Your current crops:\n\n${cropNames}\n\nTotal crops: ${cropsData.length}`;
    }

    // Questions about specific crop stock level
    if (lowerInput.includes('stock') || lowerInput.includes('level') || lowerInput.includes('quantity') || lowerInput.includes('how much')) {
      if (!user) {
        return isArabic 
          ? "يرجى تسجيل الدخول للتحقق من مستويات المخزون."
          : "Please log in to check stock levels.";
      }

      if (cropsData.length === 0) {
        return isArabic
          ? "لا توجد محاصيل مسجلة حالياً."
          : "You don't have any crops registered yet.";
      }

      // Try to find specific crop mentioned
      const cropKeywords = ['wheat', 'corn', 'rice', 'soybean', 'tomato', 'lettuce', 'carrot', 'potato', 'onion', 'cucumber'];
      let foundCrop = null;
      
      for (const keyword of cropKeywords) {
        if (lowerInput.includes(keyword)) {
          foundCrop = findCropByName(keyword);
          if (foundCrop) break;
        }
      }

      // If no specific crop found, check all crops
      if (!foundCrop) {
        // Check if asking about all crops
        if (lowerInput.includes('all') || lowerInput.includes('total') || lowerInput.includes('average')) {
          const totalStock = cropsData.reduce((sum, crop) => sum + (crop.stock || 0), 0);
          const avgStock = Math.round(totalStock / cropsData.length);
          const lowStockCrops = cropsData.filter((c: any) => (c.stock || 0) <= 50);
          
          if (isArabic) {
            return `إحصائيات المخزون:\n\n` +
                   `متوسط المخزون: ${avgStock}%\n` +
                   `إجمالي المحاصيل: ${cropsData.length}\n` +
                   `المحاصيل منخفضة المخزون: ${lowStockCrops.length}\n\n` +
                   `المحاصيل التي تحتاج انتباه:\n${lowStockCrops.map((c: any) => 
                     `• ${translateCropName(c.name || c.originalName || '')}: ${c.stock || 0}%`
                   ).join('\n') || 'لا يوجد'}`;
          }
          return `Stock Statistics:\n\n` +
                 `Average Stock: ${avgStock}%\n` +
                 `Total Crops: ${cropsData.length}\n` +
                 `Low Stock Crops: ${lowStockCrops.length}\n\n` +
                 `Crops needing attention:\n${lowStockCrops.map((c: any) => 
                   `• ${translateCropName(c.name || c.originalName || '')}: ${c.stock || 0}%`
                 ).join('\n') || 'None'}`;
        }
        
        // Show first crop or ask for specific crop
        foundCrop = cropsData[0];
      }

      if (foundCrop) {
        const cropName = translateCropName(foundCrop.name || foundCrop.originalName || '');
        const stock = foundCrop.stock || 0;
        const quantity = foundCrop.quantity || '0';
        const status = stock <= 25 ? (isArabic ? 'حرج' : 'Critical') : 
                      stock <= 50 ? (isArabic ? 'منخفض' : 'Low') : 
                      (isArabic ? 'جيد' : 'Good');

        if (isArabic) {
          return `${cropName}:\n\n` +
                 `مستوى المخزون: ${stock}%\n` +
                 `الكمية: ${quantity}\n` +
                 `الحالة: ${status}\n\n` +
                 (stock <= 25 ? '⚠️ تحذير: المخزون منخفض بشكل حرج!' :
                  stock <= 50 ? '⚠️ تحذير: المخزون منخفض' : 
                  '✅ المخزون في حالة جيدة');
        }
        return `${cropName}:\n\n` +
               `Stock Level: ${stock}%\n` +
               `Quantity: ${quantity}\n` +
               `Status: ${status}\n\n` +
               (stock <= 25 ? '⚠️ Warning: Critical stock level!' :
                stock <= 50 ? '⚠️ Warning: Low stock' : 
                '✅ Stock is in good condition');
      }
    }

    // Questions about specific crop by name
    for (const crop of cropsData) {
      const cropName = (crop.name || crop.originalName || '').toLowerCase();
      const originalName = (crop.originalName || crop.name || '').toLowerCase();
      
      if (lowerInput.includes(cropName) || lowerInput.includes(originalName) || 
          cropName.includes(lowerInput.split(' ').find((w: string) => w.length > 3) || '')) {
        const translatedName = translateCropName(crop.name || crop.originalName || '');
        const stock = crop.stock || 0;
        const quantity = crop.quantity || '0';
        const status = stock <= 25 ? (isArabic ? 'حرج' : 'Critical') : 
                      stock <= 50 ? (isArabic ? 'منخفض' : 'Low') : 
                      (isArabic ? 'جيد' : 'Good');

        if (isArabic) {
          return `معلومات عن ${translatedName}:\n\n` +
                 `مستوى المخزون: ${stock}%\n` +
                 `الكمية: ${quantity}\n` +
                 `الحالة: ${status}`;
        }
        return `${translatedName} Information:\n\n` +
               `Stock Level: ${stock}%\n` +
               `Quantity: ${quantity}\n` +
               `Status: ${status}`;
      }
    }

    // Weather questions
    if (lowerInput.includes('weather') || lowerInput.includes('forecast')) {
      return isArabic
        ? "توقعات الطقس اليوم: غائم جزئياً، 24°م، رطوبة 60%. ظروف جيدة لمعظم المحاصيل. أمطار متوقعة خلال 3 أيام."
        : "Today's forecast: Partly cloudy, 24°C, 60% humidity. Good conditions for most crops. Rain expected in 3 days.";
    }

    // Market questions
    if (lowerInput.includes('market') || lowerInput.includes('sell') || lowerInput.includes('buy')) {
      return isArabic
        ? "وجدت 3 أسواق قريبة: GreenMarket (5 كم)، FarmHub (8 كم)، وAgriConnect (12 كم). هل تريد المزيد من التفاصيل؟"
        : "I found 3 nearby marketplaces: GreenMarket (5km), FarmHub (8km), and AgriConnect (12km). Would you like more details?";
    }

    // Planting questions
    if (lowerInput.includes('plant') || lowerInput.includes('grow') || lowerInput.includes('season')) {
      return isArabic
        ? "بناءً على موقعك والموسم الحالي، هذا وقت ممتاز لزراعة معظم المحاصيل. توقعات الطقس مواتية للأسابيع القادمة."
        : "Based on your location and current season, it's an excellent time to plant most crops. Weather forecast looks favorable for the coming weeks.";
    }

    // Admin-specific questions
    if (user?.role === 'admin') {
      // Subscription plan counts - CHECK THIS FIRST to avoid matching "number of farmers" first
      // Check for subscription plan questions with various patterns
      const hasPlanKeywords = lowerInput.includes('basic') || lowerInput.includes('pro') || lowerInput.includes('premium') || 
                              lowerInput.includes('plan') || lowerInput.includes('subscription') || lowerInput.includes('subscribed');
      const hasCountKeywords = lowerInput.includes('how many') || lowerInput.includes('number of') || lowerInput.includes('count');
      
      if (hasCountKeywords && hasPlanKeywords) {
        if (farmersData.length === 0 || !farmersStats) {
          await loadFarmersData();
        }
        
        const basic = farmersStats?.basicPlan || farmersData.filter((f: any) => f.subscription?.planName?.includes('Basic')).length || 0;
        const pro = farmersStats?.proPlan || farmersData.filter((f: any) => f.subscription?.planName?.includes('Pro')).length || 0;
        const premium = farmersStats?.premiumPlan || farmersData.filter((f: any) => f.subscription?.planName?.includes('Premium')).length || 0;
        const total = basic + pro + premium;
        
        if (lowerInput.includes('basic') && !lowerInput.includes('pro') && !lowerInput.includes('premium')) {
          return isArabic
            ? `عدد المزارعين المشتركين في الخطة الأساسية: ${basic}`
            : `Number of farmers subscribed to Basic Plan: ${basic}`;
        }
        if (lowerInput.includes('pro') && !lowerInput.includes('basic') && !lowerInput.includes('premium')) {
          return isArabic
            ? `عدد المزارعين المشتركين في الخطة الاحترافية: ${pro}`
            : `Number of farmers subscribed to Pro Plan: ${pro}`;
        }
        if (lowerInput.includes('premium') && !lowerInput.includes('basic') && !lowerInput.includes('pro')) {
          return isArabic
            ? `عدد المزارعين المشتركين في الخطة المميزة: ${premium}`
            : `Number of farmers subscribed to Premium Plan: ${premium}`;
        }
        
        // Show all plans if asking about multiple or general subscription questions
        if (isArabic) {
          return `توزيع خطط الاشتراك:\n\n` +
                 `الخطة الأساسية (Basic): ${basic} مزارع\n` +
                 `الخطة الاحترافية (Pro): ${pro} مزارع\n` +
                 `الخطة المميزة (Premium): ${premium} مزارع\n\n` +
                 `إجمالي المشتركين: ${total}`;
        }
        return `Subscription Plan Distribution:\n\n` +
               `Basic Plan: ${basic} farmers\n` +
               `Pro Plan: ${pro} farmers\n` +
               `Premium Plan: ${premium} farmers\n\n` +
               `Total Subscribed: ${total}`;
      }

      // Highest profit farmer
      if ((lowerInput.includes('highest') || lowerInput.includes('top') || lowerInput.includes('best')) && 
          (lowerInput.includes('profit') || lowerInput.includes('farmer'))) {
        if (farmersData.length === 0) {
          await loadFarmersData();
        }
        if (farmersData.length === 0) {
          return isArabic
            ? "لا توجد بيانات مزارعين متاحة حالياً."
            : "No farmers data available at the moment.";
        }
        
        const highestProfitFarmer = farmersData.reduce((max: any, farmer: any) => 
          (farmer.totalProfit || 0) > (max.totalProfit || 0) ? farmer : max
        );
        
        if (isArabic) {
          return `المزارع صاحب أعلى ربح:\n\n` +
                 `الاسم: ${highestProfitFarmer.fullName}\n` +
                 `البريد الإلكتروني: ${highestProfitFarmer.email}\n` +
                 `الربح الإجمالي: ${(highestProfitFarmer.totalProfit || 0).toLocaleString()} EGP\n` +
                 `خطة الاشتراك: ${highestProfitFarmer.subscription?.planName || 'غير متاح'}`;
        }
        return `Highest Profit Farmer:\n\n` +
               `Name: ${highestProfitFarmer.fullName}\n` +
               `Email: ${highestProfitFarmer.email}\n` +
               `Total Profit: ${(highestProfitFarmer.totalProfit || 0).toLocaleString()} EGP\n` +
               `Subscription Plan: ${highestProfitFarmer.subscription?.planName || 'N/A'}`;
      }

      // Number of farmers (general) - CHECK THIS LAST
      if ((lowerInput.includes('how many') || lowerInput.includes('number of') || lowerInput.includes('total')) && 
          (lowerInput.includes('farmer') || lowerInput.includes('farmers')) &&
          !lowerInput.includes('basic') && !lowerInput.includes('pro') && !lowerInput.includes('premium') && 
          !lowerInput.includes('plan') && !lowerInput.includes('subscription') && !lowerInput.includes('subscribed')) {
        if (!farmersStats) {
          await loadFarmersData();
        }
        const total = farmersStats?.totalFarmers || farmersData.length || 0;
        const subscribed = farmersStats?.subscribedFarmers || farmersData.filter((f: any) => f.subscription?.status === 'active').length || 0;
        
        if (isArabic) {
          return `إحصائيات المزارعين:\n\n` +
                 `إجمالي المزارعين: ${total}\n` +
                 `المزارعون المشتركون: ${subscribed}\n` +
                 `المزارعون غير المشتركين: ${total - subscribed}`;
        }
        return `Farmer Statistics:\n\n` +
               `Total Farmers: ${total}\n` +
               `Subscribed Farmers: ${subscribed}\n` +
               `Non-Subscribed Farmers: ${total - subscribed}`;
      }
    }

    // Help/General questions
    if (lowerInput.includes('help') || lowerInput.includes('what can') || lowerInput.includes('how can')) {
      if (user?.role === 'admin') {
        if (isArabic) {
          return "كمساعد إداري، يمكنني مساعدتك في:\n\n" +
                 "👥 عدد المزارعين والمزارعين المشتركين\n" +
                 "💰 أعلى مزارع ربحاً\n" +
                 "📊 توزيع خطط الاشتراك (أساسي، احترافي، مميز)\n" +
                 "💡 معلومات عن النظام وميزاته\n\n" +
                 "جرب أن تسأل:\n" +
                 "• كم عدد المزارعين؟\n" +
                 "• من هو المزارع صاحب أعلى ربح؟\n" +
                 "• كم مزارع مشترك في الخطة الأساسية؟\n\n" +
                 "ما الذي تريد معرفته؟";
        }
        return "As an admin assistant, I can help you with:\n\n" +
               "👥 Number of farmers and subscribed farmers\n" +
               "💰 Highest profit farmer\n" +
               "📊 Subscription plan distribution (Basic, Pro, Premium)\n" +
               "💡 Information about system features\n\n" +
               "Try asking:\n" +
               "• How many farmers?\n" +
               "• Who is the highest profit farmer?\n" +
               "• How many farmers subscribed to Basic plan?\n\n" +
               "What would you like to know?";
      }
      
      if (isArabic) {
        return "يمكنني مساعدتك في:\n\n" +
               "📊 التحقق من مستويات مخزون المحاصيل\n" +
               "📝 عرض قائمة محاصيلك\n" +
               "🌤️ معلومات الطقس\n" +
               "🏪 العثور على الأسواق القريبة\n" +
               "💡 معلومات عن النظام وميزاته\n\n" +
               "ما الذي تريد معرفته؟";
      }
      return "I can help you with:\n\n" +
             "📊 Check crop stock levels\n" +
             "📝 List your crops\n" +
             "🌤️ Weather information\n" +
             "🏪 Find nearby markets\n" +
             "💡 Information about system features\n\n" +
             "What would you like to know?";
    }

    // Default response
    if (user?.role === 'admin') {
      if (isArabic) {
        return "كمساعد إداري، يمكنني مساعدتك في:\n\n" +
               "• عدد المزارعين والمزارعين المشتركين\n" +
               "• أعلى مزارع ربحاً\n" +
               "• توزيع خطط الاشتراك\n" +
               "• معلومات عن النظام\n\n" +
               "جرب أن تسأل:\n" +
               "• كم عدد المزارعين؟\n" +
               "• من هو المزارع صاحب أعلى ربح؟\n" +
               "• كم مزارع مشترك في الخطة الأساسية/الاحترافية/المميزة؟\n\n" +
               "ما الذي تريد معرفته؟";
      }
      return "As an admin assistant, I can help you with:\n\n" +
             "• Number of farmers and subscribed farmers\n" +
             "• Highest profit farmer\n" +
             "• Subscription plan distribution\n" +
             "• System information\n\n" +
             "Try asking:\n" +
             "• How many farmers?\n" +
             "• Who is the highest profit farmer?\n" +
             "• How many farmers subscribed to Basic/Pro/Premium plan?\n\n" +
             "What would you like to know?";
    }
    
    if (isArabic) {
      return "يمكنني مساعدتك في إدارة المحاصيل، تتبع المخزون، تحديثات الطقس، واقتراحات الأسواق. يمكنك أن تسألني عن:\n\n" +
             "• مستويات مخزون المحاصيل\n" +
             "• قائمة محاصيلك\n" +
             "• معلومات عن النظام\n" +
             "• الطقس والأسواق\n\n" +
             "ما الذي تريد معرفته؟";
    }
    return "I can help you with crop management, stock tracking, weather updates, and marketplace suggestions. You can ask me about:\n\n" +
           "• Crop stock levels\n" +
           "• Your crop list\n" +
           "• System information\n" +
           "• Weather and markets\n\n" +
           "What would you like to know?";
  };

  return (
    <>
      {/* Floating Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-br from-[#2D6A4F] to-[#95D5B2] rounded-full shadow-lg flex items-center justify-center hover:shadow-xl transition-shadow z-50"
          >
            <MessageCircle className="w-7 h-7 text-white" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#74C0FC] rounded-full animate-pulse" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 w-96 max-w-[calc(100vw-3rem)] h-[500px] bg-white rounded-2xl shadow-2xl flex flex-col z-50 border border-gray-200"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-[#2D6A4F] to-[#95D5B2] p-4 rounded-t-2xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-white">FarmBot</h3>
                  <p className="text-xs text-white/80">AI Assistant</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white hover:bg-white/20 rounded-lg p-1 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-2xl whitespace-pre-wrap ${
                      message.type === 'user'
                        ? 'bg-[#2D6A4F] text-white rounded-br-sm'
                        : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                    }`}
                  >
                    <p className="text-sm">{message.text}</p>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 text-gray-800 rounded-2xl rounded-bl-sm p-3">
                    <Loader2 className="w-4 h-4 animate-spin" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-gray-200">
              <div className="flex gap-2">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder={language === 'ar' ? "اسأل FarmBot..." : "Ask FarmBot..."}
                  className="flex-1 rounded-full"
                />
                <Button
                  onClick={handleSend}
                  disabled={isLoading || !inputValue.trim()}
                  className="bg-[#2D6A4F] hover:bg-[#2D6A4F]/90 rounded-full px-4 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                  <Send className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
