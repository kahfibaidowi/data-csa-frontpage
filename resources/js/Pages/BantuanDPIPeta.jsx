import { Layout } from "@/Components/layout"
import update from "immutability-helper"
import { api, api_express } from "@/Config/api"
import _ from "underscore"
import axios from "axios"
import React from "react"
import L, { latLng, vectorGrid } from "leaflet"
import "leaflet.vectorgrid"
import MapWindy from "@/Components/Modules/map_windy_banjir"
import { BASE_URL, BASE_URL_XP, isUndefined } from "@/Config/config"
import { Head } from "@inertiajs/react"
import { toast, ToastContainer } from "react-toastify"
import { FiBarChart2, FiChevronDown, FiCloudRain, FiFilter, FiHome, FiMenu, FiWind } from "react-icons/fi"
import * as turf from '@turf/turf'
import { ceil, centroid, ch_from_properties, ch_normal_from_properties, explode_ch_generated, explode_ch_normal_generated, month_selected, numFix } from "@/Config/helpers"
import { Collapse, Modal, Offcanvas } from "react-bootstrap"
import classNames from "classnames"
import MenuSidebar from "@/Components/menu_sidebar"
import { ToastApp } from "@/Components/toast"
import { SyncLoader } from "react-spinners"
import { Highlighter, Typeahead } from "react-bootstrap-typeahead"
import Select from "react-select"
import haversine from "haversine-distance"
import CreatableSelect from "react-select/creatable"



class Frontpage extends React.Component{
    state={
        tahun:"",
        bulan:"",
        type:"peringatan_dini_banjir",
        provinsi_form:[],
        summary_ews_produksi:{
            bawang_merah:0,
            cabai_besar:0,
            cabai_rawit:0
        },
        map:null,
        search_data:[],
        geo_json_label:null,
        loaded:false,
        show_menu:false,
        collapse:"bantuan_dpi",
        mobile_show:false,
        is_loading:false,
        detail_bantuan_dpi:{
            is_open:false,
            data:{}
        }
    }

    request={
        apiGetKecamatan:async(tahun)=>{
            return await api_express().get("/kecamatan")
            .then(res=>res.data)
        },
        apiGetsBantuanDPIPeta:async()=>{
            return await api().get("/frontpage/bantuan_dpi/peta")
            .then(res=>res.data)
        }
    }
    //--data
    fetchKecamatan=async()=>{
        await this.request.apiGetKecamatan()
        .then(data=>{
            this.setState({
                search_data:data.data
            })
        })
        .catch(err=>{
            toast.error("Gets Data Failed!", {position:"bottom-center"})
        })
    }
    

