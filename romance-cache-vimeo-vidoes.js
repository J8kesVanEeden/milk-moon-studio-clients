const CACHE_NAME = 'vimeo-videos-cache';
const MAX_AGE_SECONDS = 86400; // 24 hours in seconds

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(getVimeoVideoUrls());
    })
  );
});

self.addEventListener('fetch', event => {
  const requestUrl = new URL(event.request.url);

  // Only cache Vimeo video URLs
  if (requestUrl.hostname === 'player.vimeo.com') {
    event.respondWith(
      caches.match(event.request).then(response => {
        if (response) {
          // Return cached response if available
          return response;
        } else {
          // Fetch and cache new response
          return fetch(event.request).then(response => {
            // Cache the response for future requests
            const clonedResponse = response.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, clonedResponse);
            });

            // Return the response to the original request
            return response;
          });
        }
      })
    );
  }
});

// Helper function to get all Vimeo video URLs on the page
function getVimeoVideoUrls() {
  const urls = [];
  const videos = document.querySelectorAll('iframe[src*="player.vimeo.com"]');
  videos.forEach(video => {
    const url = new URL(video.src);
    urls.push(url.toString());
  });
  return urls;
}
