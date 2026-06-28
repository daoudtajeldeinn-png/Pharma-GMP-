// ── INTERACTIVE VIDEO COMPONENT ──
class VideoPlayer {
  constructor(containerId, options = {}) {
    this.container = document.getElementById(containerId);
    this.options = {
      lectures: options.lectures || [],
      autoPlay: options.autoPlay || false,
      onLectureChange: options.onLectureChange || null,
      onProgress: options.onProgress || null
    };
    
    this.currentLecture = 0;
    this.isPlaying = false;
    this.currentTime = 0;
    this.duration = 0;
    this.progress = 0;
    
    this.init();
  }
  
  init() {
    this.render();
    this.attachEvents();
  }
  
  render() {
    const videoSource = this.options.lectures[0]?.videoUrl || '';
    
    this.container.innerHTML = `
      <div class="video-player-container">
        <div class="video-player-header">
          <div class="video-player-title">${this.options.lectures[0]?.title || 'Video Player'}</div>
          <div class="video-player-badge">HD</div>
        </div>
        
        <div class="video-player-main">
          ${videoSource ? `
            <video id="mainVideo" style="width: 100%; height: 100%; object-fit: cover;" controls>
              <source src="${videoSource}" type="video/mp4">
              متصفحك لا يدعم تشغيل الفيديو
            </video>
          ` : `
            <div class="video-player-placeholder" id="videoPlaceholder">
              <div class="play-button"></div>
              <div class="video-placeholder-text">انقر للتشغيل</div>
            </div>
          `}
        </div>
        
        <div class="video-player-controls">
          <button class="video-control-btn" id="playPauseBtn">▶</button>
          <button class="video-control-btn" id="prevBtn">⏮</button>
          <button class="video-control-btn" id="nextBtn">⏭</button>
          <div class="video-progress" id="videoProgress">
            <div class="video-progress-bar" id="progressBar"></div>
          </div>
          <div class="video-time">
            <span id="currentTime">0:00</span> / <span id="totalTime">0:00</span>
          </div>
          <button class="video-control-btn" id="fullscreenBtn">⛶</button>
        </div>
        
        <div class="video-player-tabs">
          <div class="video-tab active" data-tab="lectures">المحاضرات</div>
          <div class="video-tab" data-tab="notes">ملاحظات</div>
          <div class="video-tab" data-tab="resources">الموارد</div>
        </div>
        
        <div class="video-tab-content active" id="tab-lectures">
          <div class="lecture-list" id="lectureList"></div>
        </div>
        
        <div class="video-tab-content" id="tab-notes">
          <textarea class="form-textarea" placeholder="أضف ملاحظاتك هنا..." style="width: 100%; min-height: 200px;"></textarea>
        </div>
        
        <div class="video-tab-content" id="tab-resources">
          <div class="lecture-list" id="resourceList"></div>
        </div>
      </div>
    `;
    
    this.renderLectureList();
    this.renderResourceList();
  }
  
  renderLectureList() {
    const lectureList = document.getElementById('lectureList');
    lectureList.innerHTML = this.options.lectures.map((lecture, index) => `
      <div class="lecture-item ${index === this.currentLecture ? 'active' : ''}" data-index="${index}">
        <div class="lecture-number">${index + 1}</div>
        <div class="lecture-info">
          <div class="lecture-title">${lecture.title}</div>
          <div class="lecture-duration">${lecture.duration || '0:00'}</div>
        </div>
        <div class="lecture-status">${index === this.currentLecture ? '▶' : '✓'}</div>
      </div>
    `).join('');
  }
  
  renderResourceList() {
    const resourceList = document.getElementById('resourceList');
    const resources = this.options.lectures[this.currentLecture]?.resources || [];
    
    if (resources.length === 0) {
      resourceList.innerHTML = '<div style="color: var(--muted); padding: 20px;">لا توجد موارد متاحة لهذه المحاضرة</div>';
      return;
    }
    
    resourceList.innerHTML = resources.map(resource => `
      <div class="lecture-item">
        <div class="lecture-number">📄</div>
        <div class="lecture-info">
          <div class="lecture-title">${resource.title}</div>
          <div class="lecture-duration">${resource.type || 'PDF'}</div>
        </div>
        <div class="lecture-status">⬇</div>
      </div>
    `).join('');
  }
  
