// Common JavaScript functions for Phase 2 features

// Modal System
const ModalSystem = {
  init() {
    this.attachEventListeners();
  },
  
  attachEventListeners() {
    document.querySelectorAll('.modal-close').forEach(btn => {
      btn.addEventListener('click', () => this.closeModal());
    });
    
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
          this.closeModal();
        }
      });
    });
  },
  
  openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add('active');
    }
  },
  
  closeModal(modalId) {
    if (modalId) {
      const modal = document.getElementById(modalId);
      if (modal) {
        modal.classList.remove('active');
      }
    } else {
      document.querySelectorAll('.modal-overlay').forEach(modal => {
        modal.classList.remove('active');
      });
    }
  }
};

// Filter System
const FilterSystem = {
  init(filterBtns, filterCallback) {
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        this.setActive(btn);
        filterCallback(btn.dataset.filter);
      });
    });
  },
  
  setActive(activeBtn) {
    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.classList.remove('active');
    });
    activeBtn.classList.add('active');
  }
};

// Search System
const SearchSystem = {
  init(searchInput, searchCallback) {
    searchInput.addEventListener('input', (e) => {
      searchCallback(e.target.value);
    });
  }
};

// LocalStorage Helper
const StorageHelper = {
  save(key, data) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
      return true;
    } catch (e) {
      console.error('Error saving to localStorage:', e);
      return false;
    }
  },
  
  load(key) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      console.error('Error loading from localStorage:', e);
      return null;
    }
  },
  
  remove(key) {
    localStorage.removeItem(key);
  }
};

// Rating System
const RatingSystem = {
  currentRating: 0,
  ratings: [],
  
  init(containerId, storageKey) {
    this.containerId = containerId;
    this.storageKey = storageKey;
    this.loadRatings();
    this.setupStarRating();
    this.updateAverageRating();
  },
  
  loadRatings() {
    const saved = StorageHelper.load(this.storageKey);
    if (saved) {
      this.ratings = saved;
    }
  },
  
  saveRatings() {
    StorageHelper.save(this.storageKey, this.ratings);
  },
  
  setupStarRating() {
    const container = document.getElementById(this.containerId);
    if (!container) return;
    
    const stars = container.querySelectorAll('.star');
    const ratingText = container.querySelector('#ratingText');
    
    stars.forEach(star => {
      star.addEventListener('click', () => {
        const rating = parseInt(star.dataset.rating);
        this.currentRating = rating;
        this.updateStars(rating);
        
        if (ratingText) {
          const texts = ['سيء', 'ضعيف', 'متوسط', 'جيد', 'ممتاز'];
          ratingText.textContent = texts[rating - 1];
        }
      });
      
      star.addEventListener('mouseenter', () => {
        const rating = parseInt(star.dataset.rating);
        this.updateStars(rating);
      });
      
      star.addEventListener('mouseleave', () => {
        this.updateStars(this.currentRating);
      });
    });
  },
  
  updateStars(rating) {
    const container = document.getElementById(this.containerId);
    if (!container) return;
    
    const stars = container.querySelectorAll('.star');
    stars.forEach((star, index) => {
      star.textContent = index < rating ? '★' : '☆';
      star.style.color = index < rating ? 'var(--gold)' : 'var(--muted)';
    });
  },
  
  submitRating(comment) {
    if (this.currentRating === 0) {
      alert('يرجى اختيار تقييم');
      return false;
    }
    
    const newRating = {
      rating: this.currentRating,
      comment: comment,
      date: new Date()
    };
    
    this.ratings.push(newRating);
    this.saveRatings();
    this.updateAverageRating();
    
    // Reset
    this.currentRating = 0;
    this.updateStars(0);
    
    return true;
  },
  
  updateAverageRating() {
    if (this.ratings.length === 0) return;
    
    const sum = this.ratings.reduce((acc, r) => acc + r.rating, 0);
    const average = (sum / this.ratings.length).toFixed(1);
    
    const avgElement = document.getElementById('averageRating');
    if (avgElement) {
      avgElement.textContent = average;
    }
    
    const summaryElement = document.getElementById('ratingSummary');
    if (summaryElement) {
      summaryElement.innerHTML = `
        <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
          <span style="font-size: 2rem; font-weight: 700; color: var(--gold);">${average}</span>
          <span style="color: var(--muted);">/ 5</span>
          <span style="color: var(--muted); font-size: 0.9rem;">(${this.ratings.length} تقييم)</span>
        </div>
      `;
    }
  }
};

// Sharing System
const SharingSystem = {
  currentUrl: '',
  title: '',
  
  init(url, title) {
    this.currentUrl = url || window.location.href;
    this.title = title || document.title;
    this.updateShareLink();
  },
  
  updateShareLink() {
    const linkInput = document.getElementById('shareLink');
    if (linkInput) {
      linkInput.value = this.currentUrl;
    }
  },
  
  shareToFacebook() {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(this.currentUrl)}&quote=${encodeURIComponent(this.title)}`;
    window.open(url, '_blank', 'width=600,height=400');
  },
  
  shareToTwitter() {
    const url = `https://twitter.com/intent/tweet?url=${encodeURIComponent(this.currentUrl)}&text=${encodeURIComponent(this.title)}`;
    window.open(url, '_blank', 'width=600,height=400');
  },
  
  shareToLinkedIn() {
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(this.currentUrl)}`;
    window.open(url, '_blank', 'width=600,height=400');
  },
  
  shareToWhatsApp() {
    const url = `https://wa.me/?text=${encodeURIComponent(this.title + ' - ' + this.currentUrl)}`;
    window.open(url, '_blank');
  },
  
  shareViaEmail() {
    const subject = encodeURIComponent(this.title);
    const body = encodeURIComponent(`أود مشاركة هذا المحتوى معك:\n\n${this.title}\n\nالرابط: ${this.currentUrl}`);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  },
  
  copyLink() {
    const linkInput = document.getElementById('shareLink');
    if (linkInput) {
      linkInput.select();
      document.execCommand('copy');
      
      // Show feedback
      const btn = event.target;
      const originalText = btn.textContent;
      btn.textContent = 'تم النسخ!';
      btn.style.background = '#4CAF50';
      
      setTimeout(() => {
        btn.textContent = originalText;
        btn.style.background = 'var(--teal)';
      }, 2000);
    }
  }
};

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  ModalSystem.init();
});

// Export for global access
window.ModalSystem = ModalSystem;
window.StorageHelper = StorageHelper;
window.RatingSystem = RatingSystem;
window.SharingSystem = SharingSystem;
