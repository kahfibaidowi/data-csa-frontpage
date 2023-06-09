<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        {!!\App\Library\HeadLibrary::render()!!}

        <link rel="manifest" href="/manifest.json" />
        <!-- Fonts -->
        <link
            href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;1,100;1,200;1,300;1,400;1,500;1,600;1,700&display=swap"
            rel="stylesheet"
        />
        <link 
            href="/styles/light/style.min.css"
            rel="stylesheet"
        />
        <link 
            href="/styles/ReactToastify.css"
            rel="stylesheet"
        />
        <link 
            href="/styles/react-data-grid.css"
            rel="stylesheet"
        />
        <link 
            href="/styles/leaflet.css"
            rel="stylesheet"
        />
        <link 
            href="/styles/globals.css"
            rel="stylesheet"
        />

        <!-- Scripts -->
        @routes
        @viteReactRefresh
        @vite(['resources/js/app.jsx', "resources/js/Pages/{$page['component']}.jsx"])
        @inertiaHead
    </head>
    <body class="font-sans antialiased">
        @inertia
        <script>
            if("serviceWorker" in navigator) {
                navigator.serviceWorker.register("/service_worker.js")
                .then(
                    function(registration){
                        console.log("Service Worker registration successful with scope: ", registration.scope)
                    },
                    function(err){
                        console.log("Service Worker registration failed: ", err)
                    }
                )
            }
        </script>
    </body>
</html>