    componentDidMount=()=>{
        //date
        const tahun=(new Date()).getFullYear()

        //map
        const myMap=L.map('mapid', {
            center:[-1.973, 116.253],
            zoom: 5,
            zoomControl:false
        })
        L.control.zoom({
            position:"topright"
        }).addTo(myMap)
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            maxZoom: 19,
            attribution:'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }).addTo(myMap)

        //state
        this.setState({
            tahun:tahun,
            map:myMap
        }, ()=>{
            this.fetchKecamatan()
            this.renderJSONVT()
        })
    }
    renderJSONVT=()=>{
        //options
        const {map, tahun, bulan, type}=this.state

        //map
        if(map!=null){
            map.remove()
        }

        const myMap=L.map('mapid', {
            center:[-1.973, 116.253],
            zoom: 5,
            zoomControl:false,
            maxZoom:16
        })
        L.control.zoom({
            position:"topright"
        }).addTo(myMap)
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            maxZoom: 19,
            attribution:'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }).addTo(myMap)

        //vector grid
        L.vectorGrid.protobuf(BASE_URL_XP+"/kecamatan/{z}/{x}/{y}", {
            rendererFactory: L.canvas.tile,
            interactive: true,
            vectorTileLayerStyles:{
                kecamatan:(properties, zoom)=>{
                    const ch=this.parseCH(tahun, bulan, properties)
                    
                    let color
                    if(type=="peringatan_dini_banjir"){
                        color=this.blockColorBanjir(ch.curah_hujan)
                    }
                    else{
                        color=this.blockColorKekeringan(ch.curah_hujan)
                    }

                    let zoom_opacity=0
                    if(zoom>=10) zoom_opacity=0.8

                    return {
                        fill:true,
                        fillColor:color,
                        color:"#fff",
                        weight:1,
                        opacity:zoom_opacity,
                        fillOpacity:0.8,
                    }
                }
            },
            getFeatureId:f=>{
                return f.properties['id_region']
            }
        })
        .addTo(myMap)

        //state
        this.setState({
            map:myMap
        }, ()=>{
            this.fetchBantuanDPI()
        })
    }
    fetchBantuanDPI=async()=>{
        await this.request.apiGetsBantuanDPIPeta()
        .then(data=>{
            this.renderLabel(data.data)
        })
        .catch(err=>{
            toast.error("Gets Data Failed!", {position:"bottom-center"})
        })
    }
    renderLabel=(data_kecamatan)=>{
        const {geo_json_label, map, search_data}=this.state
        
        if(geo_json_label!=null){
            map.removeLayer(geo_json_label)
        }

        let layer_group=[]
        for(var i=0; i<data_kecamatan.length; i++){
            const kec=data_kecamatan[i]
            const map_center=JSON.parse(kec.map_center)

            const layer=new L.Marker([map_center.latitude, map_center.longitude], {
                icon: new L.divIcon({
                    className:"",
                    html:`
                            <svg 
                                xmlns="http://www.w3.org/2000/svg" 
                                width="24" 
                                height="24" 
                                viewBox="0 0 24 24" 
                                stroke-width="2" 
                                stroke-linecap="round" 
                                stroke-linejoin="round" 
                                class="feather feather-map-pin" 
                                stroke="#f00" 
                                fill="#f00"
                            >
                                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                                <circle 
                                    cx="12" 
                                    cy="10" 
                                    r="3" 
                                    stroke="#fff" 
                                    fill="#fff"
                                />
                            </svg>
                        `
                })
            })
            .bindTooltip("<span>"+kec.region+"</span>", {
                permanent:true,
                direction:"top",
                sticky:true,
                className:"tooltip-marker"
            })
            .on("click", e=>{
                this.toggleDetailBantuanDPI(true, kec)
            })
            layer_group=layer_group.concat([layer])
        }
        const label_data=L.layerGroup(layer_group)
        map.addLayer(label_data)

        this.setState({
            geo_json_label:label_data
        })
    }
    blockColorBanjir=(curah_hujan)=>{
        const value=curah_hujan.toString().trim()!=""?Number(curah_hujan):""

        if(value==""){
            return "#fff"
        }
        
        if(value<=150){
            return "#238c3f"
        }
        else if(value>150 && value<=200){
            return "#8c5f23"
        }
        else if(value>200){
            return "#8c2323"
        }
    }
    blockColorKekeringan=(curah_hujan)=>{
        const value=curah_hujan.toString().trim()!=""?Number(curah_hujan):""

        if(value==""){
            return "#fff"
        }
        
        if(value<60){
            return "#8c2323"
        }
        else if(value>=60 && value<75){
            return "#8c5f23"
        }
        else if(value>=75){
            return "#238c3f"
        }
    }
    

