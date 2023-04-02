@include('layout.head')

<div id="post-detail" class='mb-5' style="margin-top:100px">
    <div class='container'>
        <div class='row'>
            <div class='col-md-8 mx-auto d-flex flex-column align-items-start'>
                <div class='text-secondary mb-2'>
                    <span class='me-2'>in</span>
                    @if(count($data['data']['kategori'])>0)
                        @foreach($data['data']['kategori'] as $k)
                            <a href="/"  class='blog-post-category me-2'>
                                {{$k}}
                            </a>
                        @endforeach
                    @else
                        <a href="/"  class='blog-post-category me-2'>
                            Uncategories
                        </a>
                    @endif
                </div>
                <h2 class='fw-semibold text-start text-md-center'>{{$data['data']['title']}}</h2>
                <div class='d-flex align-items-center mt-4'>
                    <span class="text-secondary">{{tgl_jam_format($data['created_at'])}}</span>
                    <span class='d-flex align-items-center ms-3'>
                        <span class='avatar me-2'>
                            @if($data['user']['avatar_url']=="")
                                <span>{{excerpt_name($data['user']['nama_lengkap'])}}</span>
                            @else
                                <img
                                    src="{{env("EWS_API")}}/storage/{{$data['user']['avatar_url']}}"
                                />
                            @endif
                        </span>
                        <span class='fw-semibold'>{{$data['user']['nama_lengkap']}}</span>
                    </span>
                </div>
            </div>
        </div>
        <div class='row mt-2'>
            <div class='col-12'>
                <div class='blog-post-featured-image overflow-hidden'>
                    <img
                        src="{{env("EWS_API")}}/storage/{{$data['data']['featured_image']}}"
                        class="img-fluid"
                    />
                </div>
            </div>
        </div>
        <div class='row mt-5'>
            <div class='col-md-8 mx-auto'>
                <article class='post-content fs-15px'>
                    {!!$data['data']['content']!!}
                </article>
            </div>
        </div>
    </div>
</div>

@include('layout.foot')