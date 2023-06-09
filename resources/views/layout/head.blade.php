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
            href="/styles/globals.css"
            rel="stylesheet"
        />
    </head>
    <body>
        <div class="d-flex flex-column" style="min-height: 100vh">
            <div class="navbar navbar-expand-lg" style="left:0; top:0; width:100%; z-index:99999999; height:auto">
                <div class="container d-flex">
                    <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#nav-collapse" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                        <span class="navbar-toggler-icon"></span>
                    </button>
                  
                    <a href="/" class="navbar-brand me-auto ms-3 ms-lg-0">
                        @if ($pengaturan['logo']!="")
                            <img src="{{env("EWS_API")}}/storage/{{$pengaturan['logo']}}" style="max-height:35px"/>
                        @else
                            <span class="text-success">{{$pengaturan['title']}}</span>
                        @endif
                    </a>
                    <a href="https://ews.tifpsdku.com/dashboard/login" class="btn btn-success rounded-pill order-lg-1">
                        Login Admin
                    </a>
                    <div class="collapse navbar-collapse" id="nav-collapse">
                        <ul class="navbar-nav mx-auto mt-2 mt-lg-0">
                            <li class="nav-item">
                                <a class="nav-link link-dark fs-15px fw-medium" href="/">Dashboard</a>
                            </li>
                            <li class="nav-item dropdown">
                                <a class="nav-link link-dark fs-15px fw-medium dropdown-toggle" href="#" id="navbarDropdown" role="button" data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                  Sebaran OPT
                                  <svg stroke="currentColor" fill="none" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" class="ms-1" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><polyline points="6 9 12 15 18 9"></polyline></svg>
                                </a>
                                <div class="dropdown-menu" aria-labelledby="navbarDropdown">
                                    <a class="dropdown-item fs-14px" href="/sebaran_opt">Data Sebaran</a>
                                    <a class="dropdown-item fs-14px" href="/sebaran_opt/peta">Peta Sebaran</a>
                                </div>
                            </li>
                            <li class="nav-item">
                                <a class="nav-link link-dark fs-15px fw-medium" href="/info_grafis">Infografis</a>
                            </li>
                            <li class="nav-item dropdown">
                                <a class="nav-link link-dark fs-15px fw-medium dropdown-toggle" href="#" id="navbarDropdown" role="button" data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                  Peringatan Dini
                                  <svg stroke="currentColor" fill="none" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" class="ms-1" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><polyline points="6 9 12 15 18 9"></polyline></svg>
                                </a>
                                <div class="dropdown-menu" aria-labelledby="navbarDropdown">
                                    <a class="dropdown-item fs-14px" href="/peringatan_dini/banjir">Banjir</a>
                                    <a class="dropdown-item fs-14px" href="/peringatan_dini/kekeringan">Kekeringan</a>
                                    <a class="dropdown-item fs-14px" href="#">Sebaran OPT</a>
                                </div>
                            </li>
                            <li class="nav-item dropdown">
                                <a class="nav-link link-dark fs-15px fw-medium dropdown-toggle" href="#" id="navbarDropdown" role="button" data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                  Jadwal Tanam
                                  <svg stroke="currentColor" fill="none" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" class="ms-1" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><polyline points="6 9 12 15 18 9"></polyline></svg>
                                </a>
                                <div class="dropdown-menu" aria-labelledby="navbarDropdown">
                                    <a class="dropdown-item fs-14px" href="/jadwal_tanam">Jadwal Tanam Tabular</a>
                                    <a class="dropdown-item fs-14px" href="/jadwal_tanam/cabai_besar">Peta Cabai Besar</a>
                                    <a class="dropdown-item fs-14px" href="/jadwal_tanam/cabai_rawit">Peta Cabai Rawit</a>
                                    <a class="dropdown-item fs-14px" href="/jadwal_tanam/bawang_merah">Peta Bawang Merah</a>
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>