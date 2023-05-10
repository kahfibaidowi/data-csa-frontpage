<?php
namespace App\Http\Controllers;

use Illuminate\Pagination\Paginator;
use App\Http\Requests\StorePostRequest;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\Request;
use Inertia\Inertia;
use App\Models\FrontpageModel;
use App\Library\HeadLibrary;
use App\Models\SebaranOptModel;

class FrontpageController extends Controller
{
    public function index(){
        //--headline
        $headline=FrontpageModel::where("type", "headline_carousel")->first();
        if(is_null($headline)){
            $headline=[];
        }
        else{
            $headline=$headline['data'];
        }

        //--feature column
        $feature_column=FrontpageModel::where("type", "feature_column")->first();
        if(is_null($feature_column)){
            $feature_column=[
                'title' =>"",
                'sub_title' =>"",
                'data'  =>[]
            ];
        }
        else{
            $feature_column=$feature_column['data'];
        }

        //-feature row
        $feature_row=FrontpageModel::where("type", "feature_row")->first();
        if(is_null($feature_row)){
            $feature_row=[];
        }
        else{
            $feature_row=$feature_row['data'];
        }

        //--3 posts new
        $posts=FrontpageModel::
            where("type", "post")
            ->orderByDesc("id_frontpage")
            ->limit(3)
            ->get();

        //--globals
        $pengaturan=$this->data_pengaturan();
        $footer=$this->data_footer();

        //return
        //--meta
        HeadLibrary::addTag("<title>".$pengaturan['title']."</title>");
        HeadLibrary::addTag("<meta name='title' content='".$pengaturan['title']."'/>");
        HeadLibrary::addTag("<meta name='description' content='".$pengaturan['description']."'/>");
        HeadLibrary::addTag("<meta name='keyword' content='".$pengaturan['title']."'/>");
        HeadLibrary::addTag("<meta name='robots' content='index, follow'/>");

        //--meta facebook
        HeadLibrary::addTag("<meta property='og:type' content='website'/>");
        HeadLibrary::addTag("<meta property='og:url' content='".Request::url()."'/>");
        HeadLibrary::addTag("<meta property='og:title' content='".$pengaturan['title']."'/>");
        HeadLibrary::addTag("<meta property='og:description' content='".$pengaturan['description']."'/>");
        
        //--meta twitter
        HeadLibrary::addTag("<meta property='twitter:card' content='summary_large_image'/>");
        HeadLibrary::addTag("<meta property='twitter:url' content='".Request::url()."'/>");
        HeadLibrary::addTag("<meta property='twitter:title' content='".$pengaturan['title']."'/>");
        HeadLibrary::addTag("<meta property='twitter:description' content='".$pengaturan['description']."'/>");

        //--render
        return view('pages/homepage', [
            'headline'      =>$headline,
            'feature_column'=>$feature_column,
            'feature_row'   =>$feature_row,
            'posts_new'     =>$posts,
            'footer'        =>$footer,
            'pengaturan'    =>$pengaturan
        ]);
    }

    public function sebaran_opt()
    {
        $pengaturan=$this->data_pengaturan();
        $footer=$this->data_footer();

        //--meta
        HeadLibrary::addTag("<title>Sebaran OPT - ".$pengaturan['title']."</title>");
        HeadLibrary::addTag("<meta name='robots' content='noindex, nofollow'/>");

        //--render
        return Inertia::render('SebaranOpt', [
            'footer'        =>$footer,
            'pengaturan'    =>$pengaturan
        ]);
    }

    public function peringatan_dini()
    {
        $pengaturan=$this->data_pengaturan();
        $footer=$this->data_footer();

        //--meta
        HeadLibrary::addTag("<title>Peringatan Dini - ".$pengaturan['title']."</title>");
        HeadLibrary::addTag("<meta name='robots' content='noindex, nofollow'/>");

        //--render
        return Inertia::render('PeringatanDini', [
            'footer'        =>$footer,
            'pengaturan'    =>$pengaturan
        ]);
    }
    
    public function peringatan_dini_banjir()
    {
        $pengaturan=$this->data_pengaturan();
        $footer=$this->data_footer();

        //--meta
        HeadLibrary::addTag("<title>Peringatan Dini Banjir - ".$pengaturan['title']."</title>");
        HeadLibrary::addTag("<meta name='robots' content='noindex, nofollow'/>");

        //--render
        return Inertia::render('PeringatanDiniBanjir', [
            'footer'        =>$footer,
            'pengaturan'    =>$pengaturan
        ]);
    }
    
    public function peringatan_dini_kekeringan()
    {
        $pengaturan=$this->data_pengaturan();
        $footer=$this->data_footer();

        //--meta
        HeadLibrary::addTag("<title>Peringatan Dini Kekeringan - ".$pengaturan['title']."</title>");
        HeadLibrary::addTag("<meta name='robots' content='noindex, nofollow'/>");

        //--render
        return Inertia::render('PeringatanDiniKekeringan', [
            'footer'        =>$footer,
            'pengaturan'    =>$pengaturan
        ]);
    }

    public function jadwal_tanam()
    {
        $pengaturan=$this->data_pengaturan();
        $footer=$this->data_footer();

        //--meta
        HeadLibrary::addTag("<title>Jadwal Tanam - ".$pengaturan['title']."</title>");
        HeadLibrary::addTag("<meta name='robots' content='noindex, nofollow'/>");

        //--render
        return Inertia::render('JadwalTanam', [
            'footer'        =>$footer,
            'pengaturan'    =>$pengaturan
        ]);
    }

