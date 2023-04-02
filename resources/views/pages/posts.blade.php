@include('layout.head')


<!-- POSTS -->
<div id="column-post" class='d-block' style="margin-top:80px; margin-bottom:80px">
    <div class='container'>
        <div class='d-flex mb-4'>
            <div class="pricing-header p-3 pb-md-4 mx-auto text-center">
                <h2 class="block-title fw-semibold text-success">Informasi Terbaru</h2>
                <p class="fs-5 text-secondary">Artikel Terbaru Dari Kami.</p>
            </div>
        </div>
        <div class="row mb-4">
            @foreach($data as $pn)
                <div class='col-10 col-md-4 mb-4'>
                    <div class="card border-0 rounded-4 overflow-hidden">
                        <div class='blog-img rounded'>
                            <img
                                src="{{env("EWS_API")}}/storage/{{$pn['data']['featured_image']}}"
                                class="img-fluid"
                            />
                        </div>
                        <div class="card-body border-0">
                            <h4 class='fw-semibold post-title text-dark'>
                                <a 
                                    class='link-dark text-decoration-none' 
                                    href="/post/{{$pn['id_frontpage']}}/{{slugify($pn['data']['title'])}}"
                                >
                                    {{$pn['data']['title']}}
                                </a>
                            </h4>
                            <p class='text-secondary mt-2'>{{cut_post($pn['data']['content'])}}</p>
                        </div>
                    </div>
                </div>
            @endforeach
        </div>
        <div class='d-flex align-items-center justify-content-center'>
            <ul class="pagination pagination-rounded">
                <li class="page-item {{$page==1?"disabled":""}}"><a class="page-link" href="{{get_posts_page_link($page-1)}}">SeBelumnya</a></li>
                <li class="page-item {{$page==$count_page?"disabled":""}}"><a class="page-link" href="{{get_posts_page_link($page+1)}}">Selanjutnya</a></li>
            </ul>
        </div>
    </div>
</div>

@include('layout.foot')