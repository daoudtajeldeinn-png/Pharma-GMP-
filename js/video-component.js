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
    this.volume = 1;
    this.playbackSpeed = 1;
    this.isMuted = false;
    
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
          <button class="video-control-btn" id="volumeBtn">🔊</button>
          <button class="video-control-btn" id="speedBtn">1x</button>
          <button class="video-control-btn" id="pipBtn">📺</button>
          <button class="video-control-btn" id="fullscreenBtn">⛶</button>
        </div>
        
        <div class="video-player-volume-slider" id="volumeSlider" style="display: none;">
          <input type="range" min="0" max="100" value="100" id="volumeInput">
        </div>
        
        <div class="video-player-speed-menu" id="speedMenu" style="display: none;">
          <div class="speed-option" data-speed="0.5">0.5x</div>
          <div class="speed-option" data-speed="0.75">0.75x</div>
          <div class="speed-option active" data-speed="1">1x</div>
          <div class="speed-option" data-speed="1.25">1.25x</div>
          <div class="speed-option" data-speed="1.5">1.5x</div>
          <div class="speed-option" data-speed="2">2x</div>
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
    
    // Volume button
    document.getElementById('volumeBtn').addEventListener('click', () => {
      this.toggleMute();
    });
    
    // Volume slider
    document.getElementById('volumeInput').addEventListener('input', (e) => {
      this.setVolume(e.target.value / 100);
    });
    
    // Speed button
    document.getElementById('speedBtn').addEventListener('click', () => {
      this.toggleSpeedMenu();
    });
    
    // Speed options
    document.querySelectorAll('.speed-option').forEach(option => {
      option.addEventListener('click', () => {
        this.setPlaybackSpeed(parseFloat(option.dataset.speed));
      });
    });
    
    // PiP button
    document.getElementById('pipBtn').addEventListener('click', () => {
      this.togglePiP();
    });
    
    // Close menus when clicking outside
    document.addEventListener('click', (e) => {
      if (!e.target.closest('#volumeBtn') && !e.target.closest('#volumeSlider')) {
        document.getElementById('volumeSlider').style.display = 'none';
      }
      if (!e.target.closest('#speedBtn') && !e.target.closest('#speedMenu')) {
        document.getElementById('speedMenu').style.display = 'none';
      }
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
  
  toggleMute() {
    this.isMuted = !this.isMuted;
    const btn = document.getElementById('volumeBtn');
    btn.textContent = this.isMuted ? '🔇' : '🔊';
    
    // Show/hide volume slider
    const slider = document.getElementById('volumeSlider');
    slider.style.display = slider.style.display === 'none' ? 'block' : 'none';
  }
  
  setVolume(value) {
    this.volume = value;
    const btn = document.getElementById('volumeBtn');
    if (value === 0) {
      btn.textContent = '🔇';
      this.isMuted = true;
    } else {
      btn.textContent = '🔊';
      this.isMuted = false;
    }
  }
  
  toggleSpeedMenu() {
    const menu = document.getElementById('speedMenu');
    menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
  }
  
  setPlaybackSpeed(speed) {
    this.playbackSpeed = speed;
    const btn = document.getElementById('speedBtn');
    btn.textContent = speed + 'x';
    
    // Update active state
    document.querySelectorAll('.speed-option').forEach(option => {
      option.classList.remove('active');
      if (parseFloat(option.dataset.speed) === speed) {
        option.classList.add('active');
      }
    });
    
    // Hide menu
    document.getElementById('speedMenu').style.display = 'none';
    
    // Adjust playback interval if playing
    if (this.isPlaying) {
      this.stopPlayback();
      this.startPlayback();
    }
  }
  
  togglePiP() {
    const video = this.container.querySelector('video');
    if (video && document.pictureInPictureEnabled) {
      if (document.pictureInPictureElement) {
        document.exitPictureInPicture();
      } else {
        video.requestPictureInPicture();
      }
    } else {
      alert('متصفحك لا يدعم وضع Picture-in-Picture');
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

// ── ENHANCED QUIZ SYSTEM ──
class QuizSystem {
  constructor(containerId, quizData) {
    this.container = document.getElementById(containerId);
    this.quizData = quizData;
    this.currentQuestion = 0;
    this.score = 0;
    this.answers = [];
    this.attempts = 0;
    
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
            <span style="color: var(--muted);">|</span>
            <span id="attemptCounter">المحاولة: 1</span>
          </div>
        </div>
        
        <div id="quizContent">
          <div class="quiz-question">
            <div class="quiz-question-type" id="questionType"></div>
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
          <div class="quiz-performance-analysis" id="performanceAnalysis"></div>
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
    
    // Render question type indicator
    const typeLabels = {
      'multiple-choice': 'اختيار من متعدد',
      'true-false': 'صح أو خطأ',
      'fill-blank': 'أكمل الفراغ',
      'matching': 'مطابقة',
      'ordering': 'ترتيب'
    };
    document.getElementById('questionType').textContent = typeLabels[question.type] || 'سؤال';
    
    const optionsContainer = document.getElementById('optionsContainer');
    
    // Render based on question type
    switch(question.type) {
      case 'true-false':
        optionsContainer.innerHTML = `
          <div class="quiz-option" data-index="0">
            <div class="quiz-option-marker">A</div>
            <div class="quiz-option-text">صح</div>
          </div>
          <div class="quiz-option" data-index="1">
            <div class="quiz-option-marker">B</div>
            <div class="quiz-option-text">خطأ</div>
          </div>
        `;
        break;
        
      case 'fill-blank':
        optionsContainer.innerHTML = `
          <div class="quiz-fill-blank">
            <input type="text" class="quiz-input" id="fillBlankInput" placeholder="أدخل إجابتك هنا...">
          </div>
        `;
        break;
        
      case 'matching':
        optionsContainer.innerHTML = this.renderMatchingQuestion(question);
        break;
        
      case 'ordering':
        optionsContainer.innerHTML = this.renderOrderingQuestion(question);
        break;
        
      default: // multiple-choice
        optionsContainer.innerHTML = question.options.map((option, index) => `
          <div class="quiz-option" data-index="${index}">
            <div class="quiz-option-marker">${String.fromCharCode(65 + index)}</div>
            <div class="quiz-option-text">${option}</div>
          </div>
        `).join('');
    }
    
    document.getElementById('feedback').classList.remove('show');
    document.getElementById('nextBtn').disabled = true;
  }
  
  renderMatchingQuestion(question) {
    const items = question.matchingItems || [];
    return `
      <div class="quiz-matching">
        ${items.map((item, index) => `
          <div class="matching-pair" data-index="${index}">
            <div class="matching-item matching-left">${item.left}</div>
            <div class="matching-arrow">→</div>
            <div class="matching-item matching-right">
              <select class="matching-select" data-left="${index}">
                <option value="">اختر...</option>
                ${items.map((opt, i) => `<option value="${i}">${opt.right}</option>`).join('')}
              </select>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }
  
  renderOrderingQuestion(question) {
    const items = question.orderingItems || [];
    const shuffled = [...items].sort(() => Math.random() - 0.5);
    return `
      <div class="quiz-ordering">
        <div class="ordering-instructions">رتب العناصر بالترتيب الصحيح:</div>
        ${shuffled.map((item, index) => `
          <div class="ordering-item" data-original="${item.id}" draggable="true">
            <span class="ordering-number">${index + 1}</span>
            <span class="ordering-text">${item.text}</span>
          </div>
        `).join('')}
      </div>
    `;
  }
  
  attachEvents() {
    document.getElementById('optionsContainer').addEventListener('click', (e) => {
      const option = e.target.closest('.quiz-option');
      if (option && !option.classList.contains('selected')) {
        this.selectOption(parseInt(option.dataset.index));
      }
    });
    
    // Handle fill-blank input
    document.getElementById('optionsContainer').addEventListener('input', (e) => {
      if (e.target.classList.contains('quiz-input')) {
        const value = e.target.value.trim();
        document.getElementById('nextBtn').disabled = value.length === 0;
      }
    });
    
    // Handle matching selects
    document.getElementById('optionsContainer').addEventListener('change', (e) => {
      if (e.target.classList.contains('matching-select')) {
        this.checkMatchingComplete();
      }
    });
    
    // Handle ordering drag and drop
    this.setupOrderingDragDrop();
    
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
  
  setupOrderingDragDrop() {
    const container = document.getElementById('optionsContainer');
    let draggedItem = null;
    
    container.addEventListener('dragstart', (e) => {
      if (e.target.classList.contains('ordering-item')) {
        draggedItem = e.target;
        e.target.style.opacity = '0.5';
      }
    });
    
    container.addEventListener('dragend', (e) => {
      if (e.target.classList.contains('ordering-item')) {
        e.target.style.opacity = '1';
        draggedItem = null;
        this.updateOrderingNumbers();
      }
    });
    
    container.addEventListener('dragover', (e) => {
      e.preventDefault();
      const target = e.target.closest('.ordering-item');
      if (target && target !== draggedItem) {
        const rect = target.getBoundingClientRect();
        const midY = rect.top + rect.height / 2;
        if (e.clientY < midY) {
          target.parentNode.insertBefore(draggedItem, target);
        } else {
          target.parentNode.insertBefore(draggedItem, target.nextSibling);
        }
      }
    });
  }
  
  updateOrderingNumbers() {
    const items = document.querySelectorAll('.ordering-item');
    items.forEach((item, index) => {
      item.querySelector('.ordering-number').textContent = index + 1;
    });
    document.getElementById('nextBtn').disabled = false;
  }
  
  checkMatchingComplete() {
    const selects = document.querySelectorAll('.matching-select');
    const allAnswered = Array.from(selects).every(select => select.value !== '');
    document.getElementById('nextBtn').disabled = !allAnswered;
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
    
    let feedbackHTML = isCorrect 
      ? `<div class="feedback-icon">✓</div>`
      : `<div class="feedback-icon">✗</div>`;
    
    feedbackHTML += `<div class="feedback-content">`;
    feedbackHTML += `<div class="feedback-title">${isCorrect ? 'إجابة صحيحة!' : 'إجابة خاطئة'}</div>`;
    
    if (explanation) {
      feedbackHTML += `<div class="feedback-explanation">${explanation}</div>`;
    }
    
    // Add learning tips for incorrect answers
    if (!isCorrect && this.quizData.questions[this.currentQuestion].learningTip) {
      feedbackHTML += `<div class="feedback-tip">💡 نصيحة: ${this.quizData.questions[this.currentQuestion].learningTip}</div>`;
    }
    
    feedbackHTML += `</div>`;
    feedback.innerHTML = feedbackHTML;
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
    
    // Performance analysis
    this.showPerformanceAnalysis(percentage);
    
    // Update attempt counter
    this.attempts++;
    document.getElementById('attemptCounter').textContent = `المحاولة: ${this.attempts}`;
    
    // Generate certificate if passed
    if (percentage >= 70) {
      this.generateCertificate();
    }
  }
  
  showPerformanceAnalysis(percentage) {
    const analysis = document.getElementById('performanceAnalysis');
    
    // Calculate performance by question type
    const typePerformance = {};
    this.quizData.questions.forEach((question, index) => {
      const type = question.type || 'multiple-choice';
      if (!typePerformance[type]) {
        typePerformance[type] = { correct: 0, total: 0 };
      }
      typePerformance[type].total++;
      if (this.answers[index]?.correct) {
        typePerformance[type].correct++;
      }
    });
    
    let analysisHTML = '<div class="performance-breakdown">';
    analysisHTML += '<h4>تحليل الأداء</h4>';
    
    Object.keys(typePerformance).forEach(type => {
      const data = typePerformance[type];
      const typePercent = Math.round((data.correct / data.total) * 100);
      const typeLabels = {
        'multiple-choice': 'اختيار من متعدد',
        'true-false': 'صح أو خطأ',
        'fill-blank': 'أكمل الفراغ',
        'matching': 'مطابقة',
        'ordering': 'ترتيب'
      };
      
      analysisHTML += `
        <div class="performance-item">
          <div class="performance-label">${typeLabels[type] || type}</div>
          <div class="performance-bar">
            <div class="performance-fill" style="width: ${typePercent}%"></div>
          </div>
          <div class="performance-value">${data.correct}/${data.total} (${typePercent}%)</div>
        </div>
      `;
    });
    
    analysisHTML += '</div>';
    analysis.innerHTML = analysisHTML;
  }
  
  generateCertificate() {
    const certificateData = {
      courseName: this.quizData.title,
      score: this.score,
      total: this.quizData.questions.length,
      percentage: Math.round((this.score / this.quizData.questions.length) * 100),
      date: new Date().toLocaleDateString('ar-EG'),
      studentName: 'د.داود تاج الدين احمد عبدالكريم'
    };
    
    // Save certificate data
    localStorage.setItem(`certificate_${this.quizData.id}`, JSON.stringify(certificateData));
    
    // Add certificate download button
    const resultsDiv = document.getElementById('quizResults');
    const certBtn = document.createElement('button');
    certBtn.className = 'quiz-btn quiz-btn-outline';
    certBtn.textContent = '🎓 تحميل الشهادة';
    certBtn.style.marginTop = '1rem';
    certBtn.onclick = () => this.downloadCertificate(certificateData);
    
    // Remove existing certificate button if any
    const existingBtn = resultsDiv.querySelector('.certificate-btn');
    if (existingBtn) {
      existingBtn.remove();
    }
    
    certBtn.classList.add('certificate-btn');
    resultsDiv.querySelector('.quiz-actions').appendChild(certBtn);
  }
  
  downloadCertificate(certificateData) {
    // Create a simple certificate HTML
    const certificateHTML = `
      <!DOCTYPE html>
      <html lang="ar" dir="rtl">
      <head>
        <meta charset="UTF-8">
        <title>شهادة إتمام - ${certificateData.courseName}</title>
        <style>
          body {
            font-family: 'Cairo', sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            margin: 0;
            padding: 20px;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
          }
          .certificate {
            background: white;
            padding: 40px;
            border-radius: 20px;
            max-width: 800px;
            text-align: center;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            border: 8px solid #C9A84C;
          }
          .certificate-header {
            margin-bottom: 30px;
          }
          .certificate-title {
            font-size: 2.5rem;
            color: #0A1628;
            margin-bottom: 10px;
            font-weight: 700;
          }
          .certificate-subtitle {
            font-size: 1.2rem;
            color: #8BA3C4;
          }
          .certificate-body {
            margin: 40px 0;
          }
          .student-name {
            font-size: 2rem;
            color: #00D4AA;
            margin: 20px 0;
            font-weight: 700;
          }
          .course-name {
            font-size: 1.5rem;
            color: #0A1628;
            margin: 15px 0;
            font-weight: 600;
          }
          .certificate-footer {
            margin-top: 40px;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          .score {
            font-size: 1.5rem;
            color: #C9A84C;
            font-weight: 700;
          }
          .date {
            color: #8BA3C4;
          }
          .seal {
            width: 100px;
            height: 100px;
            background: linear-gradient(135deg, #C9A84C 0%, #E8C96A 100%);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: 700;
            font-size: 0.9rem;
          }
        </style>
      </head>
      <body>
        <div class="certificate">
          <div class="certificate-header">
            <div class="certificate-title">شهادة إتمام</div>
            <div class="certificate-subtitle">PharmaPro Academy</div>
          </div>
          <div class="certificate-body">
            <p style="color: #8BA3C4; font-size: 1.1rem;">تشهد منصة PharmaPro Academy بأن</p>
            <div class="student-name">${certificateData.studentName}</div>
            <p style="color: #8BA3C4; font-size: 1.1rem;">قد أتم بنجاح كورس</p>
            <div class="course-name">${certificateData.courseName}</div>
          </div>
          <div class="certificate-footer">
            <div class="score">النتيجة: ${certificateData.percentage}%</div>
            <div class="seal">معتمد</div>
            <div class="date">${certificateData.date}</div>
          </div>
        </div>
      </body>
      </html>
    `;
    
    // Create download link
    const blob = new Blob([certificateHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `شهادة_${certificateData.courseName.replace(/\s+/g, '_')}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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
