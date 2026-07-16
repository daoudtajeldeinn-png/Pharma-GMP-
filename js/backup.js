// Backup System for PharmaPro Academy
const BackupSystem = {
  backupKeys: [
    'notifications',
    'analytics_events',
    'forumTopics',
    'courseRatings',
    'userProgress',
    'automation_tasks',
    'reports',
    'backups'
  ],
  
  init() {
    this.loadBackups();
    this.setupAutoBackup();
  },
  
  loadBackups() {
    const saved = localStorage.getItem('backups');
    if (saved) {
      return JSON.parse(saved);
    }
    return [];
  },
  
  saveBackups(backups) {
    localStorage.setItem('backups', JSON.stringify(backups));
  },
  
  createBackup(name = null) {
    const backup = {
      id: this.generateBackupId(),
      name: name || `Backup ${new Date().toLocaleString('ar-EG')}`,
      timestamp: new Date(),
      data: {},
      size: 0
    };
    
    // Collect all data
    this.backupKeys.forEach(key => {
      const data = localStorage.getItem(key);
      if (data) {
        backup.data[key] = data;
        backup.size += data.length;
      }
    });
    
    // Save backup
    const backups = this.loadBackups();
    backups.push(backup);
    
    // Keep only last 20 backups
    if (backups.length > 20) {
      backups.shift();
    }
    
    this.saveBackups(backups);
    
    console.log('Backup created:', backup.name);
    return backup;
  },
  
  generateBackupId() {
    return 'backup_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  },
  
  restoreBackup(backupId) {
    const backups = this.loadBackups();
    const backup = backups.find(b => b.id === backupId);
    
    if (!backup) {
      console.error('Backup not found:', backupId);
      return false;
    }
    
    // Confirm restoration
    if (!confirm(`هل أنت متأكد من استعادة النسخة الاحتياطية "${backup.name}"؟\nسيتم استبدال جميع البيانات الحالية.`)) {
      return false;
    }
    
    try {
      // Restore data
      Object.keys(backup.data).forEach(key => {
        localStorage.setItem(key, backup.data[key]);
      });
      
      console.log('Backup restored:', backup.name);
      return true;
    } catch (error) {
      console.error('Error restoring backup:', error);
      return false;
    }
  },
  
  deleteBackup(backupId) {
    const backups = this.loadBackups();
    const filteredBackups = backups.filter(b => b.id !== backupId);
    this.saveBackups(filteredBackups);
    console.log('Backup deleted:', backupId);
  },
  
  exportBackup(backupId) {
    const backups = this.loadBackups();
    const backup = backups.find(b => b.id === backupId);
    
    if (!backup) {
      console.error('Backup not found:', backupId);
      return false;
    }
    
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `pharmapro_backup_${backup.timestamp.toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    console.log('Backup exported:', backup.name);
    return true;
  },
  
  importBackup(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const backup = JSON.parse(e.target.result);
          
          // Validate backup structure
          if (!backup.id || !backup.data || !backup.timestamp) {
            throw new Error('Invalid backup structure');
          }
          
          // Import backup
          const backups = this.loadBackups();
          backups.push(backup);
          
          // Keep only last 20 backups
          if (backups.length > 20) {
            backups.shift();
          }
          
          this.saveBackups(backups);
          
          console.log('Backup imported:', backup.name);
          resolve(backup);
        } catch (error) {
          console.error('Error importing backup:', error);
          reject(error);
        }
      };
      
      reader.onerror = () => {
        reject(new Error('Error reading file'));
      };
      
      reader.readAsText(file);
    });
  },
  
  getBackups() {
    return this.loadBackups();
  },
  
  getBackupInfo(backupId) {
    const backups = this.loadBackups();
    const backup = backups.find(b => b.id === backupId);
    
    if (!backup) {
      return null;
    }
    
    return {
      id: backup.id,
      name: backup.name,
      timestamp: backup.timestamp,
      size: backup.size,
      dataKeys: Object.keys(backup.data),
      dataSize: Object.keys(backup.data).reduce((sum, key) => {
        return sum + (backup.data[key] ? backup.data[key].length : 0);
      }, 0)
    };
  },
  
  setupAutoBackup() {
    // Auto backup every 24 hours
    setInterval(() => {
      this.createBackup('Auto Backup');
    }, 24 * 60 * 60 * 1000);
    
    // Backup on page unload (if significant changes)
    window.addEventListener('beforeunload', () => {
      const lastBackup = this.loadBackups().pop();
      if (lastBackup) {
        const hoursSinceLastBackup = (new Date() - new Date(lastBackup.timestamp)) / (1000 * 60 * 60);
        if (hoursSinceLastBackup > 1) {
          this.createBackup('Auto Backup');
        }
      }
    });
  },
  
  createQuickBackup() {
    return this.createBackup('Quick Backup');
  },
  
  cleanupOldBackups(daysToKeep = 30) {
    const backups = this.loadBackups();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
    
    const filteredBackups = backups.filter(b => {
      return new Date(b.timestamp) >= cutoffDate;
    });
    
    this.saveBackups(filteredBackups);
    
    const removedCount = backups.length - filteredBackups.length;
    console.log(`Cleaned up ${removedCount} old backups`);
    
    return removedCount;
  },
  
  getBackupStats() {
    const backups = this.loadBackups();
    
    if (backups.length === 0) {
      return {
        totalBackups: 0,
        totalSize: 0,
        lastBackup: null,
        oldestBackup: null
      };
    }
    
    const totalSize = backups.reduce((sum, b) => sum + b.size, 0);
    const sortedBackups = [...backups].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    
    return {
      totalBackups: backups.length,
      totalSize: totalSize,
      lastBackup: sortedBackups[sortedBackups.length - 1],
      oldestBackup: sortedBackups[0],
      averageSize: totalSize / backups.length
    };
  },
  
  syncWithCloud(backupId) {
    // Placeholder for cloud sync functionality
    console.log('Cloud sync not implemented yet');
    return Promise.resolve(false);
  },
  
  verifyBackup(backupId) {
    const backups = this.loadBackups();
    const backup = backups.find(b => b.id === backupId);
    
    if (!backup) {
      return { valid: false, error: 'Backup not found' };
    }
    
    try {
      // Verify data integrity
      Object.keys(backup.data).forEach(key => {
        JSON.parse(backup.data[key]);
      });
      
      return { valid: true };
    } catch (error) {
      return { valid: false, error: 'Data integrity check failed' };
    }
  },
  
  getBackupHistory(limit = 10) {
    const backups = this.loadBackups();
    const sortedBackups = [...backups].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    return sortedBackups.slice(0, limit).map(backup => ({
      id: backup.id,
      name: backup.name,
      timestamp: backup.timestamp,
      size: backup.size,
      dataCount: Object.keys(backup.data).length
    }));
  }
};

// Initialize backup system on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  BackupSystem.init();
});

// Export for global access
window.BackupSystem = BackupSystem;