  attachEvents() {
    // Play/Pause button
    document.getElementById('playPauseBtn').addEventListener('click', () => {
      this.togglePlay();
    });
    
    // Placeholder click
    document.getElementById('videoPlaceholder').addEventListener('click', () => {
      this.togglePlay();
    });
    
    // Previous/Next buttons
    document.getElementById('prevBtn').addEventListener('click', () => {
      this.previousLecture();
    });
    
    document.getElementById('nextBtn').addEventListener('click', () => {
      this.nextLecture();
    });
    
    // Progress bar click
    document.getElementById('videoProgress').addEventListener('click', (e) => {
      const rect = e.target.getBoundingClientRect();
      const percent = (e.clientX - rect.left) / rect.width;
      this.seekTo(percent);
    });
    
    // Lecture item clicks
    document.getElementById('lectureList').addEventListener('click', (e) => {
      const lectureItem = e.target.closest('.lecture-item');
      if (lectureItem) {
        const index = parseInt(lectureItem.dataset.index);
        this.selectLecture(index);
      }
    });
    
    // Tab switching
    document.querySelectorAll('.video-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        const tabName = tab.dataset.tab;
        this.switchTab(tabName);
      });
    });
    
    // Fullscreen button
    document.getElementById('fullscreenBtn').addEventListener('click', () => {
      this.toggleFullscreen();
    });
  }
  
  togglePlay() {
    this.isPlaying = !this.isPlaying;
    const btn = document.getElementById('playPauseBtn');
    btn.textContent = this.isPlaying ? '⏸' : '▶';
    
    if (this.isPlaying) {
      this.startPlayback();
    } else {
      this.stopPlayback();
    }
  }
  
  startPlayback() {
    // Simulate playback with interval
    this.playbackInterval = setInterval(() => {
      if (this.currentTime < this.duration) {
        this.currentTime += 1;
        this.progress = (this.currentTime / this.duration) * 100;
        this.updateProgress();
      } else {
        this.stopPlayback();
        this.nextLecture();
      }
    }, 1000);
  }
  
  stopPlayback() {
    this.isPlaying = false;
    clearInterval(this.playbackInterval);
    document.getElementById('playPauseBtn').textContent = '▶';
  }
  
  updateProgress() {
    document.getElementById('progressBar').style.width = `${this.progress}%`;
    document.getElementById('currentTime').textContent = this.formatTime(this.currentTime);
    
    if (this.options.onProgress) {
      this.options.onProgress(this.progress, this.currentTime);
    }
  }
  
  seekTo(percent) {
    this.currentTime = Math.floor((percent / 100) * this.duration);
    this.progress = percent;
    this.updateProgress();
  }
  
  selectLecture(index) {
    if (index < 0 || index >= this.options.lectures.length) return;
    
    this.currentLecture = index;
    this.currentTime = 0;
    this.progress = 0;
    this.duration = this.parseDuration(this.options.lectures[index].duration);
    
    this.stopPlayback();
    this.updateProgress();
    this.renderLectureList();
    this.renderResourceList();
    
    document.getElementById('totalTime').textContent = this.formatTime(this.duration);
    document.querySelector('.video-player-title').textContent = this.options.lectures[index].title;
    
    if (this.options.onLectureChange) {
      this.options.onLectureChange(index, this.options.lectures[index]);
    }
  }
  
  previousLecture() {
    this.selectLecture(this.currentLecture - 1);
  }
  
  nextLecture() {
    this.selectLecture(this.currentLecture + 1);
  }
  
  switchTab(tabName) {
    document.querySelectorAll('.video-tab').forEach(tab => {
      tab.classList.remove('active');
      if (tab.dataset.tab === tabName) {
        tab.classList.add('active');
      }
    });
    
    document.querySelectorAll('.video-tab-content').forEach(content => {
      content.classList.remove('active');
    });
    
    document.getElementById(`tab-${tabName}`).classList.add('active');
  }
  
  toggleFullscreen() {
    const container = this.container.querySelector('.video-player-main');
    if (!document.fullscreenElement) {
      container.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }
  
  formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }
  
  parseDuration(durationStr) {
    const parts = durationStr.split(':');
    if (parts.length === 2) {
      return parseInt(parts[0]) * 60 + parseInt(parts[1]);
    }
    return 0;
  }
}

// ── QUIZ SYSTEM ──
class QuizSystem {
  constructor(containerId, quizData) {
    this.container = document.getElementById(containerId);
    this.quizData = quizData;
    this.currentQuestion = 0;
    this.score = 0;
    this.answers = [];
    
    this.init();
  }
  
  init() {
    this.render();
    this.attachEvents();
  }
  
