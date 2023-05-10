<?php

use App\Http\Controllers\FrontpageController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

Route::get('/', [FrontpageController::class, "index"]);
Route::get('/peringatan_dini', [FrontpageController::class, "peringatan_dini"]);
Route::get('/peringatan_dini/banjir', [FrontpageController::class, "peringatan_dini_banjir"]);
Route::get('/peringatan_dini/kekeringan', [FrontpageController::class, "peringatan_dini_kekeringan"]);
Route::get('/jadwal_tanam', [FrontpageController::class, "jadwal_tanam"]);
Route::get('/info_grafis', [FrontpageController::class, "info_grafis"]);
Route::get('/posts', [FrontpageController::class, "posts"]);
Route::get('/posts/page/{page}', [FrontpageController::class, "posts"]);
Route::get('/post/{id}/{title}', [FrontpageController::class, "post"]);
Route::get('/sebaran_opt', [FrontpageController::class, "sebaran_opt"]);