    public function info_grafis()
    {
        $pengaturan=$this->data_pengaturan();
        $footer=$this->data_footer();

        //--meta
        HeadLibrary::addTag("<title>Info Grafis - ".$pengaturan['title']."</title>");
        HeadLibrary::addTag("<meta name='robots' content='noindex, nofollow'/>");

        //--render
        return Inertia::render('InfoGrafis', [
            'footer'        =>$footer,
            'pengaturan'    =>$pengaturan
        ]);
    }

    public function posts($page=1)
    {
        $page=isset($page)?$page:1;
        $per_page=9;

        $count_posts=FrontpageModel::where("type", "post")->get()->count();
        $posts=FrontpageModel::where("type", "post")
            ->orderByDesc("id_frontpage")
            ->limit($per_page)
            ->offset($per_page*($page-1))
            ->get()
            ->toArray();

        //--globals
        $pengaturan=$this->data_pengaturan();
        $footer=$this->data_footer();

        //return
        //--meta
        HeadLibrary::addTag("<title>Semua Post ".$page." - ".$pengaturan['title']."</title>");
        HeadLibrary::addTag("<meta name='title' content='".$pengaturan['title']."'/>");
        HeadLibrary::addTag("<meta name='description' content=''/>");
        HeadLibrary::addTag("<meta name='keyword' content='Semua Post ".$page." - ".$pengaturan['title']."'/>");
        HeadLibrary::addTag("<meta name='robots' content='index, follow'/>");

        //--meta facebook
        HeadLibrary::addTag("<meta property='og:type' content='website'/>");
        HeadLibrary::addTag("<meta property='og:url' content='".Request::url()."'/>");
        HeadLibrary::addTag("<meta property='og:title' content='Semua Post ".$page." - ".$pengaturan['title']."'/>");
        HeadLibrary::addTag("<meta property='og:description' content=''/>");
        
        //--meta twitter
        HeadLibrary::addTag("<meta property='twitter:card' content='summary_large_image'/>");
        HeadLibrary::addTag("<meta property='twitter:url' content='".Request::url()."'/>");
        HeadLibrary::addTag("<meta property='twitter:title' content='Semua Post ".$page." - ".$pengaturan['title']."'/>");
        HeadLibrary::addTag("<meta property='twitter:description' content=''/>");

        //--render
        return view('pages/posts', [
            'page'  =>$page,
            'count_page'=>ceil($count_posts/$per_page),
            'data'  =>$posts,
            'footer'        =>$footer,
            'pengaturan'    =>$pengaturan
        ]);
    }
    
    public function post($id, $title="")
    {
        $post=FrontpageModel::with("user")->where("type", "post")->where("id_frontpage", $id)->first();

        //--globals
        $pengaturan=$this->data_pengaturan();
        $footer=$this->data_footer();

        //return
        //--meta
        HeadLibrary::addTag("<title>".$post['data']['title']." - ".$pengaturan['title']."</title>");
        HeadLibrary::addTag("<meta name='title' content='".$pengaturan['title']."'/>");
        HeadLibrary::addTag("<meta name='description' content='".cut_post($post['data']['content'])."'/>");
        HeadLibrary::addTag("<meta name='keyword' content='".$post['data']['title']." - ".$pengaturan['title']."'/>");
        HeadLibrary::addTag("<meta name='robots' content='index, follow'/>");

        //--meta facebook
        HeadLibrary::addTag("<meta property='og:type' content='website'/>");
        HeadLibrary::addTag("<meta property='og:url' content='".Request::url()."'/>");
        HeadLibrary::addTag("<meta property='og:title' content='".$post['data']['title']." - ".$pengaturan['title']."'/>");
        HeadLibrary::addTag("<meta property='og:description' content='".cut_post($post['data']['content'])."'/>");
        HeadLibrary::addTag("<meta property='og:image' content='".env("EWS_API")."/storage/".$post['data']['featured_image']."'/>");
        
        //--meta twitter
        HeadLibrary::addTag("<meta property='twitter:card' content='summary_large_image'/>");
        HeadLibrary::addTag("<meta property='twitter:url' content='".Request::url()."'/>");
        HeadLibrary::addTag("<meta property='twitter:title' content='".$post['data']['title']." - ".$pengaturan['title']."'/>");
        HeadLibrary::addTag("<meta property='twitter:description' content='".cut_post($post['data']['content'])."'/>");
        HeadLibrary::addTag("<meta property='twitter:image' content='".env("EWS_API")."/storage/".$post['data']['featured_image']."'/>");

        //--render
        return view('pages/post', [
            'data'  =>$post,
            'footer'        =>$footer,
            'pengaturan'    =>$pengaturan
        ]);
    }

    private function data_pengaturan()
    {
        //--pengaturan
        $pengaturan=FrontpageModel::where("type", "pengaturan")->first();
        if(is_null($pengaturan)){
            $pengaturan=[
                'title' =>"",
                'logo'  =>"",
                'company'=>"",
                'description'=>""
            ];
        }
        else{
            $pengaturan=$pengaturan['data'];
        }

        return $pengaturan;
    }

    private function data_footer()
    {
        //--about
        $about=FrontpageModel::where("type", "footer_about")->first();
        if(is_null($about)){
            $about=[
                'title' =>"",
                'show_title'=>false,
                'content'   =>""
            ];
        }
        else{
            $about=$about['data'];
        }

        //--menu
        $menu=FrontpageModel::where("type", "footer_menu")->first();
        if(is_null($menu)){
            $menu=[
                'title' =>"",
                'data'  =>[]
            ];
        }
        else{
            $menu=$menu['data'];
        }
        
        //--partner
        $partner=FrontpageModel::where("type", "footer_partner")->first();
        if(is_null($partner)){
            $partner=[
                'title' =>"",
                'data'  =>[]
            ];
        }
        else{
            $partner=$partner['data'];
        }

        return [
            'about' =>$about,
            'menu'  =>$menu,
            'partner'=>$partner
        ];
    }
}