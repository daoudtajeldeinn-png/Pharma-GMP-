// Cloud Storage System for PharmaPro Academy
const CloudStorage = {
  providers: {
    firebase: {
      enabled: true,
      name: 'Firebase Storage',
      config: {
        apiKey: '',
        authDomain: '',
        projectId: '',
        storageBucket: '',
        messagingSenderId: ''
      }
    },
    cloudinary: {
      enabled: true,
      name: 'Cloudinary',
      config: {
        cloudName: '',
        uploadPreset: ''
      }
    }
  },
  
  currentProvider: 'firebase',
  
  init() {
    this.loadConfig();
    this.setupEventListeners();
  },
  
  loadConfig() {
    const config = localStorage.getItem('cloud_storage_config');
    if (config) {
      const parsedConfig = JSON.parse(config);
      this.providers = { ...this.providers, ...parsedConfig };
    }
  },
  
  saveConfig() {
    localStorage.setItem('cloud_storage_config', JSON.stringify(this.providers));
  },
  
  setupEventListeners() {
    // Handle online/offline status
    window.addEventListener('online', () => {
      this.syncPendingUploads();
    });
    
    window.addEventListener('offline', () => {
      console.log('Offline - uploads will be queued');
    });
  },
  
  // Upload file
  async uploadFile(file, options = {}) {
    const { folder = 'uploads', onProgress, metadata = {} } = options;
    
    if (!navigator.onLine) {
      return this.queueUpload(file, folder, metadata);
    }
    
    try {
      const provider = this.providers[this.currentProvider];
      
      if (!provider.enabled) {
        throw new Error('Provider not enabled');
      }
      
      let result;
      
      switch (this.currentProvider) {
        case 'firebase':
          result = await this.uploadToFirebase(file, folder, onProgress, metadata);
          break;
        case 'cloudinary':
          result = await this.uploadToCloudinary(file, folder, onProgress, metadata);
          break;
        default:
          throw new Error('Unknown provider');
      }
      
      return result;
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    }
  },
  
  // Upload to Firebase Storage
  async uploadToFirebase(file, folder, onProgress, metadata) {
    // Placeholder for Firebase upload
    // In production, this would use Firebase SDK
    
    const fileName = `${folder}/${Date.now()}_${file.name}`;
    const fileSize = file.size;
    
    // Simulate upload progress
    if (onProgress) {
      let progress = 0;
      const interval = setInterval(() => {
        progress += 10;
        onProgress(progress);
        if (progress >= 100) {
          clearInterval(interval);
        }
      }, 100);
    }
    
    // Simulate upload delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      url: `https://storage.googleapis.com/pharmpro.appspot.com/${fileName}`,
      name: fileName,
      size: fileSize,
      type: file.type,
      metadata: metadata,
      uploadedAt: new Date()
    };
  },
  
  // Upload to Cloudinary
  async uploadToCloudinary(file, folder, onProgress, metadata) {
    // Placeholder for Cloudinary upload
    // In production, this would use Cloudinary SDK
    
    const fileName = `${folder}/${Date.now()}_${file.name}`;
    
    // Simulate upload progress
    if (onProgress) {
      let progress = 0;
      const interval = setInterval(() => {
        progress += 10;
        onProgress(progress);
        if (progress >= 100) {
          clearInterval(interval);
        }
      }, 100);
    }
    
    // Simulate upload delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      url: `https://res.cloudinary.com/pharmpro/video/upload/${fileName}`,
      name: fileName,
      size: file.size,
      type: file.type,
      metadata: metadata,
      uploadedAt: new Date()
    };
  },
  
  // Queue upload for offline
  queueUpload(file, folder, metadata) {
    const queuedUploads = JSON.parse(localStorage.getItem('queued_uploads') || '[]');
    
    const upload = {
      id: Date.now(),
      file: {
        name: file.name,
        size: file.size,
        type: file.type
      },
      folder: folder,
      metadata: metadata,
      queuedAt: new Date(),
      status: 'pending'
    };
    
    queuedUploads.push(upload);
    localStorage.setItem('queued_uploads', JSON.stringify(queuedUploads));
    
    return upload;
  },
  
  // Sync pending uploads
  async syncPendingUploads() {
    const queuedUploads = JSON.parse(localStorage.getItem('queued_uploads') || '[]');
    
    if (queuedUploads.length === 0) return;
    
    for (const upload of queuedUploads) {
      if (upload.status === 'pending') {
        try {
          // In production, you would need to re-create the File object
          // For now, just mark as synced
          upload.status = 'synced';
          upload.syncedAt = new Date();
        } catch (error) {
          upload.status = 'failed';
          upload.error = error.message;
        }
      }
    }
    
    localStorage.setItem('queued_uploads', JSON.stringify(queuedUploads));
  },
  
  // Delete file
  async deleteFile(fileUrl) {
    try {
      const provider = this.providers[this.currentProvider];
      
      if (!provider.enabled) {
        throw new Error('Provider not enabled');
      }
      
      // Placeholder for delete operation
      console.log('Deleting file:', fileUrl);
      
      return { success: true };
    } catch (error) {
      console.error('Delete error:', error);
      throw error;
    }
  },
  
  // Get file info
  async getFileInfo(fileUrl) {
    try {
      // Placeholder for get file info
      return {
        url: fileUrl,
        size: 0,
        type: 'unknown',
        createdAt: new Date()
      };
    } catch (error) {
      console.error('Get file info error:', error);
      throw error;
    }
  },
  
  // List files in folder
  async listFiles(folder) {
    try {
      // Placeholder for list files
      return [];
    } catch (error) {
      console.error('List files error:', error);
      throw error;
    }
  },
  
  // Get storage usage
  async getStorageUsage() {
    try {
      // Placeholder for storage usage
      return {
        used: 0,
        limit: 5 * 1024 * 1024 * 1024, // 5GB
        percentage: 0
      };
    } catch (error) {
      console.error('Get storage usage error:', error);
      throw error;
    }
  },
  
  // Switch provider
  switchProvider(providerName) {
    if (this.providers[providerName]) {
      this.currentProvider = providerName;
      localStorage.setItem('current_provider', providerName);
      return true;
    }
    return false;
  },
  
  // Configure provider
  configureProvider(providerName, config) {
    if (this.providers[providerName]) {
      this.providers[providerName].config = {
        ...this.providers[providerName].config,
        ...config
      };
      this.saveConfig();
      return true;
    }
    return false;
  },
  
  // Enable/disable provider
  setProviderEnabled(providerName, enabled) {
    if (this.providers[providerName]) {
      this.providers[providerName].enabled = enabled;
      this.saveConfig();
      return true;
    }
    return false;
  },
  
  // Get provider status
  getProviderStatus() {
    const status = {};
    
    Object.keys(this.providers).forEach(providerName => {
      const provider = this.providers[providerName];
      status[providerName] = {
        name: provider.name,
        enabled: provider.enabled,
        configured: Object.keys(provider.config).length > 0
      };
    });
    
    return status;
  },
  
  // Video-specific operations
  async uploadVideo(file, options = {}) {
    const { thumbnail, onProgress } = options;
    
    // Validate video file
    if (!file.type.startsWith('video/')) {
      throw new Error('File must be a video');
    }
    
    // Upload video
    const videoResult = await this.uploadFile(file, {
      folder: 'videos',
      onProgress: onProgress,
      metadata: {
        type: 'video',
        duration: options.duration
      }
    });
    
    // Upload thumbnail if provided
    let thumbnailUrl = null;
    if (thumbnail) {
      const thumbnailResult = await this.uploadFile(thumbnail, {
        folder: 'thumbnails',
        metadata: {
          type: 'thumbnail',
          videoId: videoResult.name
        }
      });
      thumbnailUrl = thumbnailResult.url;
    }
    
    return {
      ...videoResult,
      thumbnailUrl: thumbnailUrl
    };
  },
  
  // Resource-specific operations
  async uploadResource(file, category, options = {}) {
    const { onProgress } = options;
    
    return this.uploadFile(file, {
      folder: `resources/${category}`,
      onProgress: onProgress,
      metadata: {
        type: 'resource',
        category: category
      }
    });
  },
  
  // Get upload queue
  getUploadQueue() {
    return JSON.parse(localStorage.getItem('queued_uploads') || '[]');
  },
  
  // Clear upload queue
  clearUploadQueue() {
    localStorage.removeItem('queued_uploads');
  },
  
  // Get storage statistics
  getStorageStats() {
    const queuedUploads = this.getUploadQueue();
    const providerStatus = this.getProviderStatus();
    
    return {
      currentProvider: this.currentProvider,
      providers: providerStatus,
      queuedUploads: queuedUploads.length,
      pendingUploads: queuedUploads.filter(u => u.status === 'pending').length,
      failedUploads: queuedUploads.filter(u => u.status === 'failed').length
    };
  }
};

// Initialize cloud storage on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  CloudStorage.init();
});

// Export for global access
window.CloudStorage = CloudStorage;
