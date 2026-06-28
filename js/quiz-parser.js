// ── QUIZ PARSER - Converts Markdown Quiz Files to JSON Format ──
class QuizParser {
  constructor() {
    this.quizCache = {};
  }

  // Parse markdown quiz file to JSON format
  parseMarkdown(markdownContent) {
    const lines = markdownContent.split('\n');
    const quiz = {
      title: '',
      questions: []
    };

    let currentQuiz = null;
    let currentQuestion = null;
    let currentOptions = [];
    let correctAnswer = null;
    let explanation = '';

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // Quiz title
      if (line.startsWith('# ')) {
        quiz.title = line.substring(2).trim();
        continue;
      }

      // Quiz section header
      if (line.startsWith('### Quiz')) {
        if (currentQuestion && currentOptions.length > 0) {
          quiz.questions.push({
            question: currentQuestion,
            options: currentOptions,
            correctAnswer: correctAnswer,
            explanation: explanation
          });
        }
        currentQuestion = null;
        currentOptions = [];
        correctAnswer = null;
        explanation = '';
        continue;
      }

      // Question
      if (line.startsWith('#### السؤال')) {
        if (currentQuestion && currentOptions.length > 0) {
          quiz.questions.push({
            question: currentQuestion,
            options: currentOptions,
            correctAnswer: correctAnswer,
            explanation: explanation
          });
        }
        currentQuestion = '';
        currentOptions = [];
        correctAnswer = null;
        explanation = '';
        continue;
      }

      // Answer options (A, B, C, D)
      if (line.match(/^- [A-D]\)/)) {
        const optionText = line.replace(/^- [A-D]\)\s*/, '');
        currentOptions.push(optionText);
        continue;
      }

      // Correct answer
      if (line.startsWith('**الإجابة الصحيحة:**')) {
        const answerText = line.replace('**الإجابة الصحيحة:**', '').trim();
        // Find which option matches the correct answer
        correctAnswer = currentOptions.findIndex(opt => 
          opt.includes(answerText) || answerText.includes(opt)
        );
        if (correctAnswer === -1) {
          // Try to match by letter
          if (answerText.includes('A)')) correctAnswer = 0;
          else if (answerText.includes('B)')) correctAnswer = 1;
          else if (answerText.includes('C)')) correctAnswer = 2;
          else if (answerText.includes('D)')) correctAnswer = 3;
        }
        continue;
      }

      // Question content (if not a header)
      if (currentQuestion === null && line.length > 0 && !line.startsWith('#') && !line.startsWith('**')) {
        currentQuestion = line;
      }
    }

    // Add last question
    if (currentQuestion && currentOptions.length > 0) {
      quiz.questions.push({
        question: currentQuestion,
        options: currentOptions,
        correctAnswer: correctAnswer,
        explanation: explanation
      });
    }

    return quiz;
  }

  // Load quiz from markdown file
  async loadQuizFromFile(filePath) {
    if (this.quizCache[filePath]) {
      return this.quizCache[filePath];
    }

    try {
      const response = await fetch(filePath);
      const markdownContent = await response.text();
      const quizData = this.parseMarkdown(markdownContent);
      this.quizCache[filePath] = quizData;
      return quizData;
    } catch (error) {
      console.error('Error loading quiz:', error);
      return null;
    }
  }

  // Load all available quizzes
  async loadAllQuizzes() {
    const quizFiles = [
      'quizzes/capa-quiz.md',
      'quizzes/gmp-basics-quiz.md',
      'quizzes/iso-9001-quiz.md',
      'quizzes/validation-quiz.md',
      'quizzes/qc-lab-quiz.md',
      'quizzes/ipqc-quiz.md'
    ];

    const quizzes = {};
    for (const file of quizFiles) {
      const quizName = file.split('/').pop().replace('-quiz.md', '');
      const quizData = await this.loadQuizFromFile(file);
      if (quizData) {
        quizzes[quizName] = quizData;
      }
    }

    return quizzes;
  }

  // Get quiz by course name
  async getQuizByCourse(courseName) {
    const quizFile = `quizzes/${courseName}-quiz.md`;
    return await this.loadQuizFromFile(quizFile);
  }
}

// ── QUIZ LOADER - Enhanced Quiz System with File Loading ──
class QuizLoader {
  constructor(containerId, quizFilePath) {
    this.container = document.getElementById(containerId);
    this.quizFilePath = quizFilePath;
    this.parser = new QuizParser();
    this.quizSystem = null;
    
    this.init();
  }

  async init() {
    this.showLoading();
    
    const quizData = await this.parser.loadQuizFromFile(this.quizFilePath);
    
    if (quizData) {
      this.quizSystem = new QuizSystem(this.container.id, quizData);
    } else {
      this.showError();
    }
  }

  showLoading() {
    this.container.innerHTML = `
      <div class="quiz-container" style="text-align: center; padding: 3rem;">
        <div style="font-size: 2rem; margin-bottom: 1rem;">⏳</div>
        <div style="color: var(--muted);">جاري تحميل الاختبار...</div>
      </div>
    `;
  }

  showError() {
    this.container.innerHTML = `
      <div class="quiz-container" style="text-align: center; padding: 3rem;">
        <div style="font-size: 2rem; margin-bottom: 1rem;">❌</div>
        <div style="color: var(--muted);">حدث خطأ في تحميل الاختبار</div>
        <button class="quiz-btn" style="margin-top: 1rem;" onclick="location.reload()">إعادة المحاولة</button>
      </div>
    `;
  }
}

// ── QUIZ MANAGER - Manage Multiple Quizzes ──
class QuizManager {
  constructor() {
    this.parser = new QuizParser();
    this.activeQuizzes = {};
  }

  async loadQuiz(containerId, courseName) {
    const quizData = await this.parser.getQuizByCourse(courseName);
    
    if (quizData) {
      const quizSystem = new QuizSystem(containerId, quizData);
      this.activeQuizzes[courseName] = quizSystem;
      return quizSystem;
    }
    
    return null;
  }

  async loadAllQuizzes(containerIds) {
    const quizzes = await this.parser.loadAllQuizzes();
    
    Object.keys(quizzes).forEach((quizName, index) => {
      if (containerIds[index]) {
        new QuizSystem(containerIds[index], quizzes[quizName]);
      }
    });
  }

  getQuizResults(courseName) {
    const quiz = this.activeQuizzes[courseName];
    if (quiz) {
      return {
        score: quiz.score,
        total: quiz.quizData.questions.length,
        answers: quiz.answers
      };
    }
    return null;
  }
}

// Global quiz manager instance
const quizManager = new QuizManager();
