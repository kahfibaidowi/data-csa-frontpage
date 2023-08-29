import React from "react"
import classNames from "classnames"
import _ from "underscore"
import update from "immutability-helper"
import L from "leaflet"
import "leaflet.vectorgrid"
import { toast } from "react-toastify"
import { api, api_express } from "@/Config/api"
import { BASE_URL_XP, isUndefined } from "@/Config/config"
import { ceil, ch_from_properties, month_selected } from "@/Config/helpers"
import { MapContainer, TileLayer } from "react-leaflet"
import { useEffect } from "react"
import { FiFilter, FiMenu } from "react-icons/fi"
import Select from "react-select"
import CreatableSelect from "react-select/creatable"
import MenuSidebar from "@/Components/menu_sidebar"
import { ToastApp } from "@/Components/toast"
import { Modal, Offcanvas } from "react-bootstrap"
import { Highlighter, Typeahead } from "react-bootstrap-typeahead"
import haversine from "haversine-distance"
import { SyncLoader } from "react-spinners"


L.DomEvent.fakeStop = function () {
    return true;
}
class Frontpage extends React.Component{
    state={
        tahun:"",
        bulan:"",
        show_menu:false,
        collapse:"jadwal_tanam",
        map:null,
        geo_json_label:null,
        geo_json:[],
        position:[-1.973, 116.253],
        zoom:5,
        kecamatan:[],
        is_loading:false,
        mobile_show:false,
        search_data:[],
        detail:{
            is_open:false,
            data:{}
        }
    }

