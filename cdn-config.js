// CDN Configuration for PharmaPro Academy
const CDNConfig = {
  // CDN providers
  providers: {
    cloudflare: {
      enabled: true,
      url: 'https://cdn.pharmapro-academy.com',
      zones: ['global', 'middle-east', 'africa']
    },
    cloudinary: {
      enabled: true,
      url: 'https://res.cloudinary.com/pharmpro/image/upload',
      transformations: {
        quality: 'auto',
        format: 'auto'
      }
    },
    jsdelivr: {
      enabled: true,
      url: 'https://cdn.jsdelivr.net/npm'
    }
  },
  
  // Static assets to serve via CDN
  staticAssets: {
    images: ['assets/*.png', 'assets/*.jpg', 'assets/*.svg'],
    fonts: ['assets/fonts/*'],
    css: ['css/*.css'],
    js: ['js/*.js']
  },
  
  // CDN URL generator
  getCDNUrl(originalPath, provider = 'cloudflare') {
    if (!this.providers[provider] || !this.providers[provider].enabled) {
      return originalPath;
    }
    
    const cdnBase = this.providers[provider].url;
    return `${cdnBase}/${originalPath}`;
  },
  
  // Optimize image URL for CDN
  optimizeImageUrl(imagePath, options = {}) {
    const { width, height, quality, format } = options;
    
    if (this.providers.cloudinary.enabled) {
      let transformations = [];
      
      if (width) transformations.push(`w_${width}`);
      if (height) transformations.push(`h_${height}`);
      if (quality) transformations.push(`q_${quality}`);
      if (format) transformations.push(`f_${format}`);
      
      const transformString = transformations.join(',');
      return `${this.providers.cloudinary.url}/${transformString}/${imagePath}`;
    }
    
    return this.getCDNUrl(imagePath);
  },
  
  // Load script from CDN
  loadScriptFromCDN(scriptPath, provider = 'jsdelivr') {
    const cdnUrl = this.getCDNUrl(scriptPath, provider);
    const script = document.createElement('script');
    script.src = cdnUrl;
    script.async = true;
    document.head.appendChild(script);
    return script;
  },
  
  // Load CSS from CDN
  loadCSSFromCDN(cssPath, provider = 'cloudflare') {
    const cdnUrl = this.getCDNUrl(cssPath, provider);
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = cdnUrl;
    document.head.appendChild(link);
    return link;
  },
  
  // Preload critical resources
  preloadCriticalResources() {
    const criticalResources = [
      { type: 'style', href: '/css/styles.css' },
      { type: 'style', href: '/css/common.css' },
      { type: 'script', href: '/js/common.js' },
      { type: 'font', href: '/assets/fonts/Cairo.woff2' }
    ];
    
    criticalResources.forEach(resource => {
      const link = document.createElement('link');
      link.rel = 'preload';
      
      if (resource.type === 'style') {
        link.as = 'style';
        link.href = this.getCDNUrl(resource.href);
      } else if (resource.type === 'script') {
        link.as = 'script';
        link.href = this.getCDNUrl(resource.href);
      } else if (resource.type === 'font') {
        link.as = 'font';
        link.type = 'font/woff2';
        link.crossOrigin = 'anonymous';
        link.href = this.getCDNUrl(resource.href);
      }
      
      document.head.appendChild(link);
    });
  },
  
  // DNS prefetch for CDN domains
  setupDNSPrefetch() {
    const cdnDomains = [
      'https://cdn.pharmapro-academy.com',
      'https://res.cloudinary.com',
      'https://cdn.jsdelivr.net'
    ];
    
    cdnDomains.forEach(domain => {
      const link = document.createElement('link');
      link.rel = 'dns-prefetch';
      link.href = domain;
      document.head.appendChild(link);
    });
  },
  
  // Connection preconnect for CDN domains
  setupPreconnect() {
    const cdnDomains = [
      'https://cdn.pharmapro-academy.com',
      'https://res.cloudinary.com'
    ];
    
    cdnDomains.forEach(domain => {
      const link = document.createElement('link');
      link.rel = 'preconnect';
      link.href = domain;
      document.head.appendChild(link);
    });
  },
  
  // Initialize CDN
  init() {
    this.setupDNSPrefetch();
    this.setupPreconnect();
    this.preloadCriticalResources();
  }
};

// Initialize CDN on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  CDNConfig.init();
});

// Export for global access
window.CDNConfig = CDNConfig;
