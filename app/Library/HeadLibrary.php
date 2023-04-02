<?php
namespace App\Library;

class HeadLibrary
{
    protected static $tag=[];

    public static function addTag($content)
    {
        static::$tag[]=$content;
    }

    public static function render()
    {
        $html='';
        foreach (static::$tag as $content) {
            $html.=$content;
        }
        
        return $html;
    }
}