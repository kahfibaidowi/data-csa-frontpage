        <div id="footer" class="mt-auto">
            <div class="container">
                <footer class="pt-5">
                    <div class="row">
                        <div class="col-md-4 mb-3">
                            @if ($footer['about']['show_title'])
                                <h4 class='fw-semibold mb-3'>{{$footer['about']['title']}}</h4>
                            @endif

                            @if ($pengaturan['logo']!="")
                                <img src="{{env("EWS_API")}}/storage/{{$pengaturan['logo']}}" style="max-height:35px"/>
                            @else
                                <span class="text-success fw-semibold fs-3">{{$pengaturan['title']}}</span>
                            @endif

                            <p class='mt-3 text-secondary'>{{$footer['about']['content']}}</p>
                        </div>
                        @if(count($footer['menu']['data'])>0)
                            <div class="col-md-3 mb-3">
                                <h4 class='fw-semibold mb-3'>{{$footer['menu']['title']}}</h4>
                                <ul class="nav flex-column">
                                    @foreach ($footer['menu']['data'] as $val)
                                        <li class="nav-item mb-2"><a href="{{$val['link_to']}}" class="nav-link p-0 text-secondary">{{$val['text']}}</a></li>
                                    @endforeach
                                </ul>
                            </div>
                        @endif
                        @if (count($footer['partner']['data'])>0)
                            <div class='col-md-5 mb-3'>
                                <h4 class='fw-semibold mb-3'>{{$footer['partner']['title']}}</h4>
                                <div class='d-flex flex-wrap'>
                                    @foreach ($footer['partner']['data'] as $val)
                                        <a href={{$val['link_to']}} class='me-2 mb-2'>
                                            <img
                                                src="{{env("EWS_API")}}/storage/{{$val['gambar']}}"
                                                class="bd-placeholder-img"
                                                style="
                                                    height:75px
                                                "
                                            />
                                        </a>
                                    @endforeach
                                </div>
                            </div>
                        @endif
                    </div>

                    <div class="d-flex flex-column flex-sm-row justify-content-between py-3 border-top">
                        <p>&copy; 2023 {{$pengaturan['company']}}. All rights reserved.</p>
                    </div>
                </footer>
            </div>
        </div>

    </div>

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

    <!-- SCRIPTS -->
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