    request={
        apiGetKecamatan:async(tahun)=>{
            return await api_express().get("/kecamatan")
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


    componentDidMount=async()=>{
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

        this.setState({
            map:myMap
        }, ()=>{
            //fetch kecamatan
            this.fetchKecamatan()

            //form
            const date=new Date()

            let input
            let date_month=date.getDate()
            if(date_month<=10) input=1
            else if(date_month<=20) input=2
            else input=3

            this.setState({
                bulan:(date.getMonth()+1)+"_"+input,
                tahun:date.getFullYear()
            }, async()=>{
                await this.renderJSONVT()
            })
        })
    }
    renderJSONVT=()=>{
        //options
        const {map, tahun, bulan}=this.state

        const bulan_parsed=month_selected(bulan)
        let ch_toleransi=0
        let min=100-ch_toleransi
        let max=200+ch_toleransi
        
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
                    const ch=ch_from_properties(properties, tahun, bulan_parsed)

                    let color="#fff"
                    if(ch!=""){
                        if(ch>=min && ch<=max) color="#238c3f"
                        else color="#8c2323"
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
        .on("click", e=>{
            const prop=e.layer.properties
            const ch=ch_from_properties(prop, tahun, bulan_parsed)

            let ch_status=""
            if(ch!=""){
                if(ch>max){
                    ch_status="out_max"
                }
                if(ch<min){
                    ch_status="out_min"
                }
            }

            const data={
                id_region:prop.id_region,
                region:prop.region,
                kabupaten_kota:prop.kabupaten_kota,
                provinsi:prop.provinsi,
                curah_hujan:ch,
                status:ch!=""?((ch>=min && ch<=max)?"potensi":"tidak_potensi"):"",
                curah_hujan_status:ch_status
            }
            this.toggleDetail(true, data)
        })
        .addTo(myMap)

        //state
        this.setState({
            map:myMap
        }, ()=>{
            //label region
            myMap.on("dragend", e=>{
                this.renderLabel(myMap.getCenter(), myMap.getZoom())
            })
            myMap.on("zoomend", e=>{
                this.renderLabel(myMap.getCenter(), myMap.getZoom())
            })
        })
    }
    renderLabel=(latlng, zoom)=>{
        const {geo_json_label, map, search_data}=this.state
        
        if(zoom>=11){
            if(geo_json_label!=null){
                map.removeLayer(geo_json_label)
            }

            const data_geo_json=search_data.filter(f=>{
                let coord={lat:f.map_center.latitude, lng:f.map_center.longitude}
                
                if(haversine(latlng, coord)<60000) return true
                return false
            })

            let layer_group=[]
            for(var i=0; i<data_geo_json.length; i++){
                const layer=new L.Marker([data_geo_json[i].map_center.latitude, data_geo_json[i].map_center.longitude], {
                    icon: new L.divIcon({
                        className:"marker-icon",
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
                .bindTooltip("<span>"+data_geo_json[i].region+"</span>", {
                    permanent:true,
                    direction:"top",
                    sticky:true,
                    className:"tooltip-marker"
                })
                layer_group=layer_group.concat([layer])
            }
            const label_data=L.layerGroup(layer_group)
            map.addLayer(label_data)

            this.setState({
                geo_json_label:label_data
            })
        }
        else{
            if(geo_json_label!=null){
                map.removeLayer(geo_json_label)
            }
        }
    }

    //helpers
    getInput=()=>{
        
    }
    months_year=()=>{
        let months=[]
        for(var i=1; i<=12; i++){
            months=months.concat([i])
        }

        return months
    }
    typeTahun=value=>{
        this.setState({
            tahun:value
        }, ()=>{
            this.renderJSONVT()
        })
    }
    typeBulan=value=>{
        if(!this.state.is_loading){
            this.setState({
                bulan:value
            }, ()=>{
                this.renderJSONVT()
            })
        }
    }

    //values
    month=[
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
    tahun_options=()=>{
        const year=(new Date()).getFullYear()

        let years=[]
        for(var i=year-2; i<=year+2; i++){
            years=years.concat([{value:i, label:i}])
        }

        return [{value:"", label:"Pilih Tahun"}].concat(years)
    }
    month_selected=()=>{
        if(this.state.bulan.toString().trim()=="") return {bulan:"", input_ke:""}
        else{
            const new_bulan=this.state.bulan.toString().split("_")
            return {bulan:new_bulan[0], input_ke:new_bulan[1]}
        }
    }

    //ACTIONS
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
    
    //DETAIL
    toggleDetail=(is_open=false, data={})=>{
        this.setState({
            detail:{
                is_open,
                data
            }
        })
    }
    getStatus=status=>{
        if(status=="potensi"){
            return (
                <div className="d-flex align-items-center">
                    <div class='d-flex me-1' style={{width:"25px", height:"15px", background:"#238c3f"}}></div>
                    <span className="fw-bold">Potensi Tanam</span>
                </div>
            )
        }
        if(status=="tidak_potensi"){
            return (
                <div className="d-flex align-items-center">
                    <div class='d-flex me-1' style={{width:"25px", height:"15px", background:"#8c2323"}}></div>
                    <span className="fw-bold">Tidak Potensi Tanam</span>
                </div>
            )
        }
        return ""
    }

    render(){
        const {tahun, bulan, show_menu, collapse, search_data, is_loading, detail}=this.state

        return (
            <>
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
                            <h4 className="ms-3 mb-0 d-none d-md-inline fs-5 fw-semibold">Jadwal Tanam Optimal Cabai Besar</h4>
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
                                    options={this.month}
                                    styles={{
                                        container:(baseStyles, state)=>({
                                            ...baseStyles,
                                            zIndex:99999999999
                                        })
                                    }}
                                    value={this.month.find(f=>f.value==bulan)}
                                    onChange={e=>this.typeBulan(e.value)}
                                    placeholder="Pilih Bulan"
                                    isSearchable
                                />
                            </div>
                            <div className="ms-2" style={{minWidth:"120px"}}>
                                <CreatableSelect
                                    options={this.tahun_options()}
                                    onChange={e=>this.typeTahun(e.value)}
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
                                <th> <span class='ms-2'>Potensi Tanam</span></th>
                            </tr>
                            <tr style={{borderTop:"1px solid #9a9a9a"}}>
                                <td class='pt-1'><div class='d-flex'><div class='d-flex me-1' style={{width:"25px", height:"15px", background:"#8c2323"}}></div></div></td>
                                <th> <span class='ms-2'>Tidak Potensi Tanam</span></th>
                            </tr>
                        </table>
                    </div>
                </div>
                
                {/* LOADER */}
                <div 
                    className={classNames("d-flex justify-content-center align-items-center w-100 h-100", {"invisible":!is_loading})}
                    style={{
                        position:"absolute", 
                        top:0, 
                        left:0, 
                        background:"rgba(0, 0, 0, .35)",
                        zIndex:997
                    }}
                >
                    <SyncLoader
                        color={"#fff"}
                        loading={true}
                        cssOverride={{position:"relative"}}
                        size={20}
                        aria-label="Loading Spinner"
                        data-testid="loader"
                    />
                </div>

                <MenuSidebar
                    show_menu={show_menu}
                    setShowMenu={this.setShowMenu}
                    pengaturan={this.props.pengaturan}
                    setCollapse={this.setCollapse}
                    collapse={collapse}
                />

                <ToastApp/>

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
                                    onChange={e=>this.typeBulan(e.value)}
                                    placeholder="Pilih Bulan"
                                    isSearchable
                                />
                            </div>
                            <div className="mb-2">
                                <CreatableSelect
                                    options={this.tahun_options()}
                                    onChange={e=>this.typeTahun(e.value)}
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
                
                {/* MODAL */}
                <Modal show={detail.is_open} onHide={()=>this.toggleDetail()} backdrop="static" scrollable>
                    <Modal.Header closeButton>
                        <h4 className="modal-title">Detail Lokasi</h4>
                    </Modal.Header>
                    <Modal.Body>
                        <table cellPadding="5">
                            <tr>
                                <th width="180">Provinsi</th>
                                <td width="10">:</td>
                                <td>{detail.data?.provinsi}</td>
                            </tr>
                            <tr>
                                <th width="180">Kabupaten/Kota</th>
                                <td width="10">:</td>
                                <td>{detail.data?.kabupaten_kota}</td>
                            </tr>
                            <tr>
                                <th valign="top" width="180">Kecamatan</th>
                                <td valign="top" width="10">:</td>
                                <td>{detail.data?.region}</td>
                            </tr>
                            <tr>
                                <th valign="top" width="180">Curah Hujan</th>
                                <td valign="top" width="10">:</td>
                                <td>{(detail.data?.curah_hujan!=="")&&<>{detail.data?.curah_hujan} mm</>}</td>
                            </tr>
                            <tr>
                                <th valign="top" width="180">Hasil Analisa</th>
                                <td valign="top" width="10">:</td>
                                <td>{this.getStatus(detail.data?.status)}</td>
                            </tr>
                        </table>
                        <p className="mt-5 mb-2">Curah hujan optimal untuk Cabai Besar adalah <strong>100-200 mm/bulan</strong></p>
                        {detail.data?.curah_hujan_status=="out_max"&&
                            <p><strong>Disclaimer :</strong> Petani tetap bisa menanam Cabai Besar diluar rekomendasi jadwal tanam dengan mengantisipasi kelebihan curah hujan di lahan dan potensi serangan OPT, dengan melakukan persiapan dan perbaikan saluran drainase</p>
                        }
                        {detail.data?.curah_hujan_status=="out_min"&&
                            <p><strong>Disclaimer :</strong> Petani tetap bisa menanam Cabai Besar diluar rekomendasi jadwal tanam, asalkan kebutuhan air irigasi dapat tetap terpenuhi menggunakan pompa, sible, atau disel</p>
                        }
                    </Modal.Body>
                    <Modal.Footer className="mt-3 border-top pt-2">
                        <button 
                            type="button" 
                            className="btn btn-link text-gray me-auto" 
                            onClick={e=>this.toggleDetail()}
                        >
                            Tutup
                        </button>
                    </Modal.Footer>
                </Modal>
            </>
        )
    }
}

export default Frontpage