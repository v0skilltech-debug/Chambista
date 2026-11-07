// Chambista Service Worker — Cache-first para assets estáticos, network-first para API
const CACHE_NAME = 'chambista-v1'
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/5447b5d0-2e72-43c0-bb40-a545a174aec4-removebg-preview.png',
  '/providers/electricista.png',
  '/providers/plomero.png',
  '/providers/carpintero.png',
  '/providers/pintor.png',
  '/providers/tecnico.png',
  '/providers/limpieza.png',
]

// Install: pre-cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  )
  self.skipWaiting()
})

// Activate: clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  )
  self.clients.claim()
})

// Fetch: network-first for HTML pages and APIs, cache-first for static assets
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  if (request.method !== 'GET') {
    return
  }

  // Network-first for HTML page navigations and API calls
  if (request.mode === 'navigate' || url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request).catch(() => caches.match(request))
    )
    return
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached
      return fetch(request).then((response) => {
        // Cache successful static responses
        if (response.ok && (url.origin === self.location.origin || request.destination === 'image')) {
          const clone = response.clone()
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone))
        }
        return response
      })
    })
  )
})
