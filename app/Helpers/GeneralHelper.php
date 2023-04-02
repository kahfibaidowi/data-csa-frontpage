<?php

function cut_post($content){
    $dot=strlen(strip_tags($content))>100?" ...":"";
    return substr(strip_tags($content), 0, 100).$dot;
}
function get_posts_page_link($page){
    if($page==1){
        return "/posts";
    }
    else{
        return "/posts/page/".$page;
    }
}
function slugify($text, string $divider='-'){
    // replace non letter or digits by divider
    $text=preg_replace('~[^\pL\d]+~u', $divider, $text);

    // transliterate
    $text=iconv('utf-8', 'us-ascii//TRANSLIT', $text);

    // remove unwanted characters
    $text=preg_replace('~[^-\w]+~', '', $text);

    // trim
    $text=trim($text, $divider);

    // remove duplicate divider
    $text=preg_replace('~-+~', $divider, $text);

    // lowercase
    $text=strtolower($text);

    if(empty($text)){
        return 'n-a';
    }

    return $text;
}
function excerpt_name($name){
    $words = explode(" ", $name);
    $acronym = "";

    foreach ($words as $w) {
    $acronym .= mb_substr($w, 0, 1);
    }

    return substr($acronym, 0, 2);
}
function tgl_jam_format($tanggal){
    $bulan=[
        'Januari',
        'Februari',
        'Maret',
        'April',
        'Mei',
        'Juni',
        'Juli',
        'Agustus',
        'September',
        'Oktober',
        'November',
        'Desember'
    ];
    
    $pecahkan=explode(' ', $tanggal);
    $jam=explode(":", $pecahkan[1]);
    $tgl=explode("-", $pecahkan[0]);
        
    return $tgl[2].' '.$bulan[(int)$tgl[1]-1].' '.$tgl[0].", at ".$jam[0].":".$jam[1];

}