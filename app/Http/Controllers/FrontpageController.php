<?php
namespace App\Http\Controllers;

use App\Http\Requests\StorePostRequest;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\Request;
use Inertia\Inertia;

class FrontpageController extends Controller
{
    public function index(){
        return view('pages/homepage', []);
    }

    public function peringatan_dini()
    {
        return Inertia::render('PeringatanDini', []);
    }

    public function jadwal_tanam()
    {
        return Inertia::render('JadwalTanam', []);
    }
}