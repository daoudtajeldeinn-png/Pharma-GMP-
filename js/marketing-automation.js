// Marketing Automation System for PharmaPro Academy
const MarketingAutomation = {
  campaigns: [],
  emailTemplates: {},
  workflows: [],
  
  init() {
    this.loadCampaigns();
    this.loadWorkflows();
    this.setupEmailTemplates();
    this.setupDefaultWorkflows();
  },
  
  loadCampaigns() {
    const saved = localStorage.getItem('marketing_campaigns');
    if (saved) {
      this.campaigns = JSON.parse(saved);
    }
  },
  
  saveCampaigns() {
    localStorage.setItem('marketing_campaigns', JSON.stringify(this.campaigns));
  },
  
  loadWorkflows() {
    const saved = localStorage.getItem('marketing_workflows');
    if (saved) {
      this.workflows = JSON.parse(saved);
    }
  },
  
  saveWorkflows() {
    localStorage.setItem('marketing_workflows', JSON.stringify(this.workflows));
  },
  
  setupEmailTemplates() {
    this.emailTemplates = {
      welcome: {
        subject: 'مرحباً بك في PharmaPro Academy',
        body: `
          <h1>مرحباً {name}!</h1>
          <p>شكراً لتسجيلك في PharmaPro Academy.</p>
          <p>نحن متحمسون لمساعدتك في رحلتك التعليمية في مجال GMP والتحكم في الجودة.</p>
          <p>ابدأ باستكشاف كورساتنا المتاحة:</p>
          <a href="{courses_url}">تصفح الكورسات</a>
        `
      },
      course_recommendation: {
        subject: 'كورس موصى به لك: {course_name}',
        body: `
          <h1>مرحباً {name}!</h1>
          <p>بناءً على اهتماماتك، نوصي بالكورس التالي:</p>
          <h2>{course_name}</h2>
          <p>{course_description}</p>
          <a href="{course_url}">ابدأ الكورس الآن</a>
        `
      },
      progress_reminder: {
        subject: 'تذكير: أكمل كورس {course_name}',
        body: `
          <h1>مرحباً {name}!</h1>
          <p>لقد أكملت {progress}% من كورس {course_name}.</p>
          <p>أكمل الكورس للحصول على شهادتك!</p>
          <a href="{course_url}">تابع التعلم</a>
        `
      },
      certificate_earned: {
        subject: '🎉 مبروك! حصلت على شهادة',
        body: `
          <h1>تهانينا {name}!</h1>
          <p>لقد أكملت بنجاح كورس {course_name} وحصلت على شهادة.</p>
          <a href="{certificate_url}">عرض الشهادة</a>
          <p>شارك إنجازك مع أصدقائك!</p>
        `
      },
      special_offer: {
        subject: 'عرض خاص: {discount}% خصم',
        body: `
          <h1>عرض خاص لك!</h1>
          <p>احصل على {discount}% خصم على جميع الكورسات.</p>
          <p>استخدم الكود: {promo_code}</p>
          <a href="{offer_url}">استفد من العرض الآن</a>
          <p>ينتهي العرض في: {expiry_date}</p>
        `
      },
      re_engagement: {
        subject: 'نفتقدك! عد للتعلم معنا',
        body: `
          <h1>مرحباً {name}!</h1>
          <p>لم نرك منذ {days_inactive} أيام.</p>
          <p>هناك كورسات جديدة تنتظرك!</p>
          <a href="{courses_url}">استكشف الجديد</a>
        `
      }
    };
  },
  
  setupDefaultWorkflows() {
    // Welcome workflow
    this.workflows.push({
      id: 'workflow_welcome',
      name: 'رحلة الترحيب',
      trigger: 'user_signup',
      steps: [
        {
          type: 'email',
          template: 'welcome',
          delay: 0
        },
        {
          type: 'email',
          template: 'course_recommendation',
          delay: 86400000 // 24 hours
        },
        {
          type: 'email',
          template: 'special_offer',
          delay: 172800000 // 48 hours
        }
      ],
      active: true
    });
    
    // Progress reminder workflow
    this.workflows.push({
      id: 'workflow_progress',
      name: 'تذكير التقدم',
      trigger: 'course_progress',
      steps: [
        {
          type: 'email',
          template: 'progress_reminder',
          delay: 0
        }
      ],
      active: true
    });
    
    // Certificate workflow
    this.workflows.push({
      id: 'workflow_certificate',
      name: 'الشهادة',
      trigger: 'course_completed',
      steps: [
        {
          type: 'email',
          template: 'certificate_earned',
          delay: 0
        },
        {
          type: 'social_share',
          delay: 3600000 // 1 hour
        }
      ],
      active: true
    });
    
    // Re-engagement workflow
    this.workflows.push({
      id: 'workflow_reengage',
      name: 'إعادة التفاعل',
      trigger: 'user_inactive',
      steps: [
        {
          type: 'email',
          template: 're_engagement',
          delay: 0
        }
      ],
      active: true
    });
    
    this.saveWorkflows();
  },
  
  // Create campaign
  createCampaign(name, type, config) {
    const campaign = {
      id: this.generateCampaignId(),
      name: name,
      type: type,
      config: config,
      status: 'draft',
      createdAt: new Date(),
      stats: {
        sent: 0,
        opened: 0,
        clicked: 0,
        converted: 0
      }
    };
    
    this.campaigns.push(campaign);
    this.saveCampaigns();
    
    return campaign;
  },
  
  generateCampaignId() {
    return 'campaign_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  },
  
  // Launch campaign
  launchCampaign(campaignId) {
    const campaign = this.campaigns.find(c => c.id === campaignId);
    
    if (!campaign) {
      return { success: false, reason: 'Campaign not found' };
    }
    
    campaign.status = 'active';
    campaign.launchedAt = new Date();
    this.saveCampaigns();
    
    // Execute campaign based on type
    this.executeCampaign(campaign);
    
    return { success: true, campaign: campaign };
  },
  
  executeCampaign(campaign) {
    switch (campaign.type) {
      case 'email':
        this.executeEmailCampaign(campaign);
        break;
      case 'social':
        this.executeSocialCampaign(campaign);
        break;
      case 'push':
        this.executePushCampaign(campaign);
        break;
      default:
        console.log('Unknown campaign type:', campaign.type);
    }
  },
  
  executeEmailCampaign(campaign) {
    const recipients = campaign.config.recipients || [];
    const template = campaign.config.template;
    
    recipients.forEach(recipient => {
      // Simulate email sending
      campaign.stats.sent++;
      
      // Track open (simulated)
      setTimeout(() => {
        if (Math.random() > 0.3) {
          campaign.stats.opened++;
        }
      }, Math.random() * 10000);
      
      // Track click (simulated)
      setTimeout(() => {
        if (Math.random() > 0.5) {
          campaign.stats.clicked++;
        }
      }, Math.random() * 20000);
    });
    
    this.saveCampaigns();
  },
  
  executeSocialCampaign(campaign) {
    // Placeholder for social campaign execution
    console.log('Executing social campaign:', campaign.name);
  },
  
  executePushCampaign(campaign) {
    // Placeholder for push campaign execution
    console.log('Executing push campaign:', campaign.name);
  },
  
  // Trigger workflow
  triggerWorkflow(workflowId, userData) {
    const workflow = this.workflows.find(w => w.id === workflowId);
    
    if (!workflow || !workflow.active) {
      return { success: false, reason: 'Workflow not found or inactive' };
    }
    
    workflow.steps.forEach(step => {
      setTimeout(() => {
        this.executeStep(step, userData);
      }, step.delay);
    });
    
    return { success: true };
  },
  
  executeStep(step, userData) {
    switch (step.type) {
      case 'email':
        this.sendEmail(step.template, userData);
        break;
      case 'social_share':
        this.triggerSocialShare(userData);
        break;
      default:
        console.log('Unknown step type:', step.type);
    }
  },
  
  sendEmail(templateName, userData) {
    const template = this.emailTemplates[templateName];
    
    if (!template) {
      console.error('Template not found:', templateName);
      return;
    }
    
    // Replace placeholders
    let body = template.body;
    Object.keys(userData).forEach(key => {
      body = body.replace(new RegExp(`{${key}}`, 'g'), userData[key]);
    });
    
    // Simulate email sending
    console.log('Sending email:', template.subject);
    console.log('To:', userData.email);
    
    // Track in analytics
    if (window.AnalyticsSystem) {
      AnalyticsSystem.trackEvent('email_sent', {
        template: templateName,
        recipient: userData.email
      });
    }
  },
  
  triggerSocialShare(userData) {
    console.log('Triggering social share for:', userData);
  },
  
  // Track user behavior for automation
  trackUserAction(action, userData) {
    switch (action) {
      case 'signup':
        this.triggerWorkflow('workflow_welcome', userData);
        break;
      case 'course_progress':
        this.triggerWorkflow('workflow_progress', userData);
        break;
      case 'course_completed':
        this.triggerWorkflow('workflow_certificate', userData);
        break;
      case 'user_inactive':
        this.triggerWorkflow('workflow_reengage', userData);
        break;
    }
  },
  
  // Get campaign stats
  getCampaignStats(campaignId) {
    const campaign = this.campaigns.find(c => c.id === campaignId);
    
    if (!campaign) {
      return null;
    }
    
    return {
      ...campaign.stats,
      openRate: campaign.stats.sent > 0 ? (campaign.stats.opened / campaign.stats.sent * 100).toFixed(2) : 0,
      clickRate: campaign.stats.opened > 0 ? (campaign.stats.clicked / campaign.stats.opened * 100).toFixed(2) : 0,
      conversionRate: campaign.stats.clicked > 0 ? (campaign.stats.converted / campaign.stats.clicked * 100).toFixed(2) : 0
    };
  },
  
  // Get all campaigns
  getAllCampaigns() {
    return this.campaigns;
  },
  
  // Get active campaigns
  getActiveCampaigns() {
    return this.campaigns.filter(c => c.status === 'active');
  },
  
  // Get all workflows
  getAllWorkflows() {
    return this.workflows;
  },
  
  // Get active workflows
  getActiveWorkflows() {
    return this.workflows.filter(w => w.active);
  },
  
  // Create custom workflow
  createWorkflow(name, trigger, steps) {
    const workflow = {
      id: this.generateWorkflowId(),
      name: name,
      trigger: trigger,
      steps: steps,
      active: true,
      createdAt: new Date()
    };
    
    this.workflows.push(workflow);
    this.saveWorkflows();
    
    return workflow;
  },
  
  generateWorkflowId() {
    return 'workflow_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  },
  
  // Enable/disable workflow
  setWorkflowActive(workflowId, active) {
    const workflow = this.workflows.find(w => w.id === workflowId);
    
    if (workflow) {
      workflow.active = active;
      this.saveWorkflows();
      return true;
    }
    
    return false;
  },
  
  // Add custom email template
  addEmailTemplate(name, template) {
    this.emailTemplates[name] = template;
  },
  
  // Get marketing overview
  getMarketingOverview() {
    const activeCampaigns = this.getActiveCampaigns();
    const activeWorkflows = this.getActiveWorkflows();
    
    let totalSent = 0;
    let totalOpened = 0;
    let totalClicked = 0;
    
    activeCampaigns.forEach(campaign => {
      totalSent += campaign.stats.sent;
      totalOpened += campaign.stats.opened;
      totalClicked += campaign.stats.clicked;
    });
    
    return {
      activeCampaigns: activeCampaigns.length,
      activeWorkflows: activeWorkflows.length,
      totalSent: totalSent,
      totalOpened: totalOpened,
      totalClicked: totalClicked,
      overallOpenRate: totalSent > 0 ? (totalOpened / totalSent * 100).toFixed(2) : 0,
      overallClickRate: totalOpened > 0 ? (totalClicked / totalOpened * 100).toFixed(2) : 0
    };
  }
};

// Initialize marketing automation on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  MarketingAutomation.init();
});

// Export for global access
window.MarketingAutomation = MarketingAutomation;
