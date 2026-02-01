import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useState, useEffect } from 'react';
const LANGUAGE_STORAGE_KEY = 'travelxpressa-language';
// Translation strings
const translations = {
    en: {
        // Navigation
        'nav.home': 'Home',
        'nav.blog': 'Blog',
        'nav.news': 'News',
        'nav.about': 'About',
        'nav.learnMore': 'Learn More',
        'nav.application': 'Application',
        'nav.profile': 'Profile',
        'nav.payments': 'Payments',
        'nav.admin': 'Admin',
        'nav.overview': 'Overview',
        'nav.users': 'Users',
        'nav.applications': 'Applications',
        'nav.cms': 'CMS',
        'nav.signIn': 'Sign In',
        'nav.getStarted': 'Get Started',
        'nav.logout': 'Logout',
        // Common
        'common.loading': 'Loading...',
        'common.save': 'Save',
        'common.cancel': 'Cancel',
        'common.delete': 'Delete',
        'common.edit': 'Edit',
        'common.create': 'Create',
        'common.search': 'Search',
        'common.viewAll': 'View All',
        // Auth
        'auth.email': 'Email',
        'auth.password': 'Password',
        'auth.login': 'Login',
        'auth.register': 'Register',
        'auth.forgotPassword': 'Forgot Password?',
        // Home
        'home.hero.badge': 'Trusted by 10,000+ Travelers',
        'home.hero.title': 'Your Journey to the',
        'home.hero.titleHighlight': 'United States',
        'home.hero.titleEnd': 'Starts Here',
        'home.hero.description': 'TravelXpressa simplifies the DS-160 visa application process. Expert guidance, real-time support, and a seamless experience from start to finish.',
        'home.hero.cta': 'Start Your Application',
        'home.features.title': 'Why Choose TravelXpressa',
        'home.features.subtitle': "We've helped thousands of travelers successfully complete their visa applications",
        'home.articles.title': 'Featured Articles',
        'home.articles.subtitle': 'Stay informed with our latest visa guides and updates',
        'home.news.title': 'Latest News',
        'home.news.subtitle': 'Updates from the US Embassy and immigration services',
        'home.cta.title': 'Ready to Start Your Visa Journey?',
        'home.cta.description': 'Join thousands of satisfied travelers who have successfully obtained their US visa through TravelXpressa.',
        'home.cta.button': 'Get Started Today',
        // Admin
        'admin.dashboard': 'Admin Dashboard',
        'admin.welcome': 'Welcome back',
        'admin.totalUsers': 'Total Users',
        'admin.applications': 'Applications',
        'admin.approved': 'Approved',
        'admin.pending': 'Pending',
        // CMS
        'cms.title': 'Content Management',
        'cms.subtitle': 'Manage blog posts and news articles',
        'cms.newBlog': 'New Blog Post',
        'cms.newNews': 'New News',
        'cms.blogPosts': 'Blog Posts',
        'cms.newsArticles': 'News Articles',
        'cms.published': 'Published',
        'cms.drafts': 'Drafts',
        // Footer
        'footer.privacyPolicy': 'Privacy Policy',
        'footer.termsOfService': 'Terms of Service',
        'footer.allRightsReserved': 'All rights reserved.',
    },
    mn: {
        // Navigation
        'nav.home': 'Нүүр',
        'nav.blog': 'Блог',
        'nav.news': 'Мэдээ',
        'nav.about': 'Бидний тухай',
        'nav.learnMore': 'Дэлгэрэнгүй',
        'nav.application': 'Өргөдөл',
        'nav.profile': 'Профайл',
        'nav.payments': 'Төлбөр',
        'nav.admin': 'Админ',
        'nav.overview': 'Ерөнхий',
        'nav.users': 'Хэрэглэгчид',
        'nav.applications': 'Өргөдлүүд',
        'nav.cms': 'Контент',
        'nav.signIn': 'Нэвтрэх',
        'nav.getStarted': 'Эхлэх',
        'nav.logout': 'Гарах',
        // Common
        'common.loading': 'Уншиж байна...',
        'common.save': 'Хадгалах',
        'common.cancel': 'Болих',
        'common.delete': 'Устгах',
        'common.edit': 'Засах',
        'common.create': 'Үүсгэх',
        'common.search': 'Хайх',
        'common.viewAll': 'Бүгдийг харах',
        // Auth
        'auth.email': 'Имэйл',
        'auth.password': 'Нууц үг',
        'auth.login': 'Нэвтрэх',
        'auth.register': 'Бүртгүүлэх',
        'auth.forgotPassword': 'Нууц үгээ мартсан?',
        // Home
        'home.hero.badge': '10,000+ зорчигчдын итгэл',
        'home.hero.title': 'Таны аялал',
        'home.hero.titleHighlight': 'Америк руу',
        'home.hero.titleEnd': 'эндээс эхэлнэ',
        'home.hero.description': 'TravelXpressa нь DS-160 визний өргөдлийн процессыг хялбаршуулна. Мэргэжлийн зөвлөгөө, шууд дэмжлэг, төгс туршлага.',
        'home.hero.cta': 'Өргөдөл гаргах',
        'home.features.title': 'Яагаад биднийг сонгох вэ',
        'home.features.subtitle': 'Бид мянга мянган зорчигчдод визний өргөдлөө амжилттай бөглөхөд туслсан',
        'home.articles.title': 'Онцлох нийтлэлүүд',
        'home.articles.subtitle': 'Визний гарын авлага болон шинэчлэлтүүдийг дагах',
        'home.news.title': 'Сүүлийн мэдээ',
        'home.news.subtitle': 'АНУ-ын Элчин сайдын яамны мэдээлэл',
        'home.cta.title': 'Визний аялалаа эхлүүлэхэд бэлэн үү?',
        'home.cta.description': 'TravelXpressa-аар дамжуулан АНУ-ын виз амжилттай авсан мянга мянган зорчигчидтой нэгдээрэй.',
        'home.cta.button': 'Өнөөдөр эхлэх',
        // Admin
        'admin.dashboard': 'Админ хяналтын самбар',
        'admin.welcome': 'Тавтай морилно уу',
        'admin.totalUsers': 'Нийт хэрэглэгчид',
        'admin.applications': 'Өргөдлүүд',
        'admin.approved': 'Зөвшөөрөгдсөн',
        'admin.pending': 'Хүлээгдэж буй',
        // CMS
        'cms.title': 'Контент менежмент',
        'cms.subtitle': 'Блог болон мэдээний нийтлэлүүдийг удирдах',
        'cms.newBlog': 'Шинэ блог',
        'cms.newNews': 'Шинэ мэдээ',
        'cms.blogPosts': 'Блог нийтлэлүүд',
        'cms.newsArticles': 'Мэдээний нийтлэлүүд',
        'cms.published': 'Нийтлэгдсэн',
        'cms.drafts': 'Ноорог',
        // Footer
        'footer.privacyPolicy': 'Нууцлалын бодлого',
        'footer.termsOfService': 'Үйлчилгээний нөхцөл',
        'footer.allRightsReserved': 'Бүх эрх хуулиар хамгаалагдсан.',
    },
};
const LanguageContext = createContext(undefined);
export const LanguageProvider = ({ children }) => {
    const [language, setLanguageState] = useState(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY);
            if (saved === 'en' || saved === 'mn') {
                return saved;
            }
        }
        return 'en';
    });
    useEffect(() => {
        localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
        document.documentElement.lang = language;
    }, [language]);
    const setLanguage = (lang) => {
        setLanguageState(lang);
    };
    const t = (key) => {
        return translations[language][key] || key;
    };
    return (_jsx(LanguageContext.Provider, { value: { language, setLanguage, t }, children: children }));
};
export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};
export default LanguageContext;
