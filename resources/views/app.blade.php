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

        <!-- A2HS INTERFACE NOTIFICATION -->
        <div class="offcanvas offcanvas-bottom" tabindex="-1" id="notif_a2hs" aria-labelledby="offcanvasBottomLabel" style="height:auto">
            <div class="offcanvas-body small">
                <div class="col-md-10 full-content mx-auto d-flex h-100 py-4">
                    <div class="d-flex align-items-center w-100 justify-content-between full-content">
                        <h3 class="mb-0 me-4 fw-semibold">Install Aplikasi ewssipantara.id di Perangkat Anda!</h3>
                        <div class="d-flex flex-column flex-column flex-sm-row" style="min-width:120px">
                            <button 
                                class="btn btn-outline-secondary btn-lg text-decoration-none fw-bold me-0 me-sm-2"
                                onClick="noInstall()"
                            >
                                Jangan Install
                            </button>
                            <button 
                                class="btn btn-primary btn-lg fw-bold mt-2 mt-sm-0"
                                onClick="showAddToHomeScreen()"
                            >
                                Install Aplikasi
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <script src="/scripts/bootstrap.bundle.js"></script>
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

            //A2HS INSTALL NOTIFICATION
            const bsOffcanvas=new bootstrap.Offcanvas('#notif_a2hs')
            const date=new Date()
            let deffered_prompt=""

            function fireAddToHomeScreenImpression(e){
                e.preventDefault()

                deffered_prompt=e

                let storage=localStorage.getItem("install_prompt_expired")

                if(storage===null){
                    bsOffcanvas.show()
                }
                else{
                    if(Number(storage)<date.getTime()){
                        bsOffcanvas.show()
                    }
                }
            }

            async function showAddToHomeScreen(){
                deffered_prompt.prompt()
                let outcome=await deffered_prompt.userChoice
                
                if(outcome==='accepted'){
                    bsOffcanvas.hide()
                    console.log('User accepted the A2HS prompt')
                }
                else{
                    console.log('User dismissed the A2HS prompt')
                }
            }

            function noInstall(){
                localStorage.setItem("install_prompt_expired", date.getTime()+(24*3600*7*1000))
                bsOffcanvas.hide()
            }

            window.addEventListener("beforeinstallprompt", fireAddToHomeScreenImpression)
        </script>
    </body>
</html>