    //VALUES
    month=[
        {label:"Rata-rata per tahun", value:""},
        {label:"Januari 1", value:"1_1"},
        {label:"Januari 2", value:"1_2"},
        {label:"Januari 3", value:"1_3"},
        {label:"Februari 1", value:"2_1"},
        {label:"Februari 2", value:"2_2"},
        {label:"Februari 3", value:"2_3"},
        {label:"Maret 1", value:"3_1"},
        {label:"Maret 2", value:"3_2"},
        {label:"Maret 3", value:"3_3"},
        {label:"April 1", value:"4_1"},
        {label:"April 2", value:"4_2"},
        {label:"April 3", value:"4_3"},
        {label:"Mei 1", value:"5_1"},
        {label:"Mei 2", value:"5_2"},
        {label:"Mei 3", value:"5_3"},
        {label:"Juni 1", value:"6_1"},
        {label:"Juni 2", value:"6_2"},
        {label:"Juni 3", value:"6_3"},
        {label:"Juli 1", value:"7_1"},
        {label:"Juli 2", value:"7_2"},
        {label:"Juli 3", value:"7_3"},
        {label:"Agustus 1", value:"8_1"},
        {label:"Agustus 2", value:"8_2"},
        {label:"Agustus 3", value:"8_3"},
        {label:"September 1", value:"9_1"},
        {label:"September 2", value:"9_2"},
        {label:"September 3", value:"9_3"},
        {label:"Oktober 1", value:"10_1"},
        {label:"Oktober 2", value:"10_2"},
        {label:"Oktober 3", value:"10_3"},
        {label:"November 1", value:"11_1"},
        {label:"November 2", value:"11_2"},
        {label:"November 3", value:"11_3"},
        {label:"Desember 1", value:"12_1"},
        {label:"Desember 2", value:"12_2"},
        {label:"Desember 3", value:"12_3"}
    ]
    type=[
        {label:"Peringatan Dini Banjir", value:"peringatan_dini_banjir"},
        {label:"Peringatan Dini Kekeringan", value:"peringatan_dini_kekeringan"}
    ]
    tahun_options=()=>{
        const year=(new Date()).getFullYear()

        let years=[]
        for(var i=year-2; i<=year+2; i++){
            years=years.concat([{value:i, label:i}])
        }

        return [{value:"", label:"Pilih Tahun"}].concat(years)
    }
    parseCH=(tahun, bulan, prop)=>{
        if(bulan.toString()==""){
            const curah_hujan=JSON.parse(prop.curah_hujan)
            const curah_hujan_normal=JSON.parse(prop.curah_hujan_normal)

            const new_arr_ch=curah_hujan.filter(f=>f.indexOf(tahun.toString()+"|")==0)

            let ch_generated={
                curah_hujan:"",
                curah_hujan_normal:""
            }
            if(new_arr_ch.length>0){
                let arr_ch=[]
                let ch=0
                
                new_arr_ch.map(c=>{
                    let input_extracted=explode_ch_generated(c)

                    if(arr_ch.filter(f=>(f.bulan==input_extracted.bulan&&f.input_ke==input_extracted.input_ke)).length==0){
                        ch+=input_extracted.curah_hujan

                        arr_ch=arr_ch.concat([input_extracted])
                    }
                })

                ch_generated=Object.assign({}, ch_generated, {
                    curah_hujan:numFix(ch/arr_ch.length)
                })
            }
            if(curah_hujan_normal.length>0){
                let arr_ch=[]
                let ch_normal=0
                
                curah_hujan_normal.map(c=>{
                    let input_extracted=explode_ch_normal_generated(c)

                    if(arr_ch.filter(f=>(f.bulan==input_extracted.bulan&&f.input_ke==input_extracted.input_ke)).length==0){
                        ch_normal+=input_extracted.curah_hujan_normal

                        arr_ch=arr_ch.concat([input_extracted])
                    }
                })

                ch_generated=Object.assign({}, ch_generated, {
                    curah_hujan_normal:numFix(ch_normal/arr_ch.length)
                })
            }

            return ch_generated
        }
        else{
            const bulan_parsed=month_selected(bulan)
            const ch=ch_from_properties(prop, tahun, bulan_parsed)
            const ch_normal=ch_normal_from_properties(prop, bulan_parsed)
            
            return {
                curah_hujan:ch,
                curah_hujan_normal:ch_normal
            }
        }
    }

