<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        <title>{{ config('app.name', '') }}</title>

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
        <div class="navbar navbar-expand-lg" style="left:0; top:0; width:100%; z-index:99999999; height:auto">
            <div class="container d-flex">
                <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#nav-collapse" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                    <span class="navbar-toggler-icon"></span>
                </button>
              
                <a href="#" class="navbar-brand me-auto ms-3 ms-lg-0">
                    <span class="text-primary">EWS</span>
                </a>
                <a href="/login" class="btn btn-primary rounded-pill order-lg-1">
                    Login Admin
                </a>
                <div class="collapse navbar-collapse" id="nav-collapse">
                    <ul class="navbar-nav mx-auto mt-2 mt-lg-0">
                        <li class="nav-item">
                            <a class="nav-link link-dark fs-15px fw-medium" href="/">Dashboard</a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link link-dark fs-15px fw-medium" href="/peringatan_dini">Peringatan Dini</a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link link-dark fs-15px fw-medium" href="#">Opt Utama</a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link link-dark fs-15px fw-medium" href="#">Jadwal Tanam</a>
                        </li>
                    </ul>
                </div>
            </div>
        </div>