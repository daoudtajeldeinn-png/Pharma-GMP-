// Internationalization (i18n) System for PharmaPro Academy
const I18n = {
  currentLanguage: 'ar',
  translations: {
    ar: {
      // Navigation
      'nav.home': 'الرئيسية',
      'nav.dashboard': 'لوحة التحكم',
      'nav.courses': 'الكورسات',
      'nav.resources': 'الموارد',
      'nav.forums': 'المنتديات',
      'nav.admin': 'المشرف',
      
      // Hero Section
      'hero.title': 'PharmaPro Academy',
      'hero.subtitle': 'منصة تدريبية متخصصة في ممارسات التصنيع الجيد (GMP)، معايير ISO، والتحكم في الجودة للمهنيين في الصناعة الصيدلانية',
      'hero.cta.primary': 'ابدأ التعلم',
      'hero.cta.secondary': 'استكشف الكورسات',
      
      // Courses
      'courses.title': 'الكورسات',
      'courses.all': 'جميع الكورسات',
      'courses.level.beginner': 'مبتدئ',
      'courses.level.intermediate': 'متوسط',
      'courses.level.advanced': 'متقدم',
      
      // Case Studies
      'case_studies.title': 'دراسات الحالة',
      'case_studies.description': 'دراسات حالة واقعية في مجال GMP و CAPA',
      
      // Simulation
      'simulation.title': 'المحاكاة الافتراضية',
      'simulation.description': 'محاكاة عمليات GMP بشكل تفاعلي',
      
      // Visual Library
      'visual_library.title': 'المكتبة المرئية',
      'visual_library.description': 'إنفوجرافيك تعليمية',
      
      // Templates
      'templates.title': 'القوالب',
      'templates.description': 'قوالب قابلة للتحرير',
      
      // Calculators
      'calculators.title': 'أدوات الحساب',
      'calculators.description': 'أدوات حسابية متخصصة',
      
      // Dictionary
      'dictionary.title': 'القاموس',
      'dictionary.description': 'قاموس المصطلحات الصيدلانية',
      
      // Quick Reference
      'quick_reference.title': 'الدليل السريع',
      'quick_reference.description': 'مرجع سريع للمعلومات',
      
      // Forums
      'forums.title': 'المنتديات',
      'forums.description': 'منتديات النقاش',
      
      // Common
      'common.loading': 'جاري التحميل...',
      'common.error': 'حدث خطأ',
      'common.success': 'تم بنجاح',
      'common.save': 'حفظ',
      'common.cancel': 'إلغاء',
      'common.delete': 'حذف',
      'common.edit': 'تعديل',
      'common.search': 'بحث',
      'common.filter': 'تصفية',
      'common.all': 'الكل',
      'common.back': 'رجوع',
      'common.next': 'التالي',
      'common.previous': 'السابق',
      'common.submit': 'إرسال',
      'common.close': 'إغلاق',
      'common.download': 'تحميل',
      'common.share': 'مشاركة',
      'common.copy': 'نسخ',
      'common.view': 'عرض',
      'common.more': 'المزيد',
      'common.less': 'أقل'
    },
    en: {
      // Navigation
      'nav.home': 'Home',
      'nav.dashboard': 'Dashboard',
      'nav.courses': 'Courses',
      'nav.resources': 'Resources',
      'nav.forums': 'Forums',
      'nav.admin': 'Admin',
      
      // Hero Section
      'hero.title': 'PharmaPro Academy',
      'hero.subtitle': 'Specialized training platform in Good Manufacturing Practices (GMP), ISO standards, and Quality Control for pharmaceutical industry professionals',
      'hero.cta.primary': 'Start Learning',
      'hero.cta.secondary': 'Explore Courses',
      
      // Courses
      'courses.title': 'Courses',
      'courses.all': 'All Courses',
      'courses.level.beginner': 'Beginner',
      'courses.level.intermediate': 'Intermediate',
      'courses.level.advanced': 'Advanced',
      
      // Case Studies
      'case_studies.title': 'Case Studies',
      'case_studies.description': 'Real-world case studies in GMP and CAPA',
      
      // Simulation
      'simulation.title': 'Virtual Simulation',
      'simulation.description': 'Interactive GMP process simulation',
      
      // Visual Library
      'visual_library.title': 'Visual Library',
      'visual_library.description': 'Educational infographics',
      
      // Templates
      'templates.title': 'Templates',
      'templates.description': 'Editable templates',
      
      // Calculators
      'calculators.title': 'Calculators',
      'calculators.description': 'Specialized calculation tools',
      
      // Dictionary
      'dictionary.title': 'Dictionary',
      'dictionary.description': 'Pharmaceutical terminology dictionary',
      
      // Quick Reference
      'quick_reference.title': 'Quick Reference',
      'quick_reference.description': 'Quick reference guide',
      
      // Forums
      'forums.title': 'Forums',
      'forums.description': 'Discussion forums',
      
      // Common
      'common.loading': 'Loading...',
      'common.error': 'An error occurred',
      'common.success': 'Success',
      'common.save': 'Save',
      'common.cancel': 'Cancel',
      'common.delete': 'Delete',
      'common.edit': 'Edit',
      'common.search': 'Search',
      'common.filter': 'Filter',
      'common.all': 'All',
      'common.back': 'Back',
      'common.next': 'Next',
      'common.previous': 'Previous',
      'common.submit': 'Submit',
      'common.close': 'Close',
      'common.download': 'Download',
      'common.share': 'Share',
      'common.copy': 'Copy',
      'common.view': 'View',
      'common.more': 'More',
      'common.less': 'Less'
    },
    fr: {
      // Navigation
      'nav.home': 'Accueil',
      'nav.dashboard': 'Tableau de bord',
      'nav.courses': 'Cours',
      'nav.resources': 'Ressources',
      'nav.forums': 'Forums',
      'nav.admin': 'Admin',
      
      // Hero Section
      'hero.title': 'PharmaPro Academy',
      'hero.subtitle': 'Plateforme de formation spécialisée dans les Bonnes Pratiques de Fabrication (GMP), les normes ISO et le Contrôle Qualité pour les professionnels de l\'industrie pharmaceutique',
      'hero.cta.primary': 'Commencer l\'apprentissage',
      'hero.cta.secondary': 'Explorer les cours',
      
      // Courses
      'courses.title': 'Cours',
      'courses.all': 'Tous les cours',
      'courses.level.beginner': 'Débutant',
      'courses.level.intermediate': 'Intermédiaire',
      'courses.level.advanced': 'Avancé',
      
      // Case Studies
      'case_studies.title': 'Études de cas',
      'case_studies.description': 'Études de cas réels en GMP et CAPA',
      
      // Simulation
      'simulation.title': 'Simulation virtuelle',
      'simulation.description': 'Simulation interactive des processus GMP',
      
      // Visual Library
      'visual_library.title': 'Bibliothèque visuelle',
      'visual_library.description': 'Infographies éducatives',
      
      // Templates
      'templates.title': 'Modèles',
      'templates.description': 'Modèles modifiables',
      
      // Calculators
      'calculators.title': 'Calculateurs',
      'calculators.description': 'Outils de calcul spécialisés',
      
      // Dictionary
      'dictionary.title': 'Dictionnaire',
      'dictionary.description': 'Dictionnaire de terminologie pharmaceutique',
      
      // Quick Reference
      'quick_reference.title': 'Guide rapide',
      'quick_reference.description': 'Guide de référence rapide',
      
      // Forums
      'forums.title': 'Forums',
      'forums.description': 'Forums de discussion',
      
      // Common
      'common.loading': 'Chargement...',
      'common.error': 'Une erreur est survenue',
      'common.success': 'Succès',
      'common.save': 'Enregistrer',
      'common.cancel': 'Annuler',
      'common.delete': 'Supprimer',
      'common.edit': 'Modifier',
      'common.search': 'Rechercher',
      'common.filter': 'Filtrer',
      'common.all': 'Tout',
      'common.back': 'Retour',
      'common.next': 'Suivant',
      'common.previous': 'Précédent',
      'common.submit': 'Soumettre',
      'common.close': 'Fermer',
      'common.download': 'Télécharger',
      'common.share': 'Partager',
      'common.copy': 'Copier',
      'common.view': 'Voir',
      'common.more': 'Plus',
      'common.less': 'Moins'
    }
  },
  
  init() {
    this.loadLanguage();
    this.setupLanguageSwitcher();
    this.applyLanguage();
  },
  
  loadLanguage() {
    const saved = localStorage.getItem('preferred_language');
    if (saved && this.translations[saved]) {
      this.currentLanguage = saved;
    } else {
      // Detect browser language
      const browserLang = navigator.language.split('-')[0];
      if (this.translations[browserLang]) {
        this.currentLanguage = browserLang;
      }
    }
  },
  
  saveLanguage() {
    localStorage.setItem('preferred_language', this.currentLanguage);
  },
  
  setLanguage(lang) {
    if (this.translations[lang]) {
      this.currentLanguage = lang;
      this.saveLanguage();
      this.applyLanguage();
      return true;
    }
    return false;
  },
  
  get(key) {
    return this.translations[this.currentLanguage][key] || key;
  },
  
  applyLanguage() {
    // Update HTML lang and dir attributes
    document.documentElement.lang = this.currentLanguage;
    document.documentElement.dir = this.currentLanguage === 'ar' ? 'rtl' : 'ltr';
    
    // Update all elements with data-i18n attribute
    document.querySelectorAll('[data-i18n]').forEach(element => {
      const key = element.getAttribute('data-i18n');
      element.textContent = this.get(key);
    });
    
    // Update placeholders
    document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
      const key = element.getAttribute('data-i18n-placeholder');
      element.placeholder = this.get(key);
    });
    
    // Update language switcher
    this.updateLanguageSwitcher();
  },
  
  setupLanguageSwitcher() {
    // Create language switcher if it doesn't exist
    if (!document.getElementById('languageSwitcher')) {
      const switcher = document.createElement('div');
      switcher.id = 'languageSwitcher';
      switcher.style.cssText = `
        position: fixed;
        top: 80px;
        left: 20px;
        z-index: 1000;
        background: var(--card-bg);
        border: 1px solid var(--border);
        border-radius: 8px;
        padding: 8px;
        display: flex;
        gap: 8px;
      `;
      
      const languages = [
        { code: 'ar', name: 'العربية', flag: '🇸🇩' },
        { code: 'en', name: 'English', flag: '🇬🇧' },
        { code: 'fr', name: 'Français', flag: '🇫🇷' }
      ];
      
      languages.forEach(lang => {
        const btn = document.createElement('button');
        btn.textContent = `${lang.flag} ${lang.name}`;
        btn.style.cssText = `
          background: ${this.currentLanguage === lang.code ? 'var(--teal)' : 'transparent'};
          color: ${this.currentLanguage === lang.code ? 'var(--navy)' : 'var(--light)'};
          border: none;
          padding: 6px 12px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 0.85rem;
          transition: all 0.2s;
        `;
        btn.onclick = () => {
          this.setLanguage(lang.code);
        };
        switcher.appendChild(btn);
      });
      
      document.body.appendChild(switcher);
    }
  },
  
  updateLanguageSwitcher() {
    const switcher = document.getElementById('languageSwitcher');
    if (switcher) {
      const buttons = switcher.querySelectorAll('button');
      const languages = ['ar', 'en', 'fr'];
      
      buttons.forEach((btn, index) => {
        const langCode = languages[index];
        btn.style.background = this.currentLanguage === langCode ? 'var(--teal)' : 'transparent';
        btn.style.color = this.currentLanguage === langCode ? 'var(--navy)' : 'var(--light)';
      });
    }
  },
  
  getAvailableLanguages() {
    return Object.keys(this.translations);
  },
  
  addTranslation(lang, translations) {
    this.translations[lang] = { ...this.translations[lang], ...translations };
  },
  
  getCurrentLanguage() {
    return this.currentLanguage;
  }
};

// Initialize i18n on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  I18n.init();
});

// Export for global access
window.I18n = I18n;
