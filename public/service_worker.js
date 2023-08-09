const cacheName='map_data';

self.addEventListener('fetch', function(event) {
   //  event.respondWith(
   //       //  caches.match(event.request)
   //       //  .then(function(response){
   //       //       return response || fetch(event.request);
   //       //  })
   //       fetch(event.request)
   //  );

   const url="http://localhost/data-csa/public/frontpage/summary/type/curah_hujan_kecamatan"
   const match_url=event.request.url.indexOf(url)

   if(match_url==0){
      // event.respondWith(caches.open(cacheName).then((cache) => {
      //    // Go to the cache first
         
      //    return cache.match(event.request.url).then((cachedResponse) => {
      //       // Return a cached response if we have one
      //       if (cachedResponse) {
      //          return cachedResponse;
      //       }
   
      //       // Otherwise, hit the network
      //       return fetch(event.request).then((fetchedResponse) => {
      //          // Add the network response to the cache for later visits
      //          cache.put(event.request, fetchedResponse.clone());
   
      //          // Return the network response
      //          return fetchedResponse;
      //       });
      //    });
      // })); 
      
      // event.respondWith(
      //    caches.match(event.request).then(cachedResponse => {
      //       const networkFetch = fetch(event.request).then(response => {
      //          // update the cache with a clone of the network response
      //          const responseClone = response.clone()
      //          caches.open(cacheName).then(cache => {
      //             cache.put(event.request, responseClone)
      //          })
      //          return response
      //       }).catch(function (reason) {
      //          console.error('ServiceWorker fetch failed: ', reason)
      //       })
      //       // prioritize cached response over network
      //       return cachedResponse || networkFetch
      //       }
      //    )
      // )  
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