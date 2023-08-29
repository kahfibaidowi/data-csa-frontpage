const cacheName='map_data';

self.addEventListener('fetch', function(event) {
   // Check if this is a navigation request
   if (event.request.mode === 'navigate') {
      // Open the cache
      event.respondWith(caches.open(cacheName).then((cache) => {
      // Go to the network first
      return fetch(event.request.url).then((fetchedResponse) => {
         cache.put(event.request, fetchedResponse.clone());

         return fetchedResponse;
      }).catch(() => {
         // If the network is unavailable, get
         return cache.match(event.request.url);
      });
      }));
   } else {
      return;
   }
});


//update service worker
self.addEventListener("install", (e)=>{
   self.skipWaiting()
   console.log("updated service worker installed")
});
self.addEventListener("activate", (e)=>{
   console.log("updated service worker activated")
});