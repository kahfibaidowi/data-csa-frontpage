<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;


class FrontpageModel extends Model{

    protected $table="tbl_frontpage";
    protected $primaryKey="id_frontpage";
    protected $fillable=[
        "id_user",
        "type",
        "data"
    ];
    protected $casts=[
        "data"  =>"array"
    ];
    protected $perPage=99999999999999999999;


    /*
     *#FUNCTION
     *
     */
    public function user(){
        return $this->belongsTo(UserModel::class, "id_user");
    }
}
