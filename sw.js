const CACHE_NAME = 'pharmapro-v2';
const urlsToCache = [
  '/Pharma-GMP-/',
  
'Pharma-GMP-/admin.html',  'Pharma-GMP-/calculators.html',  'Pharma-GMP-/case-studies.html',  'Pharma-GMP-/course-advanced-validation.html',  'Pharma-GMP-/course-capa.html',  'Pharma-GMP-/course-gmp-basics.html',  'Pharma-GMP-/course-ipqc.html',  'Pharma-GMP-/course-iso-9001.html',  'Pharma-GMP-/course-player.html',  'Pharma-GMP-/course-qc-lab.html',  'Pharma-GMP-/course-validation.html',  'Pharma-GMP-/courses.html',  'Pharma-GMP-/dashboard.html',  'Pharma-GMP-/dictionary.html',  'Pharma-GMP-/firebase.json',  'Pharma-GMP-/forums.html',  'Pharma-GMP-/index.html',  'Pharma-GMP-/manifest.json',  'Pharma-GMP-/pharma-landing.html',  'Pharma-GMP-/quick-reference.html',  'Pharma-GMP-/quiz-page.html',  'Pharma-GMP-/resources.html',  'Pharma-GMP-/simulation.html',  'Pharma-GMP-/sitemap.html',  'Pharma-GMP-/templates.html',  'Pharma-GMP-/videos.json',  'Pharma-GMP-/visual-library.html',
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => response || fetch(event.request))
  );
});
