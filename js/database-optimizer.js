// Database Performance Optimizer for PharmaPro Academy
const DatabaseOptimizer = {
  cache: new Map(),
  cacheSize: 100,
  index: {},
  compressionEnabled: true,
  
  init() {
    this.loadIndex();
    this.setupCacheCleanup();
    this.optimizeStorage();
  },
  
  // Enhanced get with caching
  get(key) {
    // Check cache first
    if (this.cache.has(key)) {
      return this.cache.get(key);
    }
    
    // Get from storage
    const data = localStorage.getItem(key);
    if (!data) return null;
    
    // Decompress if needed
    let parsedData;
    try {
      if (this.compressionEnabled && this.isCompressed(data)) {
        parsedData = this.decompress(data);
      } else {
        parsedData = JSON.parse(data);
      }
    } catch (e) {
      console.error('Error parsing data:', e);
      return null;
    }
    
    // Cache the result
    this.cache.set(key, parsedData);
    
    return parsedData;
  },
  
  // Enhanced set with indexing
  set(key, value) {
    // Update cache
    this.cache.set(key, value);
    
    // Manage cache size
    if (this.cache.size > this.cacheSize) {
      this.evictFromCache();
    }
    
    // Compress if needed
    let dataToStore;
    if (this.compressionEnabled && this.shouldCompress(value)) {
      dataToStore = this.compress(JSON.stringify(value));
    } else {
      dataToStore = JSON.stringify(value);
    }
    
    // Store in localStorage
    try {
      localStorage.setItem(key, dataToStore);
      
      // Update index
      this.updateIndex(key, value);
      
      return true;
    } catch (e) {
      console.error('Error storing data:', e);
      
      // Try with compression if not already enabled
      if (!this.compressionEnabled) {
        this.compressionEnabled = true;
        return this.set(key, value);
      }
      
      return false;
    }
  },
  
  // Remove from storage and cache
  remove(key) {
    this.cache.delete(key);
    localStorage.removeItem(key);
    this.removeFromIndex(key);
  },
  
  // Batch operations
  batchSet(items) {
    const results = {};
    Object.keys(items).forEach(key => {
      results[key] = this.set(key, items[key]);
    });
    return results;
  },
  
  batchGet(keys) {
    const results = {};
    keys.forEach(key => {
      results[key] = this.get(key);
    });
    return results;
  },
  
  // Compression (simple RLE for demonstration)
  compress(data) {
    if (!data || typeof data !== 'string') return data;
    
    // Simple compression: replace repeated patterns
    let compressed = data;
    const patterns = [
      { pattern: /"true"/g, replacement: '"1"' },
      { pattern: /"false"/g, replacement: '"0"' },
      { pattern: /"null"/g, replacement: '"N"' },
      { pattern: /\s+/g, replacement: ' ' }
    ];
    
    patterns.forEach(({ pattern, replacement }) => {
      compressed = compressed.replace(pattern, replacement);
    });
    
    return compressed;
  },
  
  decompress(data) {
    if (!data || typeof data !== 'string') return data;
    
    let decompressed = data;
    const patterns = [
      { pattern: /"1"/g, replacement: '"true"' },
      { pattern: /"0"/g, replacement: '"false"' },
      { pattern: /"N"/g, replacement: '"null"' }
    ];
    
    patterns.forEach(({ pattern, replacement }) => {
      decompressed = decompressed.replace(pattern, replacement);
    });
    
    return JSON.parse(decompressed);
  },
  
  isCompressed(data) {
    return data.includes('"1"') || data.includes('"0"') || data.includes('"N"');
  },
  
  shouldCompress(value) {
    const jsonString = JSON.stringify(value);
    return jsonString.length > 1000; // Compress if larger than 1KB
  },
  
  // Indexing for faster queries
  updateIndex(key, value) {
    if (Array.isArray(value)) {
      value.forEach((item, index) => {
        if (item.id) {
          this.index[`${key}_${item.id}`] = { key, index };
        }
      });
    } else if (value && value.id) {
      this.index[`${key}_${value.id}`] = { key };
    }
  },
  
  removeFromIndex(key) {
    Object.keys(this.index).forEach(indexKey => {
      if (indexKey.startsWith(key + '_')) {
        delete this.index[indexKey];
      }
    });
  },
  
  // Query by ID using index
  getById(collection, id) {
    const indexKey = `${collection}_${id}`;
    const indexEntry = this.index[indexKey];
    
    if (!indexEntry) {
      return null;
    }
    
    const collectionData = this.get(collection);
    if (Array.isArray(collectionData) && indexEntry.index !== undefined) {
      return collectionData[indexEntry.index];
    }
    
    return collectionData;
  },
  
  // Query with filters
  query(collection, filters = {}) {
    const data = this.get(collection);
    if (!data || !Array.isArray(data)) return [];
    
    return data.filter(item => {
      return Object.keys(filters).every(key => {
        if (typeof filters[key] === 'function') {
          return filters[key](item[key]);
        }
        return item[key] === filters[key];
      });
    });
  },
  
  // Cache management
  evictFromCache() {
    // Simple LRU: remove oldest entry
    const firstKey = this.cache.keys().next().value;
    this.cache.delete(firstKey);
  },
  
  clearCache() {
    this.cache.clear();
  },
  
  // Cache cleanup interval
  setupCacheCleanup() {
    setInterval(() => {
      if (this.cache.size > this.cacheSize * 0.8) {
        // Remove 20% of cache
        const keysToRemove = Array.from(this.cache.keys()).slice(0, Math.floor(this.cacheSize * 0.2));
        keysToRemove.forEach(key => this.cache.delete(key));
      }
    }, 60000); // Every minute
  },
  
  // Storage optimization
  optimizeStorage() {
    // Clean up old data
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      try {
        const data = localStorage.getItem(key);
        if (data) {
          // Check if data is valid JSON
          JSON.parse(data);
        }
      } catch (e) {
        // Remove invalid data
        localStorage.removeItem(key);
      }
    });
    
    // Compact storage if needed
    this.compactStorage();
  },
  
  compactStorage() {
    // Remove expired or old data
    const now = Date.now();
    const keys = Object.keys(localStorage);
    
    keys.forEach(key => {
      if (key.startsWith('temp_')) {
        const timestamp = parseInt(key.split('_')[1]);
        if (now - timestamp > 3600000) { // 1 hour
          localStorage.removeItem(key);
        }
      }
    });
  },
  
  // Storage statistics
  getStorageStats() {
    const keys = Object.keys(localStorage);
    let totalSize = 0;
    let itemCount = 0;
    
    keys.forEach(key => {
      const data = localStorage.getItem(key);
      if (data) {
        totalSize += data.length;
        itemCount++;
      }
    });
    
    return {
      totalKeys: keys.length,
      totalSize: totalSize,
      averageSize: itemCount > 0 ? totalSize / itemCount : 0,
      cacheSize: this.cache.size,
      indexSize: Object.keys(this.index).length,
      compressionEnabled: this.compressionEnabled
    };
  },
  
  // Clear all data (with confirmation)
  clearAll() {
    if (confirm('هل أنت متأكد من حذف جميع البيانات؟')) {
      localStorage.clear();
      this.cache.clear();
      this.index = {};
      return true;
    }
    return false;
  },
  
  // Export data
  exportData() {
    const data = {};
    const keys = Object.keys(localStorage);
    
    keys.forEach(key => {
      data[key] = this.get(key);
    });
    
    return data;
  },
  
  // Import data
  importData(data) {
    Object.keys(data).forEach(key => {
      this.set(key, data[key]);
    });
  },
  
  // Load index from storage
  loadIndex() {
    const savedIndex = localStorage.getItem('db_index');
    if (savedIndex) {
      try {
        this.index = JSON.parse(savedIndex);
      } catch (e) {
        console.error('Error loading index:', e);
        this.index = {};
      }
    }
  },
  
  // Save index to storage
  saveIndex() {
    localStorage.setItem('db_index', JSON.stringify(this.index));
  },
  
  // Performance monitoring
  measurePerformance(operation, callback) {
    const start = performance.now();
    const result = callback();
    const end = performance.now();
    
    console.log(`${operation} took ${end - start}ms`);
    return result;
  }
};

// Initialize database optimizer on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  DatabaseOptimizer.init();
  
  // Save index periodically
  setInterval(() => {
    DatabaseOptimizer.saveIndex();
  }, 30000); // Every 30 seconds
});

// Export for global access
window.DatabaseOptimizer = DatabaseOptimizer;
