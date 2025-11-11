self.addEventListener('install', e => 
  e.waitUntil(caches.open('emdr-cache').then(c => 
    c.addAll([
      './',
      './index.html',
      './style.css',
      './script.js',
      './manifest.json',
      './safe_heartbeat.wav',
      './mountains.png',
      './forest.png',
      './water.png'
    ])
  ))
);

self.addEventListener('fetch', e => 
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)))
);
