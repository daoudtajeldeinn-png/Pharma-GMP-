// Referral System for PharmaPro Academy
const ReferralSystem = {
  referrals: [],
  rewards: {
    signup: { points: 100, description: 'مكافأة التسجيل' },
    first_course: { points: 200, description: 'أول كورس' },
    referral_signup: { points: 500, description: 'إحالة تسجيل' },
    referral_purchase: { points: 1000, description: 'إحالة شراء' }
  },
  
  init() {
    this.loadReferrals();
    this.setupReferralTracking();
  },
  
  loadReferrals() {
    const saved = localStorage.getItem('referrals');
    if (saved) {
      this.referrals = JSON.parse(saved);
    }
  },
  
  saveReferrals() {
    localStorage.setItem('referrals', JSON.stringify(this.referrals));
  },
  
  // Generate referral code
  generateReferralCode(userId) {
    const code = 'REF-' + userId.substring(0, 4).toUpperCase() + '-' + Math.random().toString(36).substr(2, 6).toUpperCase();
    
    const referral = {
      id: this.generateReferralId(),
      referrerId: userId,
      code: code,
      createdAt: new Date(),
      status: 'active',
      stats: {
        clicks: 0,
        signups: 0,
        purchases: 0
      },
      rewards: {
        totalPoints: 0,
        redeemedPoints: 0
      }
    };
    
    this.referrals.push(referral);
    this.saveReferrals();
    
    return referral;
  },
  
  generateReferralId() {
    return 'referral_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  },
  
  // Get referral code for user
  getUserReferralCode(userId) {
    let referral = this.referrals.find(r => r.referrerId === userId && r.status === 'active');
    
    if (!referral) {
      referral = this.generateReferralCode(userId);
    }
    
    return referral;
  },
  
  // Track referral click
  trackReferralClick(code) {
    const referral = this.referrals.find(r => r.code === code && r.status === 'active');
    
    if (!referral) {
      return { success: false, reason: 'Invalid referral code' };
    }
    
    referral.stats.clicks++;
    this.saveReferrals();
    
    // Store referral code in session
    sessionStorage.setItem('referral_code', code);
    
    return { success: true, referral: referral };
  },
  
  // Process referral signup
  processReferralSignup(newUserId) {
    const referralCode = sessionStorage.getItem('referral_code');
    
    if (!referralCode) {
      return { success: false, reason: 'No referral code' };
    }
    
    const referral = this.referrals.find(r => r.code === referralCode && r.status === 'active');
    
    if (!referral) {
      return { success: false, reason: 'Invalid referral code' };
    }
    
    // Add reward to referrer
    referral.rewards.totalPoints += this.rewards.referral_signup.points;
    referral.stats.signups++;
    
    // Add signup reward to new user
    this.addUserReward(newUserId, this.rewards.signup.points);
    
    this.saveReferrals();
    
    // Clear referral code from session
    sessionStorage.removeItem('referral_code');
    
    // Track in analytics
    if (window.AnalyticsSystem) {
      AnalyticsSystem.trackEvent('referral_signup', {
        referrerId: referral.referrerId,
        newUserId: newUserId
      });
    }
    
    return { success: true, referral: referral };
  },
  
  // Process referral purchase
  processReferralPurchase(userId, purchaseAmount) {
    const referral = this.referrals.find(r => r.referrerId === userId && r.status === 'active');
    
    if (!referral) {
      return { success: false, reason: 'No active referral' };
    }
    
    // Add purchase reward
    referral.rewards.totalPoints += this.rewards.referral_purchase.points;
    referral.stats.purchases++;
    
    this.saveReferrals();
    
    // Track in analytics
    if (window.AnalyticsSystem) {
      AnalyticsSystem.trackEvent('referral_purchase', {
        referrerId: userId,
        amount: purchaseAmount
      });
    }
    
    return { success: true, referral: referral };
  },
  
  // Add reward to user
  addUserReward(userId, points) {
    const userRewards = JSON.parse(localStorage.getItem('user_rewards') || '{}');
    
    if (!userRewards[userId]) {
      userRewards[userId] = {
        totalPoints: 0,
        redeemedPoints: 0,
        history: []
      };
    }
    
    userRewards[userId].totalPoints += points;
    userRewards[userId].history.push({
      points: points,
      type: 'reward',
      timestamp: new Date()
    });
    
    localStorage.setItem('user_rewards', JSON.stringify(userRewards));
  },
  
  // Redeem points
  redeemPoints(userId, points, rewardType) {
    const userRewards = JSON.parse(localStorage.getItem('user_rewards') || '{}');
    
    if (!userRewards[userId] || userRewards[userId].totalPoints < points) {
      return { success: false, reason: 'Insufficient points' };
    }
    
    userRewards[userId].totalPoints -= points;
    userRewards[userId].redeemedPoints += points;
    userRewards[userId].history.push({
      points: -points,
      type: 'redemption',
      rewardType: rewardType,
      timestamp: new Date()
    });
    
    localStorage.setItem('user_rewards', JSON.stringify(userRewards));
    
    return { success: true };
  },
  
  // Get user rewards
  getUserRewards(userId) {
    const userRewards = JSON.parse(localStorage.getItem('user_rewards') || '{}');
    return userRewards[userId] || { totalPoints: 0, redeemedPoints: 0, history: [] };
  },
  
  // Get referral stats
  getReferralStats(userId) {
    const referral = this.referrals.find(r => r.referrerId === userId && r.status === 'active');
    
    if (!referral) {
      return null;
    }
    
    return {
      code: referral.code,
      stats: referral.stats,
      rewards: referral.rewards,
      availablePoints: referral.rewards.totalPoints - referral.rewards.redeemedPoints
    };
  },
  
  // Generate referral link
  generateReferralLink(code) {
    return `${window.location.origin}?ref=${code}`;
  },
  
  // Share referral link
  shareReferralLink(userId) {
    const referral = this.getUserReferralCode(userId);
    const link = this.generateReferralLink(referral.code);
    
    const content = {
      url: link,
      text: 'انضم إلى PharmaPro Academy واحصل على خصم خاص! 🎓',
      hashtags: 'PharmaPro,GMP,Education',
      type: 'referral'
    };
    
    if (window.SocialIntegration) {
      window.SocialIntegration.showShareModal(content);
    } else {
      // Copy to clipboard
      navigator.clipboard.writeText(link).then(() => {
        alert('تم نسخ رابط الإحالة!');
      });
    }
  },
  
  // Get all referrals
  getAllReferrals() {
    return this.referrals;
  },
  
  // Get referral leaderboard
  getReferralLeaderboard(limit = 10) {
    const leaderboard = [...this.referrals]
      .filter(r => r.status === 'active')
      .sort((a, b) => b.stats.signups - a.stats.signups)
      .slice(0, limit)
      .map((referral, index) => ({
        rank: index + 1,
        referrerId: referral.referrerId,
        code: referral.code,
        signups: referral.stats.signups,
        purchases: referral.stats.purchases,
        totalPoints: referral.rewards.totalPoints
      }));
    
    return leaderboard;
  },
  
  // Get referral rewards catalog
  getRewardsCatalog() {
    return [
      {
        id: 'discount_10',
        name: 'خصم 10%',
        points: 500,
        description: 'خصم 10% على أي كورس'
      },
      {
        id: 'discount_25',
        name: 'خصم 25%',
        points: 1000,
        description: 'خصم 25% على أي كورس'
      },
      {
        id: 'free_course',
        name: 'كورس مجاني',
        points: 2000,
        description: 'احصل على كورس مجاني'
      },
      {
        id: 'premium_access',
        name: 'وصول مميز',
        points: 5000,
        description: 'وصول مميز لمدة شهر'
      }
    ];
  },
  
  // Validate referral code
  validateReferralCode(code) {
    const referral = this.referrals.find(r => r.code === code && r.status === 'active');
    return referral !== undefined;
  },
  
  // Disable referral code
  disableReferralCode(code) {
    const referral = this.referrals.find(r => r.code === code);
    
    if (referral) {
      referral.status = 'disabled';
      this.saveReferrals();
      return true;
    }
    
    return false;
  },
  
  // Get overall referral stats
  getOverallStats() {
    const activeReferrals = this.referrals.filter(r => r.status === 'active');
    
    let totalClicks = 0;
    let totalSignups = 0;
    let totalPurchases = 0;
    let totalPoints = 0;
    
    activeReferrals.forEach(referral => {
      totalClicks += referral.stats.clicks;
      totalSignups += referral.stats.signups;
      totalPurchases += referral.stats.purchases;
      totalPoints += referral.rewards.totalPoints;
    });
    
    return {
      totalReferrals: activeReferrals.length,
      totalClicks: totalClicks,
      totalSignups: totalSignups,
      totalPurchases: totalPurchases,
      totalPoints: totalPoints,
      conversionRate: totalClicks > 0 ? ((totalSignups / totalClicks) * 100).toFixed(2) : 0
    };
  }
};

// Initialize referral system on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  ReferralSystem.init();
  
  // Check for referral code in URL
  const urlParams = new URLSearchParams(window.location.search);
  const referralCode = urlParams.get('ref');
  
  if (referralCode) {
    ReferralSystem.trackReferralClick(referralCode);
  }
});

// Export for global access
window.ReferralSystem = ReferralSystem;
