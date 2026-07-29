// Social Media Integration System for PharmaPro Academy
const SocialIntegration = {
  platforms: {
    facebook: {
      enabled: true,
      name: 'Facebook',
      shareUrl: 'https://www.facebook.com/sharer/sharer.php',
      icon: '📘'
    },
    twitter: {
      enabled: true,
      name: 'Twitter',
      shareUrl: 'https://twitter.com/intent/tweet',
      icon: '🐦'
    },
    linkedin: {
      enabled: true,
      name: 'LinkedIn',
      shareUrl: 'https://www.linkedin.com/sharing/share-offsite/',
      icon: '💼'
    },
    whatsapp: {
      enabled: true,
      name: 'WhatsApp',
      shareUrl: 'https://wa.me/',
      icon: '💬'
    },
    telegram: {
      enabled: true,
      name: 'Telegram',
      shareUrl: 'https://t.me/share/url',
      icon: '✈️'
    }
  },
  
  socialPosts: [],
  
  init() {
    this.loadSocialPosts();
    this.setupSocialShareButtons();
    this.setupSocialTracking();
  },
  
  loadSocialPosts() {
    const saved = localStorage.getItem('social_posts');
    if (saved) {
      this.socialPosts = JSON.parse(saved);
    }
  },
  
  saveSocialPosts() {
    localStorage.setItem('social_posts', JSON.stringify(this.socialPosts));
  },
  
  // Share content on social media
  shareContent(platform, content) {
    const platformConfig = this.platforms[platform];
    
    if (!platformConfig || !platformConfig.enabled) {
      console.error('Platform not enabled:', platform);
      return false;
    }
    
    let shareUrl = platformConfig.shareUrl;
    const params = new URLSearchParams();
    
    switch (platform) {
      case 'facebook':
        params.append('u', content.url);
        break;
      case 'twitter':
        params.append('text', content.text);
        params.append('url', content.url);
        params.append('hashtags', content.hashtags || '');
        break;
      case 'linkedin':
        params.append('url', content.url);
        break;
      case 'whatsapp':
        shareUrl += content.phone || '';
        params.append('text', `${content.text} ${content.url}`);
        break;
      case 'telegram':
        params.append('url', content.url);
        params.append('text', content.text);
        break;
    }
    
    const finalUrl = `${shareUrl}?${params.toString()}`;
    window.open(finalUrl, '_blank', 'width=600,height=400');
    
    // Track share
    this.trackShare(platform, content);
    
    return true;
  },
  
  // Track social share
  trackShare(platform, content) {
    const share = {
      id: Date.now(),
      platform: platform,
      content: content,
      timestamp: new Date()
    };
    
    this.socialPosts.push(share);
    this.saveSocialPosts();
    
    // Track in analytics
    if (window.AnalyticsSystem) {
      AnalyticsSystem.trackEvent('social_share', {
        platform: platform,
        contentType: content.type
      });
    }
  },
  
  // Setup social share buttons
  setupSocialShareButtons() {
    // Add social share buttons to page if they don't exist
    if (!document.getElementById('socialShareButtons')) {
      const container = document.createElement('div');
      container.id = 'socialShareButtons';
      container.style.cssText = `
        position: fixed;
        bottom: 20px;
        left: 20px;
        z-index: 1000;
        display: flex;
        flex-direction: column;
        gap: 10px;
      `;
      
      Object.keys(this.platforms).forEach(platform => {
        const btn = document.createElement('button');
        btn.innerHTML = this.platforms[platform].icon;
        btn.title = this.platforms[platform].name;
        btn.style.cssText = `
          width: 50px;
          height: 50px;
          border-radius: 50%;
          border: none;
          cursor: pointer;
          font-size: 1.5rem;
          transition: transform 0.2s;
          background: var(--card-bg);
          border: 1px solid var(--border);
        `;
        
        btn.onclick = () => {
          const content = {
            url: window.location.href,
            text: document.title,
            hashtags: 'PharmaPro,GMP,QualityControl',
            type: 'page'
          };
          this.shareContent(platform, content);
        };
        
        container.appendChild(btn);
      });
      
      document.body.appendChild(container);
    }
  },
  
  // Setup social tracking
  setupSocialTracking() {
    // Track social media referrals
    const referrer = document.referrer;
    if (referrer) {
      const platform = this.detectSocialPlatform(referrer);
      if (platform) {
        this.trackSocialReferral(platform, referrer);
      }
    }
  },
  
  // Detect social platform from URL
  detectSocialPlatform(url) {
    if (url.includes('facebook.com')) return 'facebook';
    if (url.includes('twitter.com') || url.includes('x.com')) return 'twitter';
    if (url.includes('linkedin.com')) return 'linkedin';
    if (url.includes('whatsapp.com')) return 'whatsapp';
    if (url.includes('telegram.org')) return 'telegram';
    return null;
  },
  
  // Track social referral
  trackSocialReferral(platform, referrer) {
    const referral = {
      id: Date.now(),
      platform: platform,
      referrer: referrer,
      timestamp: new Date()
    };
    
    const referrals = JSON.parse(localStorage.getItem('social_referrals') || '[]');
    referrals.push(referral);
    localStorage.setItem('social_referrals', JSON.stringify(referrals));
    
    // Track in analytics
    if (window.AnalyticsSystem) {
      AnalyticsSystem.trackEvent('social_referral', {
        platform: platform
      });
    }
  },
  
  // Share certificate
  shareCertificate(certificateId) {
    const content = {
      url: `${window.location.origin}/certificate/${certificateId}`,
      text: 'حصلت على شهادة من PharmaPro Academy! 🎉',
      hashtags: 'PharmaPro,Certificate,GMP',
      type: 'certificate'
    };
    
    // Show share modal
    this.showShareModal(content);
  },
  
  // Share course completion
  shareCourseCompletion(courseName) {
    const content = {
      url: window.location.href,
      text: `أكملت كورس ${courseName} بنجاح على PharmaPro Academy! 📚`,
      hashtags: 'PharmaPro,Course,GMP',
      type: 'course'
    };
    
    this.showShareModal(content);
  },
  
  // Show share modal
  showShareModal(content) {
    const modal = document.createElement('div');
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0,0,0,0.8);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 2000;
    `;
    
    const modalContent = document.createElement('div');
    modalContent.style.cssText = `
      background: var(--card-bg);
      padding: 2rem;
      border-radius: 16px;
      max-width: 400px;
      width: 90%;
      text-align: center;
    `;
    
    modalContent.innerHTML = `
      <h3 style="color: var(--white); margin-bottom: 1rem;">مشاركة على وسائل التواصل</h3>
      <div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; margin-bottom: 1.5rem;">
      </div>
      <button id="closeShareModal" style="background: var(--navy3); color: var(--white); border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer;">إغلاق</button>
    `;
    
    const buttonsContainer = modalContent.querySelector('div');
    
    Object.keys(this.platforms).forEach(platform => {
      const btn = document.createElement('button');
      btn.innerHTML = `${this.platforms[platform].icon} ${this.platforms[platform].name}`;
      btn.style.cssText = `
        background: var(--teal);
        color: var(--navy);
        border: none;
        padding: 10px 20px;
        border-radius: 8px;
        cursor: pointer;
        font-weight: bold;
      `;
      
      btn.onclick = () => {
        this.shareContent(platform, content);
        modal.remove();
      };
      
      buttonsContainer.appendChild(btn);
    });
    
    modalContent.querySelector('#closeShareModal').onclick = () => {
      modal.remove();
    };
    
    modal.appendChild(modalContent);
    document.body.appendChild(modal);
  },
  
  // Get social stats
  getSocialStats() {
    const referrals = JSON.parse(localStorage.getItem('social_referrals') || '[]');
    
    const platformStats = {};
    Object.keys(this.platforms).forEach(platform => {
      platformStats[platform] = referrals.filter(r => r.platform === platform).length;
    });
    
    return {
      totalShares: this.socialPosts.length,
      totalReferrals: referrals.length,
      platformStats: platformStats
    };
  },
  
  // Enable/disable platform
  setPlatformEnabled(platform, enabled) {
    if (this.platforms[platform]) {
      this.platforms[platform].enabled = enabled;
      return true;
    }
    return false;
  },
  
  // Get enabled platforms
  getEnabledPlatforms() {
    return Object.keys(this.platforms).filter(p => this.platforms[p].enabled);
  }
};

// Initialize social integration on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  SocialIntegration.init();
});

// Export for global access
window.SocialIntegration = SocialIntegration;
