// Skill Assessment System for PharmaPro Academy
const SkillAssessmentSystem = {
  assessments: [],
  skillCategories: {
    gmp: {
      name: 'GMP Knowledge',
      description: 'المعرفة بممارسات التصنيع الجيد',
      skills: [
        { id: 'gmp_basics', name: 'أساسيات GMP', level: 'beginner' },
        { id: 'gmp_documentation', name: 'التوثيق', level: 'intermediate' },
        { id: 'gmp_validation', name: 'التحقق والتثبيت', level: 'advanced' },
        { id: 'gmp_compliance', name: 'الامتثال', level: 'intermediate' }
      ]
    },
    qc: {
      name: 'Quality Control',
      description: 'التحكم في الجودة',
      skills: [
        { id: 'qc_testing', name: 'الاختبارات', level: 'beginner' },
        { id: 'qc_analytical', name: 'التحليل', level: 'intermediate' },
        { id: 'qc_instrumentation', name: 'الأجهزة', level: 'advanced' },
        { id: 'qc_method_validation', name: 'تحقق الطرق', level: 'advanced' }
      ]
    },
    iso: {
      name: 'ISO Standards',
      description: 'معايير ISO',
      skills: [
        { id: 'iso_basics', name: 'أساسيات ISO', level: 'beginner' },
        { id: 'iso_9001', name: 'ISO 9001', level: 'intermediate' },
        { id: 'iso_auditing', name: 'التدقيق', level: 'advanced' },
        { id: 'iso_implementation', name: 'التطبيق', level: 'advanced' }
      ]
    },
    capa: {
      name: 'CAPA',
      description: 'الإجراءات التصحيحية والوقائية',
      skills: [
        { id: 'capa_investigation', name: 'التحقيق', level: 'intermediate' },
        { id: 'capa_root_cause', name: 'تحليل السبب الجذري', level: 'advanced' },
        { id: 'capa_implementation', name: 'التطبيق', level: 'intermediate' },
        { id: 'capa_effectiveness', name: 'تقييم الفعالية', level: 'advanced' }
      ]
    }
  },
  
  init() {
    this.loadAssessments();
    this.setupAssessmentTemplates();
  },
  
  loadAssessments() {
    const saved = localStorage.getItem('skill_assessments');
    if (saved) {
      this.assessments = JSON.parse(saved);
    }
  },
  
  saveAssessments() {
    localStorage.setItem('skill_assessments', JSON.stringify(this.assessments));
  },
  
  setupAssessmentTemplates() {
    // Pre-defined assessment templates
    this.assessmentTemplates = {
      gmp_basic: {
        id: 'gmp_basic',
        name: 'تقييم GMP الأساسي',
        category: 'gmp',
        level: 'beginner',
        duration: 30,
        questions: [
          {
            id: 1,
            question: 'ما هو الهدف الرئيسي لـ GMP؟',
            options: [
              'تقليل التكاليف',
              'ضمان جودة المنتج وسلامة المرضى',
              'زيادة الإنتاج',
              'تحسين العلاقات مع الموردين'
            ],
            correct: 1,
            skill: 'gmp_basics'
          },
          {
            id: 2,
            question: 'ما هي أهمية التوثيق في GMP؟',
            options: [
              'للأرشفة فقط',
              'لإثبات الامتثال وتتبع العمليات',
              'للعرض على العملاء',
              'للتدقيق الداخلي فقط'
            ],
            correct: 1,
            skill: 'gmp_documentation'
          },
          {
            id: 3,
            question: 'ما هو الفرق بين التحقق والتثبيت؟',
            options: [
              'لا يوجد فرق',
              'التحقق يثبت أن العملية تعمل، التثبيت يثبت أنها تعمل بشكل متسق',
              'التحقق للمعدات فقط',
              'التثبيت للموظفين فقط'
            ],
            correct: 1,
            skill: 'gmp_validation'
          }
        ]
      },
      qc_intermediate: {
        id: 'qc_intermediate',
        name: 'تقييم QC المتوسط',
        category: 'qc',
        level: 'intermediate',
        duration: 45,
        questions: [
          {
            id: 1,
            question: 'ما هو الهدف من اختبار القبول؟',
            options: [
              'تحديد تكلفة المنتج',
              'ضمان أن المواد الخام تلبي المواصفات',
              'تدريب الموظفين',
              'تحسين السرعة'
            ],
            correct: 1,
            skill: 'qc_testing'
          },
          {
            id: 2,
            question: 'ما هي أهمية معايرة الأجهزة؟',
            options: [
              'للحفاظ على الضمان',
              'لضمان دقة النتائج',
              'للأرشفة',
              'للتدريب'
            ],
            correct: 1,
            skill: 'qc_instrumentation'
          }
        ]
      }
    };
  },
  
  // Create custom assessment
  createAssessment(name, category, level, questions) {
    const assessment = {
      id: this.generateAssessmentId(),
      name: name,
      category: category,
      level: level,
      questions: questions,
      createdAt: new Date(),
      active: true
    };
    
    this.assessments.push(assessment);
    this.saveAssessments();
    
    return assessment;
  },
  
  generateAssessmentId() {
    return 'assessment_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  },
  
  // Take assessment
  takeAssessment(assessmentId, userId) {
    const assessment = this.getAssessment(assessmentId);
    
    if (!assessment) {
      return { success: false, reason: 'Assessment not found' };
    }
    
    const attempt = {
      id: this.generateAttemptId(),
      assessmentId: assessmentId,
      userId: userId,
      startedAt: new Date(),
      completedAt: null,
      answers: {},
      score: 0,
      skillScores: {},
      status: 'in_progress'
    };
    
    return { success: true, attempt: attempt, assessment: assessment };
  },
  
  generateAttemptId() {
    return 'attempt_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  },
  
  // Submit answer
  submitAnswer(attemptId, questionId, answer) {
    const attempt = this.getAttempt(attemptId);
    
    if (!attempt) {
      return { success: false, reason: 'Attempt not found' };
    }
    
    attempt.answers[questionId] = answer;
    
    // Save attempt
    this.saveAttempt(attempt);
    
    return { success: true };
  },
  
  // Complete assessment
  completeAssessment(attemptId) {
    const attempt = this.getAttempt(attemptId);
    
    if (!attempt) {
      return { success: false, reason: 'Attempt not found' };
    }
    
    const assessment = this.getAssessment(attempt.assessmentId);
    
    if (!assessment) {
      return { success: false, reason: 'Assessment not found' };
    }
    
    // Calculate score
    let correctAnswers = 0;
    const skillScores = {};
    
    assessment.questions.forEach(question => {
      const userAnswer = attempt.answers[question.id];
      const isCorrect = userAnswer === question.correct;
      
      if (isCorrect) {
        correctAnswers++;
      }
      
      // Track skill scores
      if (!skillScores[question.skill]) {
        skillScores[question.skill] = { correct: 0, total: 0 };
      }
      
      skillScores[question.skill].total++;
      if (isCorrect) {
        skillScores[question.skill].correct++;
      }
    });
    
    // Calculate percentage for each skill
    Object.keys(skillScores).forEach(skill => {
      skillScores[skill].percentage = Math.round(
        (skillScores[skill].correct / skillScores[skill].total) * 100
      );
    });
    
    // Calculate overall score
    const score = Math.round((correctAnswers / assessment.questions.length) * 100);
    
    attempt.completedAt = new Date();
    attempt.score = score;
    attempt.skillScores = skillScores;
    attempt.status = 'completed';
    
    this.saveAttempt(attempt);
    
    // Generate recommendations
    const recommendations = this.generateRecommendations(skillScores);
    
    return { 
      success: true, 
      attempt: attempt,
      score: score,
      skillScores: skillScores,
      recommendations: recommendations
    };
  },
  
  // Generate recommendations based on skill scores
  generateRecommendations(skillScores) {
    const recommendations = [];
    
    Object.keys(skillScores).forEach(skillId => {
      const skillData = skillScores[skillId];
      
      if (skillData.percentage < 60) {
        recommendations.push({
          skill: skillId,
          level: 'beginner',
          message: 'يُنصح بمراجعة الأساسيات لهذه المهارة',
          suggestedCourses: this.getSuggestedCourses(skillId, 'beginner')
        });
      } else if (skillData.percentage < 80) {
        recommendations.push({
          skill: skillId,
          level: 'intermediate',
          message: 'يُنصح بتحسين هذه المهارة',
          suggestedCourses: this.getSuggestedCourses(skillId, 'intermediate')
        });
      }
    });
    
    return recommendations;
  },
  
  getSuggestedCourses(skillId, level) {
    // Map skills to suggested courses
    const courseMap = {
      gmp_basics: { beginner: 'course-gmp-basics.html', intermediate: 'course-validation.html' },
      gmp_documentation: { beginner: 'course-gmp-basics.html', intermediate: 'course-validation.html' },
      gmp_validation: { beginner: 'course-validation.html', intermediate: 'course-advanced-validation.html' },
      gmp_compliance: { beginner: 'course-iso-9001.html', intermediate: 'course-validation.html' },
      qc_testing: { beginner: 'course-qc-lab.html', intermediate: 'course-ipqc.html' },
      qc_analytical: { beginner: 'course-qc-lab.html', intermediate: 'course-ipqc.html' },
      qc_instrumentation: { beginner: 'course-qc-lab.html', intermediate: 'course-ipqc.html' },
      qc_method_validation: { beginner: 'course-validation.html', intermediate: 'course-advanced-validation.html' },
      iso_basics: { beginner: 'course-iso-9001.html', intermediate: 'course-iso-9001.html' },
      iso_9001: { beginner: 'course-iso-9001.html', intermediate: 'course-iso-9001.html' },
      iso_auditing: { beginner: 'course-iso-9001.html', intermediate: 'course-iso-9001.html' },
      iso_implementation: { beginner: 'course-iso-9001.html', intermediate: 'course-iso-9001.html' },
      capa_investigation: { beginner: 'course-capa.html', intermediate: 'course-capa.html' },
      capa_root_cause: { beginner: 'course-capa.html', intermediate: 'course-capa.html' },
      capa_implementation: { beginner: 'course-capa.html', intermediate: 'course-capa.html' },
      capa_effectiveness: { beginner: 'course-capa.html', intermediate: 'course-capa.html' }
    };
    
    return courseMap[skillId] ? [courseMap[skillId][level]] : [];
  },
  
  // Get assessment
  getAssessment(assessmentId) {
    return this.assessments.find(a => a.id === assessmentId) || this.assessmentTemplates[assessmentId];
  },
  
  // Get all assessments
  getAllAssessments() {
    return [...this.assessments, ...Object.values(this.assessmentTemplates)];
  },
  
  // Get assessments by category
  getAssessmentsByCategory(category) {
    return this.getAllAssessments().filter(a => a.category === category);
  },
  
  // Get assessments by level
  getAssessmentsByLevel(level) {
    return this.getAllAssessments().filter(a => a.level === level);
  },
  
  // Save attempt
  saveAttempt(attempt) {
    const attempts = JSON.parse(localStorage.getItem('assessment_attempts') || '[]');
    const existingIndex = attempts.findIndex(a => a.id === attempt.id);
    
    if (existingIndex >= 0) {
      attempts[existingIndex] = attempt;
    } else {
      attempts.push(attempt);
    }
    
    localStorage.setItem('assessment_attempts', JSON.stringify(attempts));
  },
  
  // Get attempt
  getAttempt(attemptId) {
    const attempts = JSON.parse(localStorage.getItem('assessment_attempts') || '[]');
    return attempts.find(a => a.id === attemptId);
  },
  
  // Get user attempts
  getUserAttempts(userId) {
    const attempts = JSON.parse(localStorage.getItem('assessment_attempts') || '[]');
    return attempts.filter(a => a.userId === userId);
  },
  
  // Get user skill profile
  getUserSkillProfile(userId) {
    const attempts = this.getUserAttempts(userId);
    const completedAttempts = attempts.filter(a => a.status === 'completed');
    
    const skillProfile = {};
    
    completedAttempts.forEach(attempt => {
      Object.keys(attempt.skillScores).forEach(skillId => {
        if (!skillProfile[skillId]) {
          skillProfile[skillId] = {
            attempts: 0,
            averageScore: 0,
            latestScore: 0,
            trend: 'stable'
          };
        }
        
        skillProfile[skillId].attempts++;
        skillProfile[skillId].latestScore = attempt.skillScores[skillId].percentage;
        
        // Calculate average
        const totalScore = (skillProfile[skillId].averageScore * (skillProfile[skillId].attempts - 1)) + 
                          attempt.skillScores[skillId].percentage;
        skillProfile[skillId].averageScore = Math.round(totalScore / skillProfile[skillId].attempts);
        
        // Determine trend
        if (skillProfile[skillId].attempts > 1) {
          if (attempt.skillScores[skillId].percentage > skillProfile[skillId].averageScore) {
            skillProfile[skillId].trend = 'improving';
          } else if (attempt.skillScores[skillId].percentage < skillProfile[skillId].averageScore) {
            skillProfile[skillId].trend = 'declining';
          }
        }
      });
    });
    
    return skillProfile;
  },
  
  // Get skill categories
  getSkillCategories() {
    return this.skillCategories;
  },
  
  // Get skills by category
  getSkillsByCategory(category) {
    return this.skillCategories[category]?.skills || [];
  },
  
  // Get assessment statistics
  getAssessmentStats() {
    const attempts = JSON.parse(localStorage.getItem('assessment_attempts') || '[]');
    const completed = attempts.filter(a => a.status === 'completed');
    
    const totalAttempts = attempts.length;
    const totalCompleted = completed.length;
    const averageScore = completed.length > 0 
      ? Math.round(completed.reduce((sum, a) => sum + a.score, 0) / completed.length)
      : 0;
    
    return {
      totalAssessments: this.getAllAssessments().length,
      totalAttempts: totalAttempts,
      totalCompleted: totalCompleted,
      averageScore: averageScore,
      completionRate: totalAttempts > 0 ? Math.round((totalCompleted / totalAttempts) * 100) : 0
    };
  }
};

// Initialize skill assessment system on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  SkillAssessmentSystem.init();
});

// Export for global access
window.SkillAssessmentSystem = SkillAssessmentSystem;
