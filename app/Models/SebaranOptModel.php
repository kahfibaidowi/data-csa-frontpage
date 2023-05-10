<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;


class SebaranOptModel extends Model{

    protected $table="tbl_sebaran_opt";
    protected $primaryKey="id_sebaran_opt";
    protected $fillable=[
        "bulan",
        "tahun",
        "provinsi",
        "kab_kota",
        "komoditas",
        "opt",
        "lts_ringan",
        "lts_sedang",
        "lts_berat",
        "sum_lts",
        "lts_puso"
    ];
    protected $perPage=99999999999999999999;


    /*
     *#FUNCTION
     *
     */
}
