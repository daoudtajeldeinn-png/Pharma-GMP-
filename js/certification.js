// Certification System for PharmaPro Academy
const CertificationSystem = {
  certificates: [],
  certificateTemplates: {
    basic: {
      id: 'basic',
      name: 'شهادة إتمام أساسية',
      description: 'شهادة إتمام الكورس الأساسي',
      validity: 'lifetime',
      requirements: {
        minScore: 70,
        completionRate: 100
      }
    },
    professional: {
      id: 'professional',
      name: 'شهادة احترافية',
      description: 'شهادة احترافية معتمدة',
      validity: '2 years',
      requirements: {
        minScore: 85,
        completionRate: 100,
        projectRequired: true
      }
    },
    expert: {
      id: 'expert',
      name: 'شهادة خبير',
      description: 'شهادة خبير معتمد',
      validity: '3 years',
      requirements: {
        minScore: 90,
        completionRate: 100,
        projectRequired: true,
        examRequired: true
      }
    }
  },
  
  init() {
    this.loadCertificates();
    this.setupCertificateGeneration();
  },
  
  loadCertificates() {
    const saved = localStorage.getItem('certificates');
    if (saved) {
      this.certificates = JSON.parse(saved);
    }
  },
  
  saveCertificates() {
    localStorage.setItem('certificates', JSON.stringify(this.certificates));
  },
  
  // Check eligibility for certification
  checkEligibility(courseId, userId, templateId = 'basic') {
    const template = this.certificateTemplates[templateId];
    if (!template) {
      return { eligible: false, reason: 'Invalid template' };
    }
    
    // Get user progress
    const userProgress = JSON.parse(localStorage.getItem('userProgress') || '{}');
    const progress = userProgress[`${userId}_${courseId}`];
    
    if (!progress) {
      return { eligible: false, reason: 'No progress found' };
    }
    
    // Check completion rate
    if (progress.completionRate < template.requirements.completionRate) {
      return { eligible: false, reason: 'Completion rate not met' };
    }
    
    // Check minimum score
    if (progress.score < template.requirements.minScore) {
      return { eligible: false, reason: 'Score not met' };
    }
    
    // Check project requirement
    if (template.requirements.projectRequired && !progress.projectCompleted) {
      return { eligible: false, reason: 'Project not completed' };
    }
    
    // Check exam requirement
    if (template.requirements.examRequired && !progress.examPassed) {
      return { eligible: false, reason: 'Exam not passed' };
    }
    
    return { eligible: true, template: template };
  },
  
  // Generate certificate
  generateCertificate(courseId, userId, templateId = 'basic') {
    const eligibility = this.checkEligibility(courseId, userId, templateId);
    
    if (!eligibility.eligible) {
      return { success: false, reason: eligibility.reason };
    }
    
    const template = eligibility.template;
    const certificate = {
      id: this.generateCertificateId(),
      courseId: courseId,
      userId: userId,
      templateId: templateId,
      issuedAt: new Date(),
      expiresAt: this.calculateExpiryDate(template.validity),
      status: 'active',
      certificateNumber: this.generateCertificateNumber(),
      verificationCode: this.generateVerificationCode()
    };
    
    this.certificates.push(certificate);
    this.saveCertificates();
    
    return { success: true, certificate: certificate };
  },
  
  generateCertificateId() {
    return 'cert_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  },
  
  generateCertificateNumber() {
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `PPA-${year}-${random}`;
  },
  
  generateVerificationCode() {
    return Math.random().toString(36).substr(2, 12).toUpperCase();
  },
  
  calculateExpiryDate(validity) {
    if (validity === 'lifetime') {
      return null;
    }
    
    const expiryDate = new Date();
    const [amount, unit] = validity.split(' ');
    
    switch (unit) {
      case 'years':
      case 'year':
        expiryDate.setFullYear(expiryDate.getFullYear() + parseInt(amount));
        break;
      case 'months':
      case 'month':
        expiryDate.setMonth(expiryDate.getMonth() + parseInt(amount));
        break;
      default:
        return null;
    }
    
    return expiryDate;
  },
  
  // Verify certificate
  verifyCertificate(verificationCode) {
    const certificate = this.certificates.find(c => c.verificationCode === verificationCode);
    
    if (!certificate) {
      return { valid: false, reason: 'Certificate not found' };
    }
    
    // Check if expired
    if (certificate.expiresAt && new Date(certificate.expiresAt) < new Date()) {
      return { valid: false, reason: 'Certificate expired' };
    }
    
    // Check if revoked
    if (certificate.status === 'revoked') {
      return { valid: false, reason: 'Certificate revoked' };
    }
    
    return { valid: true, certificate: certificate };
  },
  
  // Revoke certificate
  revokeCertificate(certificateId, reason) {
    const certificate = this.certificates.find(c => c.id === certificateId);
    
    if (certificate) {
      certificate.status = 'revoked';
      certificate.revokedAt = new Date();
      certificate.revocationReason = reason;
      this.saveCertificates();
      return true;
    }
    
    return false;
  },
  
  // Renew certificate
  renewCertificate(certificateId) {
    const certificate = this.certificates.find(c => c.id === certificateId);
    
    if (!certificate) {
      return { success: false, reason: 'Certificate not found' };
    }
    
    const template = this.certificateTemplates[certificate.templateId];
    
    if (!template) {
      return { success: false, reason: 'Template not found' };
    }
    
    // Check if renewal is allowed
    if (certificate.expiresAt && new Date(certificate.expiresAt) > new Date()) {
      return { success: false, reason: 'Certificate not yet expired' };
    }
    
    // Re-check eligibility
    const eligibility = this.checkEligibility(certificate.courseId, certificate.userId, certificate.templateId);
    
    if (!eligibility.eligible) {
      return { success: false, reason: eligibility.reason };
    }
    
    // Generate new certificate
    const newCertificate = this.generateCertificate(certificate.courseId, certificate.userId, certificate.templateId);
    
    // Mark old certificate as renewed
    certificate.status = 'renewed';
    certificate.renewedAt = new Date();
    certificate.renewedTo = newCertificate.id;
    this.saveCertificates();
    
    return { success: true, newCertificate: newCertificate };
  },
  
  // Get user certificates
  getUserCertificates(userId) {
    return this.certificates.filter(c => c.userId === userId);
  },
  
  // Get certificate details
  getCertificateDetails(certificateId) {
    const certificate = this.certificates.find(c => c.id === certificateId);
    
    if (!certificate) {
      return null;
    }
    
    const template = this.certificateTemplates[certificate.templateId];
    
    return {
      ...certificate,
      template: template,
      isValid: this.isCertificateValid(certificate)
    };
  },
  
  // Check if certificate is valid
  isCertificateValid(certificate) {
    if (certificate.status !== 'active') {
      return false;
    }
    
    if (certificate.expiresAt && new Date(certificate.expiresAt) < new Date()) {
      return false;
    }
    
    return true;
  },
  
  // Get expiring certificates
  getExpiringCertificates(days = 30) {
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + days);
    
    return this.certificates.filter(c => {
      if (!c.expiresAt || c.status !== 'active') {
        return false;
      }
      
      return new Date(c.expiresAt) <= expiryDate;
    });
  },
  
  // Generate certificate HTML for download
  generateCertificateHTML(certificateId) {
    const certificate = this.getCertificateDetails(certificateId);
    
    if (!certificate) {
      return null;
    }
    
    const html = `
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <title>شهادة - PharmaPro Academy</title>
  <style>
    body {
      font-family: 'Cairo', sans-serif;
      background: #f5f5f5;
      margin: 0;
      padding: 40px;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
    }
    .certificate {
      background: white;
      width: 800px;
      padding: 60px;
      border: 10px solid #C9A84C;
      position: relative;
      box-shadow: 0 10px 30px rgba(0,0,0,0.1);
    }
    .certificate::before {
      content: '';
      position: absolute;
      top: 20px;
      left: 20px;
      right: 20px;
      bottom: 20px;
      border: 2px solid #00D4AA;
    }
    .header {
      text-align: center;
      margin-bottom: 40px;
    }
    .logo {
      font-size: 2rem;
      color: #00D4AA;
      font-weight: bold;
      margin-bottom: 10px;
    }
    .title {
      font-size: 1.5rem;
      color: #0A1628;
      margin-bottom: 5px;
    }
    .subtitle {
      font-size: 1rem;
      color: #8BA3C4;
    }
    .content {
      text-align: center;
      margin: 40px 0;
    }
    .presented-to {
      font-size: 1.2rem;
      color: #8BA3C4;
      margin-bottom: 20px;
    }
    .recipient-name {
      font-size: 2rem;
      color: #0A1628;
      font-weight: bold;
      margin-bottom: 20px;
    }
    .course-name {
      font-size: 1.5rem;
      color: #00D4AA;
      font-weight: bold;
      margin-bottom: 10px;
    }
    .certificate-type {
      font-size: 1.2rem;
      color: #C9A84C;
      font-weight: bold;
    }
    .footer {
      display: flex;
      justify-content: space-between;
      margin-top: 60px;
      padding-top: 40px;
      border-top: 2px solid #00D4AA;
    }
    .info {
      text-align: center;
    }
    .info-label {
      font-size: 0.9rem;
      color: #8BA3C4;
      margin-bottom: 5px;
    }
    .info-value {
      font-size: 1rem;
      color: #0A1628;
      font-weight: bold;
    }
    .seal {
      width: 80px;
      height: 80px;
      border: 4px solid #C9A84C;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 2rem;
      color: #C9A84C;
      margin: 0 auto;
    }
    .verification {
      text-align: center;
      margin-top: 20px;
      font-size: 0.8rem;
      color: #8BA3C4;
    }
  </style>
</head>
<body>
  <div class="certificate">
    <div class="header">
      <div class="logo">⚕️ PharmaPro Academy</div>
      <div class="title">شهادة إتمام</div>
      <div class="subtitle">منصة التدريب المتخصصة في GMP والتحكم في الجودة</div>
    </div>
    
    <div class="content">
      <div class="presented-to">تشهد أكاديمية فارما برو بأن</div>
      <div class="recipient-name">المتدرب</div>
      <div class="course-name">قد أكمل بنجاح</div>
      <div class="certificate-type">${certificate.template.name}</div>
      <div class="seal">✓</div>
    </div>
    
    <div class="footer">
      <div class="info">
        <div class="info-label">رقم الشهادة</div>
        <div class="info-value">${certificate.certificateNumber}</div>
      </div>
      <div class="info">
        <div class="info-label">تاريخ الإصدار</div>
        <div class="info-value">${new Date(certificate.issuedAt).toLocaleDateString('ar-EG')}</div>
      </div>
      <div class="info">
        <div class="info-label">رمز التحقق</div>
        <div class="info-value">${certificate.verificationCode}</div>
      </div>
    </div>
    
    <div class="verification">
      تحقق من صحة الشهادة على: pharmpro-academy.com/verify/${certificate.verificationCode}
    </div>
  </div>
</body>
</html>
    `;
    
    return html;
  },
  
  // Download certificate
  downloadCertificate(certificateId) {
    const html = this.generateCertificateHTML(certificateId);
    
    if (!html) {
      return false;
    }
    
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `certificate_${certificateId}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    return true;
  },
  
  // Get certificate statistics
  getCertificateStats() {
    const total = this.certificates.length;
    const active = this.certificates.filter(c => c.status === 'active').length;
    const expired = this.certificates.filter(c => 
      c.expiresAt && new Date(c.expiresAt) < new Date()
    ).length;
    const revoked = this.certificates.filter(c => c.status === 'revoked').length;
    
    return {
      total: total,
      active: active,
      expired: expired,
      revoked: revoked,
      byTemplate: this.getCertificatesByTemplate()
    };
  },
  
  getCertificatesByTemplate() {
    const byTemplate = {};
    
    Object.keys(this.certificateTemplates).forEach(templateId => {
      byTemplate[templateId] = this.certificates.filter(c => c.templateId === templateId).length;
    });
    
    return byTemplate;
  }
};

// Initialize certification system on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  CertificationSystem.init();
});

// Export for global access
window.CertificationSystem = CertificationSystem;
