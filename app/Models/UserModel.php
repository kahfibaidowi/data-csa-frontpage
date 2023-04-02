<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;


class UserModel extends Model{

    protected $table="tbl_users";
    protected $primaryKey="id_user";
    protected $fillable=[
        "username",
        "password",
        "nama_lengkap",
        "role",
        "avatar_url",
        "status"
    ];
    protected $hidden=['password'];
    protected $perPage=99999999999999999999;


    /*
     *#FUNCTION
     *
     */
}
