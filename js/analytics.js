// Analytics System for PharmaPro Academy
const AnalyticsSystem = {
  events: [],
  sessionStart: null,
  sessionId: null,
  
  init() {
    this.sessionId = this.generateSessionId();
    this.sessionStart = new Date();
    this.loadEvents();
    this.trackEvent('session_start', {
      timestamp: this.sessionStart,
      userAgent: navigator.userAgent,
      screen: {
        width: window.screen.width,
        height: window.screen.height
      },
      language: navigator.language
    });
    
    // Track page view
    this.trackPageView();
    
    // Track page changes
    this.setupPageTracking();
    
    // Track user interactions
    this.setupInteractionTracking();
    
    // Save events periodically
    setInterval(() => this.saveEvents(), 30000); // Every 30 seconds
    
    // Save on page unload
    window.addEventListener('beforeunload', () => this.saveEvents());
  },
  
  generateSessionId() {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  },
  
  loadEvents() {
    const saved = localStorage.getItem('analytics_events');
    if (saved) {
      this.events = JSON.parse(saved);
    }
  },
  
  saveEvents() {
    try {
      localStorage.setItem('analytics_events', JSON.stringify(this.events));
    } catch (e) {
      console.error('Error saving analytics events:', e);
    }
  },
  
  trackEvent(eventName, data = {}) {
    const event = {
      id: this.generateEventId(),
      sessionId: this.sessionId,
      eventName: eventName,
      timestamp: new Date(),
      url: window.location.href,
      data: data
    };
    
    this.events.push(event);
    
    // Keep only last 1000 events to prevent storage issues
    if (this.events.length > 1000) {
      this.events = this.events.slice(-1000);
    }
  },
  
  generateEventId() {
    return 'event_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  },
  
  trackPageView() {
    this.trackEvent('page_view', {
      title: document.title,
      referrer: document.referrer
    });
  },
  
  setupPageTracking() {
    // Track hash changes for single-page navigation
    window.addEventListener('hashchange', () => {
      this.trackPageView();
    });
    
    // Track pushState/popState
    const originalPushState = history.pushState;
    history.pushState = function() {
      originalPushState.apply(this, arguments);
      AnalyticsSystem.trackPageView();
    };
    
    window.addEventListener('popstate', () => {
      this.trackPageView();
    });
  },
  
  setupInteractionTracking() {
    // Track button clicks
    document.addEventListener('click', (e) => {
      if (e.target.tagName === 'BUTTON' || e.target.tagName === 'A') {
        this.trackEvent('click', {
          element: e.target.tagName,
          text: e.target.textContent.substring(0, 50),
          href: e.target.href
        });
      }
    });
    
    // Track form submissions
    document.addEventListener('submit', (e) => {
      this.trackEvent('form_submit', {
        formId: e.target.id || e.target.className
      });
    });
    
    // Track errors
    window.addEventListener('error', (e) => {
      this.trackEvent('error', {
        message: e.message,
        filename: e.filename,
        lineno: e.lineno
      });
    });
  },
  
  trackCourseAccess(courseId, courseName) {
    this.trackEvent('course_access', {
      courseId: courseId,
      courseName: courseName
    });
  },
  
  trackQuizAttempt(quizId, score, total) {
    this.trackEvent('quiz_attempt', {
      quizId: quizId,
      score: score,
      total: total,
      percentage: Math.round((score / total) * 100)
    });
  },
  
  trackForumPost(forumId, postId) {
    this.trackEvent('forum_post', {
      forumId: forumId,
      postId: postId
    });
  },
  
  trackResourceDownload(resourceId, resourceName) {
    this.trackEvent('resource_download', {
      resourceId: resourceId,
      resourceName: resourceName
    });
  },
  
  trackCalculatorUse(calculatorId, inputs, result) {
    this.trackEvent('calculator_use', {
      calculatorId: calculatorId,
      inputs: inputs,
      result: result
    });
  },
  
  getAnalyticsData() {
    return {
      events: this.events,
      sessionCount: this.getSessionCount(),
      totalEvents: this.events.length,
      uniqueUsers: this.getUniqueUsers(),
      pageViews: this.getPageViews(),
      topPages: this.getTopPages()
    };
  },
  
  getSessionCount() {
    const sessions = new Set(this.events.map(e => e.sessionId));
    return sessions.size;
  },
  
  getUniqueUsers() {
    const users = new Set(this.events.map(e => e.sessionId));
    return users.size;
  },
  
  getPageViews() {
    return this.events.filter(e => e.eventName === 'page_view').length;
  },
  
  getTopPages(limit = 10) {
    const pageViews = {};
    
    this.events.forEach(event => {
      if (event.eventName === 'page_view') {
        const url = event.url;
        pageViews[url] = (pageViews[url] || 0) + 1;
      }
    });
    
    return Object.entries(pageViews)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([url, count]) => ({ url, count }));
  },
  
  getEventsByType(eventName) {
    return this.events.filter(e => e.eventName === eventName);
  },
  
  getEventsInDateRange(startDate, endDate) {
    return this.events.filter(e => {
      const eventDate = new Date(e.timestamp);
      return eventDate >= startDate && eventDate <= endDate;
    });
  },
  
  clearOldEvents(daysToKeep = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
    
    this.events = this.events.filter(e => {
      const eventDate = new Date(e.timestamp);
      return eventDate >= cutoffDate;
    });
    
    this.saveEvents();
  },
  
  exportAnalytics() {
    const data = this.getAnalyticsData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics_export_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
};

// Initialize analytics on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  AnalyticsSystem.init();
});

// Export for global access
window.AnalyticsSystem = AnalyticsSystem;