  render() {
    this.container.innerHTML = `
      <div class="quiz-container">
        <div class="quiz-header">
          <div class="quiz-title">${this.quizData.title || 'Quiz'}</div>
          <div class="quiz-progress">
            <span class="quiz-score">النقاط: <span id="currentScore">0</span>/${this.quizData.questions.length}</span>
            <span style="color: var(--muted);">|</span>
            <span id="questionCounter">1/${this.quizData.questions.length}</span>
          </div>
        </div>
        
        <div id="quizContent">
          <div class="quiz-question">
            <div class="quiz-question-text" id="questionText"></div>
            <div class="quiz-options" id="optionsContainer"></div>
            <div class="quiz-feedback" id="feedback"></div>
          </div>
          
          <div class="quiz-actions">
            <button class="quiz-btn" id="nextBtn" disabled>التالي</button>
            <button class="quiz-btn quiz-btn-outline" id="skipBtn">تخطي</button>
          </div>
        </div>
        
        <div id="quizResults" class="quiz-results" style="display: none;">
          <div class="quiz-results-score" id="finalScore"></div>
          <div class="quiz-results-message" id="resultsMessage"></div>
          <div class="quiz-actions" style="justify-content: center;">
            <button class="quiz-btn" id="retryBtn">إعادة المحاولة</button>
            <button class="quiz-btn quiz-btn-outline" id="reviewBtn">مراجعة الإجابات</button>
          </div>
        </div>
      </div>
    `;
    
    this.renderQuestion();
  }
  
  renderQuestion() {
    const question = this.quizData.questions[this.currentQuestion];
    
    document.getElementById('questionText').textContent = question.question;
    document.getElementById('questionCounter').textContent = `${this.currentQuestion + 1}/${this.quizData.questions.length}`;
    
    const optionsContainer = document.getElementById('optionsContainer');
    optionsContainer.innerHTML = question.options.map((option, index) => `
      <div class="quiz-option" data-index="${index}">
        <div class="quiz-option-marker">${String.fromCharCode(65 + index)}</div>
        <div class="quiz-option-text">${option}</div>
      </div>
    `).join('');
    
    document.getElementById('feedback').classList.remove('show');
    document.getElementById('nextBtn').disabled = true;
  }
  
  attachEvents() {
    document.getElementById('optionsContainer').addEventListener('click', (e) => {
      const option = e.target.closest('.quiz-option');
      if (option && !option.classList.contains('selected')) {
        this.selectOption(parseInt(option.dataset.index));
      }
    });
    
    document.getElementById('nextBtn').addEventListener('click', () => {
      this.nextQuestion();
    });
    
    document.getElementById('skipBtn').addEventListener('click', () => {
      this.skipQuestion();
    });
    
    document.getElementById('retryBtn').addEventListener('click', () => {
      this.retryQuiz();
    });
    
    document.getElementById('reviewBtn').addEventListener('click', () => {
      this.reviewAnswers();
    });
  }
  
  selectOption(index) {
    const question = this.quizData.questions[this.currentQuestion];
    const options = document.querySelectorAll('.quiz-option');
    
    options.forEach(opt => opt.classList.remove('selected'));
    options[index].classList.add('selected');
    
    const isCorrect = index === question.correctAnswer;
    this.answers[this.currentQuestion] = {
      selected: index,
      correct: isCorrect
    };
    
    if (isCorrect) {
      this.score++;
      document.getElementById('currentScore').textContent = this.score;
      options[index].classList.add('correct');
      this.showFeedback(true, question.explanation || '');
    } else {
      options[index].classList.add('incorrect');
      options[question.correctAnswer].classList.add('correct');
      this.showFeedback(false, question.explanation || '');
    }
    
    document.getElementById('nextBtn').disabled = false;
  }
  
  showFeedback(isCorrect, explanation) {
    const feedback = document.getElementById('feedback');
    feedback.className = `quiz-feedback show ${isCorrect ? 'correct' : 'incorrect'}`;
    feedback.innerHTML = isCorrect 
      ? `✓ إجابة صحيحة! ${explanation}`
      : `✗ إجابة خاطئة. ${explanation}`;
  }
  
  nextQuestion() {
    if (this.currentQuestion < this.quizData.questions.length - 1) {
      this.currentQuestion++;
      this.renderQuestion();
    } else {
      this.showResults();
    }
  }
  
  skipQuestion() {
    this.answers[this.currentQuestion] = {
      selected: null,
      correct: false
    };
    this.nextQuestion();
  }
  
  showResults() {
    document.getElementById('quizContent').style.display = 'none';
    document.getElementById('quizResults').style.display = 'block';
    
    const percentage = (this.score / this.quizData.questions.length) * 100;
    document.getElementById('finalScore').textContent = `${this.score}/${this.quizData.questions.length}`;
    
    let message = '';
    if (percentage >= 80) {
      message = 'ممتاز! لديك فهم قوي للموضوع.';
    } else if (percentage >= 60) {
      message = 'جيد! يمكنك تحسين أدائك أكثر.';
    } else {
      message = 'نحتاج إلى مراجعة المزيد من المحتوى.';
    }
    
    document.getElementById('resultsMessage').textContent = message;
  }
  
