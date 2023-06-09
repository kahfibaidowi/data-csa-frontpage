self.addEventListener('fetch', function(event) {
    event.respondWith(
          caches.match(event.request)
          .then(function(response){
               return response || fetch(event.request);
          })
    );
});


//update service worker
self.addEventListener("install", (e)=>{
   self.skipWaiting()
   console.log("updated service worker installed")
});
self.addEventListener("activate", (e)=>{
   console.log("updated service worker activated")
});