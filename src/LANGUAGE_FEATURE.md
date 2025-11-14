# Language Switcher Feature

## Overview
A comprehensive bilingual support system that allows users to switch between English and Arabic across the entire Farmer Assistant platform. The feature includes proper RTL (Right-to-Left) support for Arabic.

## Features Implemented

### 1. **Language Context System**
- Created `/utils/language.tsx` with a complete translation management system
- Supports English (en) and Arabic (ar)
- Persists language preference in localStorage
- Automatically updates document direction (LTR/RTL)

### 2. **Language Switcher Button**
- Located in the top right of the navigation bar
- Displays the opposite language name (shows "العربية" when in English, shows "English" when in Arabic)
- Uses the Languages icon from lucide-react
- Available on both desktop and mobile views
- Shows helpful tooltip on hover

### 3. **Translation Coverage**
Translations added for:
- **Navigation**: Home, Dashboard, Profile, About, Contact, Pricing, Login, Logout
- **Dashboard**: Welcome message, stats, crop overview, AI recommendations, alerts, activities
- **Login/Signup**: All form fields, buttons, messages, and help text
- **Contact Page**: All headings, labels, and content
- **Common UI**: Loading, Save, Cancel, Delete, Edit, Close, Search, etc.

### 4. **RTL Support**
- Automatic direction switching based on language
- Minimal CSS rules to avoid layout conflicts
- RTL handled by browser's native implementation
- Each page translated individually for better accuracy and layout control

## How to Use

### For Users:
1. **Desktop**: Click the language button in the top navigation bar
2. **Mobile**: Open the menu and tap the language switcher button
3. The page instantly switches to the selected language with proper layout direction

### For Developers:

#### Adding New Translations:
```tsx
// In /utils/language.tsx, add to both en and ar objects:
const translations = {
  en: {
    'your.key': 'Your English Text',
  },
  ar: {
    'your.key': 'النص العربي الخاص بك',
  },
};
```

#### Using Translations in Components:
```tsx
import { useLanguage } from '../utils/language';

function YourComponent() {
  const { t, language, dir } = useLanguage();
  
  return (
    <div>
      <h1>{t('your.key')}</h1>
      <p>Current language: {language}</p>
      <p>Current direction: {dir}</p>
    </div>
  );
}
```

#### Conditional Rendering Based on Language:
```tsx
{language === 'en' ? 'English Content' : 'محتوى عربي'}
```

## Files Modified

### Core Files:
1. `/utils/language.tsx` - Language context and comprehensive translation dictionary (NEW)
2. `/App.tsx` - Added LanguageProvider wrapper
3. `/components/Navbar.tsx` - Added language switcher button + app name translated
4. `/components/Footer.tsx` - Fully translated (app name, links, tagline, copyright)
5. `/styles/globals.css` - Minimal RTL support (direction only)

## Important Notes on Translation Strategy

### Why Page-by-Page Translation?
To avoid layout breaking issues with RTL, we're translating each page individually rather than applying global CSS transformations. This approach:
- Prevents the "split screen" issue where layouts break into 3 sections
- Allows for more accurate, context-specific translations
- Maintains visual consistency across languages
- Reduces conflicts with existing CSS frameworks

### Page Updates:
1. `/pages/Home.tsx` - **✅ FULLY TRANSLATED** (All sections: Hero, How It Works, AI Assistant, Features, Subscriptions, CTA)
2. `/pages/Dashboard.tsx` - **✅ FULLY TRANSLATED** (All sections: Stats, Crops, AI Recommendations, Markets, Alerts, Activity + ALL data arrays including crop names, alert messages, marketplace types, and activity logs)
3. `/pages/ExploreFarms.tsx` - **✅ FULLY TRANSLATED** (All sections: Header, Search/Filters, Featured Farms, Network Stats, Info Cards + ALL farm types, regions, and button labels)
4. `/pages/Profile.tsx` - **✅ FULLY TRANSLATED** (All sections: Header, Profile Picture, All Form Fields, Account Settings)
5. `/pages/About.tsx` - **✅ FULLY TRANSLATED** (All sections: Hero, Mission/Vision/Values, Impact Stats, Team, Sustainability, Story)
6. `/pages/Contact.tsx` - **✅ FULLY TRANSLATED** (All sections: Contact Form, Contact Info, Office Hours, FarmBot CTA, Location, FAQ Links)
7. `/pages/Login.tsx` - Partial translation support

## Technical Details

### Language Persistence
- Uses `localStorage.setItem('language', lang)` to save preference
- Automatically loads saved language on page refresh
- Defaults to English if no preference is saved

### Document Direction
- Automatically sets `document.documentElement.dir` to 'rtl' or 'ltr'
- Sets `document.documentElement.lang` to 'ar' or 'en'
- CSS selectors use `[dir="rtl"]` for RTL-specific styling

### Notification Integration
- Bilingual notification when switching languages
- Shows appropriate message based on current language

## Translation Keys Available

### Navigation (nav.*)
- home, dashboard, profile, about, contact, pricing, login, logout

### Dashboard (dashboard.*)
- welcome, subtitle, totalCrops, avgStock, alerts, markets
- cropOverview, addCrop, aiRecommendation, viewDetails, dismiss
- nearbyMarkets, viewMap, recentActivity, upgradePremium
- types, active, found, within, stockLevel, good, low, critical

### Login (login.*)
- welcomeBack, createAccount, subtitle, signupSubtitle
- firstName, lastName, email, password, rememberMe
- forgotPassword, loginButton, createButton, demoAccount
- orContinue, google, facebook, haveAccount, noAccount
- signup, terms, privacy, bySigningUp, and

### Contact (contact.*)
- title, subtitle, sendMessage, firstName, lastName
- email, subject, message, send, info, phone, address
- hours, needHelp, chatBot, chatNow, location

### Profile (profile.*)
- title, subtitle, personalInfo, fullName, email, phone
- farmInfo, farmName, farmSize, location, address
- bio, saveChanges, saving, profilePicture, uploadNew

### Common (common.*)
- loading, save, cancel, delete, edit, close
- search, filter, export, import, refresh
- settings, notifications, help, language

## Browser Compatibility
- Works on all modern browsers
- Properly handles RTL layout in Chrome, Firefox, Safari, Edge
- Mobile responsive on all devices

## Future Enhancements
Consider adding:
1. More languages (French, Spanish, etc.)
2. Auto-detect user's browser language
3. Translation for all remaining pages
4. Number and date formatting based on locale
5. Currency formatting for subscription prices
6. Translation for AI-generated content

## Testing Checklist
- [x] Language switcher appears in navbar
- [x] Button shows opposite language name
- [x] Clicking button switches language immediately
- [x] Preference persists after page refresh
- [x] RTL layout works correctly for Arabic
- [x] All translated pages display correctly
- [x] Mobile menu shows language switcher
- [x] Notifications appear in correct language
- [x] Direction changes apply to entire page

## Notes
- Some content (like crop names, user data) remains in the original input language
- AI-generated recommendations may need translation service integration
- Form validation messages should be translated in the backend
- Consider professional translation review for production use

## Support
For questions or issues with the language feature, check:
1. Language context is properly wrapped in App.tsx
2. Translation keys exist in language.tsx
3. useLanguage hook is imported in the component
4. Browser console for any errors