  retryQuiz() {
    this.currentQuestion = 0;
    this.score = 0;
    this.answers = [];
    
    document.getElementById('currentScore').textContent = '0';
    document.getElementById('quizContent').style.display = 'block';
    document.getElementById('quizResults').style.display = 'none';
    
    this.renderQuestion();
  }
  
  reviewAnswers() {
    alert('سيتم إضافة صفحة مراجعة الإجابات قريباً');
  }
}

// ── TEMPLATE FORM SYSTEM ──
class TemplateForm {
  constructor(containerId, templateData) {
    this.container = document.getElementById(containerId);
    this.templateData = templateData;
    this.formData = {};
    
    this.init();
  }
  
  init() {
    this.render();
    this.attachEvents();
  }
  
  render() {
    this.container.innerHTML = `
      <div class="template-form">
        <div class="template-form-header">
          <div class="template-form-title">${this.templateData.title}</div>
          <div class="template-form-subtitle">${this.templateData.subtitle || ''}</div>
        </div>
        
        <form id="templateForm">
          ${this.renderFields()}
        </form>
        
        <div class="form-actions">
          <button type="button" class="form-btn-primary" id="saveBtn">حفظ النموذج</button>
          <button type="button" class="form-btn-secondary" id="downloadBtn">تحميل PDF</button>
          <button type="button" class="form-btn-secondary" id="resetBtn">إعادة تعيين</button>
        </div>
      </div>
    `;
  }
  
  renderFields() {
    return this.templateData.fields.map(field => {
      switch (field.type) {
        case 'text':
        case 'email':
        case 'date':
          return `
            <div class="form-group">
              <label class="form-label">${field.label}</label>
              <input type="${field.type}" class="form-input" name="${field.name}" ${field.required ? 'required' : ''} placeholder="${field.placeholder || ''}">
            </div>
          `;
        case 'textarea':
          return `
            <div class="form-group">
              <label class="form-label">${field.label}</label>
              <textarea class="form-textarea" name="${field.name}" ${field.required ? 'required' : ''} placeholder="${field.placeholder || ''}"></textarea>
            </div>
          `;
        case 'select':
          return `
            <div class="form-group">
              <label class="form-label">${field.label}</label>
              <select class="form-select" name="${field.name}" ${field.required ? 'required' : ''}>
                <option value="">اختر...</option>
                ${field.options.map(opt => `<option value="${opt.value}">${opt.label}</option>`).join('')}
              </select>
            </div>
          `;
        case 'checkbox':
          return `
            <div class="form-group">
              <label class="form-checkbox">
                <input type="checkbox" name="${field.name}" ${field.required ? 'required' : ''}>
                <span class="form-checkbox-label">${field.label}</span>
              </label>
            </div>
          `;
        case 'row':
          return `
            <div class="form-row">
              ${field.fields.map(subField => this.renderField(subField)).join('')}
            </div>
          `;
        default:
          return '';
      }
    }).join('');
  }
  
  renderField(field) {
    return `
      <div class="form-group">
        <label class="form-label">${field.label}</label>
        <input type="${field.type || 'text'}" class="form-input" name="${field.name}" ${field.required ? 'required' : ''} placeholder="${field.placeholder || ''}">
      </div>
    `;
  }
  
  attachEvents() {
    document.getElementById('saveBtn').addEventListener('click', () => {
      this.saveForm();
    });
    
    document.getElementById('downloadBtn').addEventListener('click', () => {
      this.downloadPDF();
    });
    
    document.getElementById('resetBtn').addEventListener('click', () => {
      this.resetForm();
    });
  }
  
  saveForm() {
    const form = document.getElementById('templateForm');
    const formData = new FormData(form);
    
    this.formData = {};
    formData.forEach((value, key) => {
      this.formData[key] = value;
    });
    
    localStorage.setItem(this.templateData.id, JSON.stringify(this.formData));
    alert('تم حفظ النموذج بنجاح!');
  }
  
  downloadPDF() {
    alert('سيتم إضافة ميزة تحميل PDF قريباً');
  }
  
  resetForm() {
    document.getElementById('templateForm').reset();
    this.formData = {};
    localStorage.removeItem(this.templateData.id);
  }
  
  loadSavedData() {
    const saved = localStorage.getItem(this.templateData.id);
    if (saved) {
      this.formData = JSON.parse(saved);
      const form = document.getElementById('templateForm');
      
      Object.keys(this.formData).forEach(key => {
        const input = form.querySelector(`[name="${key}"]`);
        if (input) {
          if (input.type === 'checkbox') {
            input.checked = this.formData[key];
          } else {
            input.value = this.formData[key];
          }
        }
      });
    }
  }
}