    //ACTIONS
    typeBulan=e=>{
        this.setState({
            bulan:e.value
        }, ()=>{
            if(this.state.tahun.toString()!=""){
                this.renderJSONVT()
            }
        })
    }
    typeTahun=e=>{
        this.setState({
            tahun:e.value
        }, ()=>{
            if(this.state.tahun.toString()!=""){
                this.renderJSONVT()
            }
        })
    }
    typeType=e=>{
        this.setState({
            type:e.value
        }, ()=>{
            if(this.state.tahun.toString()!=""){
                this.renderJSONVT()
            }
        })
    }
    setShowMenu=show=>{
        this.setState({
            show_menu:show
        })
    }
    setCollapse=collapse=>{
        this.setState({
            collapse:collapse
        })
    }
    setMobileShow=(show=false)=>{
        this.setState({mobile_show:show})
    }

    //DETAIL BANTUAN DPI
    toggleDetailBantuanDPI=(is_open=false, data={})=>{
        this.setState({
            detail_bantuan_dpi:{
                is_open,
                data
            }
        })
    }


    render(){
        const {tahun, bulan, type, map, search_data, show_menu, collapse, is_loading, detail, detail_bantuan_dpi}=this.state

        return (
            <>
                <Head>
                    <title>Peta Bantuan DPI</title>
                </Head>

                <nav class="navbar bg-white" style={{left:0, top:0, width:"100%", zIndex:1001, height:"auto", border:"0", position:"relative"}}>
                    <div class="container-fluid" style={{minHeight:"50px"}}>
                        <div className="d-flex align-items-center">
                            <button 
                                class="btn btn-link link-dark p-0 px-1 fs-3" 
                                type="button"
                                onClick={e=>this.setShowMenu(true)}
                            >
                                <FiMenu/>
                            </button>
                            <h4 className="ms-3 mb-0 d-none d-md-inline fs-5 fw-semibold">Peta Bantuan DPI</h4>
                        </div>
                        <div className="d-flex d-md-none">
                            <button
                                type="button" 
                                className="btn btn-secondary btn-icon"
                                onClick={e=>this.setMobileShow(true)}
                            >
                                <FiFilter/>
                            </button>
                        </div>
                        <div className="d-none d-md-flex">
                            <div class="ms-3" style={{minWidth:"250px"}}>
                                <Typeahead
                                    id="rendering-example"
                                    labelKey="region"
                                    options={search_data}
                                    placeholder="Cari Wilayah ..."
                                    maxResults={10}
                                    onChange={e=>{
                                        if(e.length>0){
                                            if(this.state.map==null) return

                                            this.state.map.setView([e[0].map_center.latitude, e[0].map_center.longitude], e[0].map_center.zoom)
                                        }
                                    }}
                                    renderMenuItemChildren={(option, {text})=>{
                                        return (
                                            <>
                                                <Highlighter search={text} highlightClassName="pe-0">{option.region}</Highlighter>
                                                <div className="text-muted overflow-hidden" style={{textOverflow:"ellipsis"}}>
                                                    <small>
                                                        {option.kabupaten_kota}, {' '}
                                                        {option.provinsi}
                                                    </small>
                                                </div>
                                            </>
                                        )
                                    }}
                                    
                                />
                            </div>
                            
                            <div className="ms-2" style={{minWidth:"120px"}}>
                                <Select
                                    options={this.type}
                                    styles={{
                                        container:(baseStyles, state)=>({
                                            ...baseStyles,
                                            zIndex:99999999999
                                        })
                                    }}
                                    value={this.type.find(f=>f.value==type)}
                                    onChange={e=>this.typeType(e)}
                                    placeholder="Pilih Type"
                                    isSearchable
                                />
                            </div>
                            <div className="ms-2" style={{minWidth:"120px"}}>
                                <Select
                                    options={this.month}
                                    styles={{
                                        container:(baseStyles, state)=>({
                                            ...baseStyles,
                                            zIndex:99999999999
                                        })
                                    }}
                                    value={this.month.find(f=>f.value==bulan)}
                                    onChange={e=>this.typeBulan(e)}
                                    placeholder="Pilih Bulan"
                                    isSearchable
                                />
                            </div>
                            <div className="ms-2" style={{minWidth:"120px"}}>
                                <CreatableSelect
                                    options={this.tahun_options()}
                                    onChange={e=>this.typeTahun(e)}
                                    value={this.tahun_options().find(f=>f.value==tahun)}
                                    placeholder="Pilih Tahun"
                                    styles={{
                                        container:(baseStyles, state)=>({
                                            ...baseStyles,
                                            zIndex:99999999999
                                        })
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </nav>

                <div style={{width:"100%", height:"calc(100vh - 50px)"}} id="mapid"></div>
                <div
                    style={{
                        padding:"12px",
                        position:"fixed",
                        top:"62px",
                        left:"12px",
                        background:"#fff",
                        zIndex:991
                    }}
                >
                    <div className="d-flex flex-column">
                        <h4 style={{fontWeight:"600", fontSize:"0.875rem"}}>KETERANGAN</h4>
                        <table class='mt-3'>
                            <tr>
                                <td><div class='d-flex'><div class='d-flex me-1' style={{width:"25px", height:"15px", background:"#238c3f"}}></div></div></td>
                                <th> <span class='ms-2'>Aman</span></th>
                            </tr>
                            <tr style={{borderTop:"1px solid #9a9a9a"}}>
                                <td class='pt-1'><div class='d-flex'><div class='d-flex me-1' style={{width:"25px", height:"15px", background:"#8c5f23"}}></div></div></td>
                                <th> <span class='ms-2'>Waspada</span></th>
                            </tr>
                            <tr style={{borderTop:"1px solid #9a9a9a"}}>
                                <td class='pt-1'><div class='d-flex'><div class='d-flex me-1' style={{width:"25px", height:"15px", background:"#8c2323"}}></div></div></td>
                                <th> <span class='ms-2'>Rawan</span></th>
                            </tr>
                        </table>
                    </div>
                </div>

                {/* FILTER MOBILE */}
                <Offcanvas show={this.state.mobile_show} onHide={()=>this.setMobileShow(false)} placement="end">
                    <Offcanvas.Header closeButton>
                        <Offcanvas.Title>Filter</Offcanvas.Title>
                    </Offcanvas.Header>
                    <Offcanvas.Body>
                        <div className="d-flex flex-column">
                            <div class="mb-2">
                                <Typeahead
                                    id="rendering-example"
                                    labelKey="region"
                                    options={search_data}
                                    placeholder="Cari Wilayah ..."
                                    maxResults={10}
                                    onChange={e=>{
                                        if(e.length>0){
                                            if(this.state.map==null) return

                                            this.state.map.setView([e[0].map_center.latitude, e[0].map_center.longitude], e[0].map_center.zoom)
                                        }
                                    }}
                                    renderMenuItemChildren={(option, {text})=>{
                                        return (
                                            <>
                                                <Highlighter search={text} highlightClassName="pe-0">{option.region}</Highlighter>
                                                <div className="text-muted overflow-hidden" style={{textOverflow:"ellipsis"}}>
                                                    <small>
                                                        {option.kabupaten_kota}, {' '}
                                                        {option.provinsi}
                                                    </small>
                                                </div>
                                            </>
                                        )
                                    }}
                                    
                                />
                            </div>

                            <div className="mb-2" style={{minWidth:"120px"}}>
                                <Select
                                    options={this.type}
                                    styles={{
                                        container:(baseStyles, state)=>({
                                            ...baseStyles,
                                            zIndex:99999999999
                                        })
                                    }}
                                    value={this.type.find(f=>f.value==type)}
                                    onChange={e=>this.typeType(e)}
                                    placeholder="Pilih Type"
                                    isSearchable
                                />
                            </div>
                            <div className="mb-2">
                                <Select
                                    options={this.month}
                                    styles={{
                                        container:(baseStyles, state)=>({
                                            ...baseStyles,
                                            zIndex:10
                                        })
                                    }}
                                    value={this.month.find(f=>f.value==bulan)}
                                    onChange={e=>this.typeBulan(e)}
                                    placeholder="Pilih Bulan"
                                    isSearchable
                                />
                            </div>
                            <div className="mb-2">
                                <CreatableSelect
                                    options={this.tahun_options()}
                                    onChange={e=>this.typeTahun(e)}
                                    value={this.tahun_options().find(f=>f.value==tahun)}
                                    placeholder="Pilih Tahun"
                                    styles={{
                                        container:(baseStyles, state)=>({
                                            ...baseStyles,
                                            zIndex:9
                                        })
                                    }}
                                />
                            </div>
                        </div>
                    </Offcanvas.Body>
                </Offcanvas>

                {/* MODAL BANTUAN DPI */}
                <Modal show={detail_bantuan_dpi.is_open} onHide={()=>this.toggleDetailBantuanDPI()} backdrop="static" scrollable>
                    <Modal.Header closeButton>
                        <h4 className="modal-title">Detail Bantuan DPI</h4>
                    </Modal.Header>
                    <Modal.Body>
                        <table cellPadding="5">
                            <tr>
                                <th width="180">Provinsi</th>
                                <td width="10">:</td>
                                <td>{detail_bantuan_dpi.data?.parent?.parent.region}</td>
                            </tr>
                            <tr>
                                <th width="180">Kabupaten/Kota</th>
                                <td width="10">:</td>
                                <td>{detail_bantuan_dpi.data?.parent?.region}</td>
                            </tr>
                            <tr>
                                <th valign="top" width="180">Kecamatan</th>
                                <td valign="top" width="10">:</td>
                                <td>{detail_bantuan_dpi.data?.region}</td>
                            </tr>
                        </table>
                        <div className="table-responsive">
                            <table className="table table-hover table-hover table-custom table-wrap mb-0">
                                <thead className="thead-light">
                                    <tr>
                                        <th className="" width="50">#</th>
                                        <th className="">Kelompok Tani</th>
                                        <th className="">PJ Kelompok Tani</th>
                                        <th className="">Jenis Bantuan</th>
                                        <th className="" width="100">Tahun</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {!_.isUndefined(detail_bantuan_dpi.data.bantuan_dpi)&&
                                        <>
                                            {detail_bantuan_dpi.data.bantuan_dpi.map((list, idx)=>(
                                                <tr key={list}>
                                                    <td className="align-middle">{(idx+1)}</td>
                                                    <td>{list.kelompok_tani}</td>
                                                    <td>{list.pj_kelompok_tani}</td>
                                                    <td>{list.jenis_bantuan}</td>
                                                    <td>{list.tahun}</td>
                                                </tr>
                                            ))}
                                            {detail_bantuan_dpi.data.bantuan_dpi.length==0&&
                                                <tr>
                                                    <td colSpan={5} className="text-center">Data tidak ditemukan!</td>
                                                </tr>
                                            }
                                        </>
                                    }
                                </tbody>
                            </table>
                        </div>
                    </Modal.Body>
                    <Modal.Footer className="mt-3 border-top pt-2">
                        <button 
                            type="button" 
                            className="btn btn-link text-gray me-auto" 
                            onClick={e=>this.toggleDetailBantuanDPI()}
                        >
                            Tutup
                        </button>
                    </Modal.Footer>
                </Modal>

                <MenuSidebar
                    show_menu={show_menu}
                    setShowMenu={this.setShowMenu}
                    pengaturan={this.props.pengaturan}
                    setCollapse={this.setCollapse}
                    collapse={collapse}
                />

                <ToastApp/>
            </>
        )
    }
}

export default Frontpage