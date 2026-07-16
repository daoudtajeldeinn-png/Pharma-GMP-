// Task Automation System for PharmaPro Academy
const AutomationSystem = {
  tasks: [],
  intervals: [],
  
  init() {
    this.loadTasks();
    this.startAutomation();
    this.setupReminderSystem();
  },
  
  loadTasks() {
    const saved = localStorage.getItem('automation_tasks');
    if (saved) {
      this.tasks = JSON.parse(saved);
    }
  },
  
  saveTasks() {
    localStorage.setItem('automation_tasks', JSON.stringify(this.tasks));
  },
  
  addTask(task) {
    const newTask = {
      id: this.generateTaskId(),
      name: task.name,
      type: task.type,
      schedule: task.schedule,
      action: task.action,
      enabled: true,
      lastRun: null,
      nextRun: this.calculateNextRun(task.schedule),
      createdAt: new Date()
    };
    
    this.tasks.push(newTask);
    this.saveTasks();
    this.updateAutomationSchedule();
    
    return newTask;
  },
  
  generateTaskId() {
    return 'task_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  },
  
  calculateNextRun(schedule) {
    const now = new Date();
    const nextRun = new Date(now);
    
    switch (schedule.type) {
      case 'daily':
        nextRun.setHours(schedule.hour, schedule.minute, 0, 0);
        if (nextRun <= now) {
          nextRun.setDate(nextRun.getDate() + 1);
        }
        break;
      case 'weekly':
        const daysUntil = (schedule.day - now.getDay() + 7) % 7;
        nextRun.setDate(now.getDate() + (daysUntil === 0 ? 7 : daysUntil));
        nextRun.setHours(schedule.hour, schedule.minute, 0, 0);
        break;
      case 'monthly':
        nextRun.setDate(schedule.day);
        nextRun.setHours(schedule.hour, schedule.minute, 0, 0);
        if (nextRun <= now) {
          nextRun.setMonth(nextRun.getMonth() + 1);
        }
        break;
      case 'interval':
        nextRun.setTime(now.getTime() + schedule.interval);
        break;
    }
    
    return nextRun;
  },
  
  startAutomation() {
    // Check for tasks to run every minute
    this.intervals.push(setInterval(() => {
      this.checkAndRunTasks();
    }, 60000));
  },
  
  checkAndRunTasks() {
    const now = new Date();
    
    this.tasks.forEach(task => {
      if (!task.enabled) return;
      
      if (task.nextRun && new Date(task.nextRun) <= now) {
        this.runTask(task);
      }
    });
  },
  
  runTask(task) {
    try {
      console.log('Running task:', task.name);
      
      switch (task.action.type) {
        case 'send_reminder':
          this.sendReminder(task.action);
          break;
        case 'cleanup_data':
          this.cleanupData(task.action);
          break;
        case 'generate_report':
          this.generateReport(task.action);
          break;
        case 'backup_data':
          this.backupData(task.action);
          break;
        case 'send_notification':
          this.sendNotification(task.action);
          break;
        default:
          console.log('Unknown action type:', task.action.type);
      }
      
      // Update task
      task.lastRun = new Date();
      task.nextRun = this.calculateNextRun(task.schedule);
      this.saveTasks();
      
    } catch (error) {
      console.error('Error running task:', error);
    }
  },
  
  sendReminder(action) {
    const reminder = {
      id: Date.now(),
      type: 'reminder',
      title: action.title,
      message: action.message,
      read: false,
      createdAt: new Date()
    };
    
    // Save to notification system
    const notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
    notifications.push(reminder);
    localStorage.setItem('notifications', JSON.stringify(notifications));
    
    // Show browser notification if permitted
    if (Notification.permission === 'granted') {
      new Notification(action.title, {
        body: action.message,
        icon: '/assets/icon-192x192.png'
      });
    }
  },
  
  cleanupData(action) {
    const daysToKeep = action.daysToKeep || 30;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
    
    // Clean up analytics events
    const analyticsEvents = JSON.parse(localStorage.getItem('analytics_events') || '[]');
    const filteredEvents = analyticsEvents.filter(e => {
      return new Date(e.timestamp) >= cutoffDate;
    });
    localStorage.setItem('analytics_events', JSON.stringify(filteredEvents));
    
    // Clean up notifications
    const notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
    const filteredNotifications = notifications.filter(n => {
      return new Date(n.createdAt) >= cutoffDate;
    });
    localStorage.setItem('notifications', JSON.stringify(filteredNotifications));
    
    console.log('Data cleanup completed');
  },
  
  generateReport(action) {
    const reportType = action.reportType;
    let reportData = {};
    
    switch (reportType) {
      case 'daily_activity':
        reportData = this.generateDailyActivityReport();
        break;
      case 'user_engagement':
        reportData = this.generateUserEngagementReport();
        break;
      case 'course_completion':
        reportData = this.generateCourseCompletionReport();
        break;
      default:
        reportData = { error: 'Unknown report type' };
    }
    
    // Save report
    const reports = JSON.parse(localStorage.getItem('reports') || '[]');
    reports.push({
      id: Date.now(),
      type: reportType,
      data: reportData,
      generatedAt: new Date()
    });
    localStorage.setItem('reports', JSON.stringify(reports));
    
    console.log('Report generated:', reportType);
  },
  
  generateDailyActivityReport() {
    const events = JSON.parse(localStorage.getItem('analytics_events') || '[]');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayEvents = events.filter(e => new Date(e.timestamp) >= today);
    
    return {
      date: today.toISOString().split('T')[0],
      totalEvents: todayEvents.length,
      pageViews: todayEvents.filter(e => e.eventName === 'page_view').length,
      courseAccess: todayEvents.filter(e => e.eventName === 'course_access').length,
      quizAttempts: todayEvents.filter(e => e.eventName === 'quiz_attempt').length
    };
  },
  
  generateUserEngagementReport() {
    const events = JSON.parse(localStorage.getItem('analytics_events') || '[]');
    const sessions = new Set(events.map(e => e.sessionId));
    
    return {
      totalSessions: sessions.size,
      totalEvents: events.length,
      avgEventsPerSession: events.length / sessions.size,
      topPages: this.getTopPages(events)
    };
  },
  
  generateCourseCompletionReport() {
    const quizAttempts = JSON.parse(localStorage.getItem('quiz_attempts') || '[]');
    
    return {
      totalAttempts: quizAttempts.length,
      averageScore: quizAttempts.reduce((sum, a) => sum + a.score, 0) / quizAttempts.length,
      passRate: quizAttempts.filter(a => a.passed).length / quizAttempts.length * 100
    };
  },
  
  getTopPages(events, limit = 5) {
    const pageViews = {};
    
    events.forEach(event => {
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
  
  backupData(action) {
    const backup = {
      timestamp: new Date(),
      data: {
        notifications: localStorage.getItem('notifications'),
        analytics_events: localStorage.getItem('analytics_events'),
        forum_topics: localStorage.getItem('forumTopics'),
        course_ratings: localStorage.getItem('courseRatings'),
        user_progress: localStorage.getItem('userProgress')
      }
    };
    
    const backups = JSON.parse(localStorage.getItem('backups') || '[]');
    backups.push(backup);
    
    // Keep only last 10 backups
    if (backups.length > 10) {
      backups.shift();
    }
    
    localStorage.setItem('backups', JSON.stringify(backups));
    console.log('Backup completed');
  },
  
  sendNotification(action) {
    if (Notification.permission === 'granted') {
      new Notification(action.title, {
        body: action.message,
        icon: '/assets/icon-192x192.png',
        tag: action.tag
      });
    } else if (Notification.permission !== 'denied') {
      Notification.requestPermission();
    }
  },
  
  setupReminderSystem() {
    // Request notification permission
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }
    
    // Add default reminder tasks
    this.addDefaultReminders();
  },
  
  addDefaultReminders() {
    // Daily study reminder
    this.addTask({
      name: 'تذكير الدراسة اليومي',
      type: 'reminder',
      schedule: {
        type: 'daily',
        hour: 9,
        minute: 0
      },
      action: {
        type: 'send_reminder',
        title: 'تذكير الدراسة',
        message: 'لا تنسى متابعة دراستك اليومية في PharmaPro Academy!'
      }
    });
    
    // Weekly progress reminder
    this.addTask({
      name: 'تذكير التقدم الأسبوعي',
      type: 'reminder',
      schedule: {
        type: 'weekly',
        day: 0, // Sunday
        hour: 10,
        minute: 0
      },
      action: {
        type: 'send_reminder',
        title: 'تقرير التقدم الأسبوعي',
        message: 'راجع تقدمك الأسبوعي في الكورسات والاختبارات'
      }
    });
    
    // Daily data cleanup
    this.addTask({
      name: 'تنظيف البيانات اليومي',
      type: 'maintenance',
      schedule: {
        type: 'daily',
        hour: 2,
        minute: 0
      },
      action: {
        type: 'cleanup_data',
        daysToKeep: 30
      }
    });
    
    // Weekly report generation
    this.addTask({
      name: 'تقرير النشاط الأسبوعي',
      type: 'report',
      schedule: {
        type: 'weekly',
        day: 0, // Sunday
        hour: 3,
        minute: 0
      },
      action: {
        type: 'generate_report',
        reportType: 'daily_activity'
      }
    });
  },
  
  updateAutomationSchedule() {
    // Re-calculate next run times for all tasks
    this.tasks.forEach(task => {
      task.nextRun = this.calculateNextRun(task.schedule);
    });
    this.saveTasks();
  },
  
  getTasks() {
    return this.tasks;
  },
  
  enableTask(taskId) {
    const task = this.tasks.find(t => t.id === taskId);
    if (task) {
      task.enabled = true;
      task.nextRun = this.calculateNextRun(task.schedule);
      this.saveTasks();
    }
  },
  
  disableTask(taskId) {
    const task = this.tasks.find(t => t.id === taskId);
    if (task) {
      task.enabled = false;
      this.saveTasks();
    }
  },
  
  deleteTask(taskId) {
    this.tasks = this.tasks.filter(t => t.id !== taskId);
    this.saveTasks();
  },
  
  stopAutomation() {
    this.intervals.forEach(interval => clearInterval(interval));
    this.intervals = [];
  }
};

// Initialize automation on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  AutomationSystem.init();
});

// Export for global access
window.AutomationSystem = AutomationSystem;
