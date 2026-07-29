// Affiliate Program for PharmaPro Academy
const AffiliateProgram = {
  affiliates: [],
  commissions: {
    signup: { rate: 0.10, description: '10% عمولة على التسجيل' },
    course_purchase: { rate: 0.20, description: '20% عمولة على شراء الكورس' },
    subscription: { rate: 0.15, description: '15% عمولة على الاشتراكات' }
  },
  
  init() {
    this.loadAffiliates();
    this.setupAffiliateTracking();
  },
  
  loadAffiliates() {
    const saved = localStorage.getItem('affiliates');
    if (saved) {
      this.affiliates = JSON.parse(saved);
    }
  },
  
  saveAffiliates() {
    localStorage.setItem('affiliates', JSON.stringify(this.affiliates));
  },
  
  // Apply to become affiliate
  applyToAffiliate(userId, applicationData) {
    const application = {
      id: this.generateAffiliateId(),
      userId: userId,
      name: applicationData.name,
      email: applicationData.email,
      website: applicationData.website,
      socialMedia: applicationData.socialMedia,
      reason: applicationData.reason,
      status: 'pending',
      appliedAt: new Date(),
      affiliateCode: null,
      stats: {
        clicks: 0,
        signups: 0,
        purchases: 0,
        revenue: 0
      },
      commissions: {
        totalEarned: 0,
        totalPaid: 0,
        pending: 0
      }
    };
    
    this.affiliates.push(application);
    this.saveAffiliates();
    
    return application;
  },
  
  generateAffiliateId() {
    return 'affiliate_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  },
  
  // Approve affiliate application
  approveAffiliate(affiliateId) {
    const affiliate = this.affiliates.find(a => a.id === affiliateId);
    
    if (!affiliate) {
      return { success: false, reason: 'Affiliate not found' };
    }
    
    affiliate.status = 'approved';
    affiliate.approvedAt = new Date();
    affiliate.affiliateCode = this.generateAffiliateCode(affiliate.userId);
    
    this.saveAffiliates();
    
    // Send notification
    this.sendAffiliateNotification(affiliate, 'approved');
    
    return { success: true, affiliate: affiliate };
  },
  
  // Reject affiliate application
  rejectAffiliate(affiliateId, reason) {
    const affiliate = this.affiliates.find(a => a.id === affiliateId);
    
    if (!affiliate) {
      return { success: false, reason: 'Affiliate not found' };
    }
    
    affiliate.status = 'rejected';
    affiliate.rejectedAt = new Date();
    affiliate.rejectionReason = reason;
    
    this.saveAffiliates();
    
    // Send notification
    this.sendAffiliateNotification(affiliate, 'rejected');
    
    return { success: true };
  },
  
  generateAffiliateCode(userId) {
    return 'AFF-' + userId.substring(0, 4).toUpperCase() + '-' + Math.random().toString(36).substr(2, 6).toUpperCase();
  },
  
  // Get affiliate by user ID
  getAffiliateByUserId(userId) {
    return this.affiliates.find(a => a.userId === userId);
  },
  
  // Track affiliate click
  trackAffiliateClick(code) {
    const affiliate = this.affiliates.find(a => a.affiliateCode === code && a.status === 'approved');
    
    if (!affiliate) {
      return { success: false, reason: 'Invalid affiliate code' };
    }
    
    affiliate.stats.clicks++;
    this.saveAffiliates();
    
    // Store affiliate code in session
    sessionStorage.setItem('affiliate_code', code);
    
    return { success: true, affiliate: affiliate };
  },
  
  // Process affiliate signup
  processAffiliateSignup(newUserId) {
    const affiliateCode = sessionStorage.getItem('affiliate_code');
    
    if (!affiliateCode) {
      return { success: false, reason: 'No affiliate code' };
    }
    
    const affiliate = this.affiliates.find(a => a.affiliateCode === affiliateCode && a.status === 'approved');
    
    if (!affiliate) {
      return { success: false, reason: 'Invalid affiliate code' };
    }
    
    affiliate.stats.signups++;
    
    // Calculate commission
    const commission = this.calculateCommission('signup', 0);
    affiliate.commissions.totalEarned += commission;
    affiliate.commissions.pending += commission;
    
    this.saveAffiliates();
    
    // Clear affiliate code from session
    sessionStorage.removeItem('affiliate_code');
    
    // Track in analytics
    if (window.AnalyticsSystem) {
      AnalyticsSystem.trackEvent('affiliate_signup', {
        affiliateId: affiliate.id,
        newUserId: newUserId,
        commission: commission
      });
    }
    
    return { success: true, affiliate: affiliate, commission: commission };
  },
  
  // Process affiliate purchase
  processAffiliatePurchase(purchaseAmount) {
    const affiliateCode = sessionStorage.getItem('affiliate_code');
    
    if (!affiliateCode) {
      return { success: false, reason: 'No affiliate code' };
    }
    
    const affiliate = this.affiliates.find(a => a.affiliateCode === affiliateCode && a.status === 'approved');
    
    if (!affiliate) {
      return { success: false, reason: 'Invalid affiliate code' };
    }
    
    affiliate.stats.purchases++;
    affiliate.stats.revenue += purchaseAmount;
    
    // Calculate commission
    const commission = this.calculateCommission('course_purchase', purchaseAmount);
    affiliate.commissions.totalEarned += commission;
    affiliate.commissions.pending += commission;
    
    this.saveAffiliates();
    
    // Track in analytics
    if (window.AnalyticsSystem) {
      AnalyticsSystem.trackEvent('affiliate_purchase', {
        affiliateId: affiliate.id,
        amount: purchaseAmount,
        commission: commission
      });
    }
    
    return { success: true, affiliate: affiliate, commission: commission };
  },
  
  // Calculate commission
  calculateCommission(type, amount) {
    const commissionConfig = this.commissions[type];
    
    if (!commissionConfig) {
      return 0;
    }
    
    return amount * commissionConfig.rate;
  },
  
  // Request payout
  requestPayout(affiliateId) {
    const affiliate = this.affiliates.find(a => a.id === affiliateId);
    
    if (!affiliate) {
      return { success: false, reason: 'Affiliate not found' };
    }
    
    if (affiliate.commissions.pending < 50) {
      return { success: false, reason: 'Minimum payout is $50' };
    }
    
    const payout = {
      id: this.generatePayoutId(),
      affiliateId: affiliateId,
      amount: affiliate.commissions.pending,
      status: 'pending',
      requestedAt: new Date()
    };
    
    affiliate.commissions.totalPaid += affiliate.commissions.pending;
    affiliate.commissions.pending = 0;
    
    this.saveAffiliates();
    
    // Save payout
    const payouts = JSON.parse(localStorage.getItem('affiliate_payouts') || '[]');
    payouts.push(payout);
    localStorage.setItem('affiliate_payouts', JSON.stringify(payouts));
    
    return { success: true, payout: payout };
  },
  
  generatePayoutId() {
    return 'payout_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  },
  
  // Process payout
  processPayout(payoutId) {
    const payouts = JSON.parse(localStorage.getItem('affiliate_payouts') || '[]');
    const payout = payouts.find(p => p.id === payoutId);
    
    if (!payout) {
      return { success: false, reason: 'Payout not found' };
    }
    
    payout.status = 'paid';
    payout.processedAt = new Date();
    
    localStorage.setItem('affiliate_payouts', JSON.stringify(payouts));
    
    // Send notification to affiliate
    const affiliate = this.affiliates.find(a => a.id === payout.affiliateId);
    if (affiliate) {
      this.sendAffiliateNotification(affiliate, 'payout', { amount: payout.amount });
    }
    
    return { success: true, payout: payout };
  },
  
  // Send affiliate notification
  sendAffiliateNotification(affiliate, type, data = {}) {
    const notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
    
    let message = '';
    switch (type) {
      case 'approved':
        message = `تم قبول طلبك للانضمام لبرنامج الشركاء! كود الشريك: ${affiliate.affiliateCode}`;
        break;
      case 'rejected':
        message = `تم رفض طلبك للانضمام لبرنامج الشركاء. السبب: ${affiliate.rejectionReason}`;
        break;
      case 'payout':
        message = `تمت معالجة دفعة عمولة بقيمة $${data.amount}`;
        break;
    }
    
    notifications.push({
      id: Date.now(),
      type: 'affiliate',
      message: message,
      read: false,
      createdAt: new Date()
    });
    
    localStorage.setItem('notifications', JSON.stringify(notifications));
  },
  
  // Get affiliate stats
  getAffiliateStats(affiliateId) {
    const affiliate = this.affiliates.find(a => a.id === affiliateId);
    
    if (!affiliate) {
      return null;
    }
    
    return {
      code: affiliate.affiliateCode,
      stats: affiliate.stats,
      commissions: affiliate.commissions,
      conversionRate: affiliate.stats.clicks > 0 
        ? ((affiliate.stats.signups / affiliate.stats.clicks) * 100).toFixed(2) 
        : 0,
      avgCommission: affiliate.stats.purchases > 0 
        ? (affiliate.commissions.totalEarned / affiliate.stats.purchases).toFixed(2) 
        : 0
    };
  },
  
  // Generate affiliate link
  generateAffiliateLink(code) {
    return `${window.location.origin}?aff=${code}`;
  },
  
  // Get affiliate leaderboard
  getAffiliateLeaderboard(limit = 10) {
    const leaderboard = [...this.affiliates]
      .filter(a => a.status === 'approved')
      .sort((a, b) => b.commissions.totalEarned - a.commissions.totalEarned)
      .slice(0, limit)
      .map((affiliate, index) => ({
        rank: index + 1,
        name: affiliate.name,
        code: affiliate.affiliateCode,
        signups: affiliate.stats.signups,
        purchases: affiliate.stats.purchases,
        totalEarned: affiliate.commissions.totalEarned,
        totalPaid: affiliate.commissions.totalPaid
      }));
    
    return leaderboard;
  },
  
  // Get pending applications
  getPendingApplications() {
    return this.affiliates.filter(a => a.status === 'pending');
  },
  
  // Get approved affiliates
  getApprovedAffiliates() {
    return this.affiliates.filter(a => a.status === 'approved');
  },
  
  // Get affiliate marketing materials
  getMarketingMaterials(affiliateCode) {
    return {
      banners: [
        {
          id: 'banner_1',
          name: 'بانر رئيسي',
          size: '728x90',
          url: `${window.location.origin}/assets/banners/banner-728x90.png?aff=${affiliateCode}`
        },
        {
          id: 'banner_2',
          name: 'بانر مربع',
          size: '300x250',
          url: `${window.location.origin}/assets/banners/banner-300x250.png?aff=${affiliateCode}`
        },
        {
          id: 'banner_3',
          name: 'بانر طويل',
          size: '160x600',
          url: `${window.location.origin}/assets/banners/banner-160x600.png?aff=${affiliateCode}`
        }
      ],
      textLinks: [
        {
          id: 'text_1',
          name: 'نص قصير',
          text: 'تعلم GMP مع PharmaPro Academy',
          url: this.generateAffiliateLink(affiliateCode)
        },
        {
          id: 'text_2',
          name: 'نص طويل',
          text: 'انضم إلى PharmaPro Academy وتعلم ممارسات التصنيع الجيد والتحكم في الجودة',
          url: this.generateAffiliateLink(affiliateCode)
        }
      ],
      socialPosts: [
        {
          id: 'social_1',
          platform: 'twitter',
          text: 'اكتشف أفضل كورسات GMP على PharmaPro Academy! 🎓 #GMP #QualityControl',
          url: this.generateAffiliateLink(affiliateCode)
        },
        {
          id: 'social_2',
          platform: 'linkedin',
          text: 'PharmaPro Academy تقدم تدريباً متخصصاً في GMP والتحكم في الجودة للمهنيين في الصناعة الصيدلانية',
          url: this.generateAffiliateLink(affiliateCode)
        }
      ]
    };
  },
  
  // Get overall affiliate stats
  getOverallStats() {
    const approvedAffiliates = this.affiliates.filter(a => a.status === 'approved');
    const pendingApplications = this.affiliates.filter(a => a.status === 'pending');
    
    let totalClicks = 0;
    let totalSignups = 0;
    let totalPurchases = 0;
    let totalRevenue = 0;
    let totalEarned = 0;
    let totalPaid = 0;
    let totalPending = 0;
    
    approvedAffiliates.forEach(affiliate => {
      totalClicks += affiliate.stats.clicks;
      totalSignups += affiliate.stats.signups;
      totalPurchases += affiliate.stats.purchases;
      totalRevenue += affiliate.stats.revenue;
      totalEarned += affiliate.commissions.totalEarned;
      totalPaid += affiliate.commissions.totalPaid;
      totalPending += affiliate.commissions.pending;
    });
    
    return {
      totalAffiliates: approvedAffiliates.length,
      pendingApplications: pendingApplications.length,
      totalClicks: totalClicks,
      totalSignups: totalSignups,
      totalPurchases: totalPurchases,
      totalRevenue: totalRevenue,
      totalEarned: totalEarned,
      totalPaid: totalPaid,
      totalPending: totalPending,
      conversionRate: totalClicks > 0 ? ((totalSignups / totalClicks) * 100).toFixed(2) : 0,
      avgCommissionRate: totalRevenue > 0 ? ((totalEarned / totalRevenue) * 100).toFixed(2) : 0
    };
  },
  
  // Setup affiliate tracking
  setupAffiliateTracking() {
    // Check for affiliate code in URL
    const urlParams = new URLSearchParams(window.location.search);
    const affiliateCode = urlParams.get('aff');
    
    if (affiliateCode) {
      this.trackAffiliateClick(affiliateCode);
    }
  }
};

// Initialize affiliate program on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  AffiliateProgram.init();
});

// Export for global access
window.AffiliateProgram = AffiliateProgram;
