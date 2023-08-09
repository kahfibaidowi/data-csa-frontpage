import React from "react"
import classNames from "classnames"
import update from "immutability-helper"
import L from "leaflet"
import geojsonvt from "geojson-vt"
window.geojsonvt = geojsonvt
import "leaflet-geojson-vt/src/leaflet-geojson-vt"
import { toast } from "react-toastify"
import { api } from "@/Config/api"
import { isUndefined } from "@/Config/config"
import { ceil } from "@/Config/helpers"
import { MapContainer, TileLayer } from "react-leaflet"
import { useEffect } from "react"
import { FiFilter, FiMenu } from "react-icons/fi"
import Select from "react-select"
import CreatableSelect from "react-select/creatable"
import MenuSidebar from "@/Components/menu_sidebar"
import { ToastApp } from "@/Components/toast"
import { Offcanvas } from "react-bootstrap"
import { Highlighter, Typeahead } from "react-bootstrap-typeahead"
import haversine from "haversine-distance"
import { SyncLoader } from "react-spinners"


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
        search_data:[]
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
                await this.fetchCurahHujan()
            })
        })
    }

    abortController=new AbortController()
    request={
        apiGetCurahHujanKecamatan:async(tahun)=>{
            this.abortController.abort()
            this.abortController=new AbortController()

            return await api().get("/frontpage/summary/type/curah_hujan_kecamatan", {
                params:{
                    tahun,
                    regency_id:""
                },
                signal:this.abortController.signal
            })
            .then(res=>res.data)
        }
    }
    fetchCurahHujan=async()=>{
        const {tahun}=this.state

        this.setState({is_loading:true})
        await this.request.apiGetCurahHujanKecamatan(tahun)
        .then(data=>{
            const kecamatan=data.data.map((k, idx)=>{
                return {
                    type:"Feature",
                    properties:{
                        region:k.region,
                        curah_hujan:k.curah_hujan,
                        center:k.geo_json.map_center
                    },
                    geometry:!isUndefined(k.geo_json.graph)?k.geo_json.graph:{type:"MultiPolygon", coordinates:[]}
                }
            })
            const search_data=data.data.map(k=>{
                return update(k, {
                    center:{$set:k.geo_json.map_center},
                    geo_json:{$set:undefined},
                    curah_hujan:{$set:undefined}
                })
            })

            this.setState({
                kecamatan:kecamatan,
                is_loading:false,
                search_data
            })
            this.renderJSONVT(kecamatan)
        })
        .catch(err=>{
            if(err.name=="CanceledError"){
                toast.warn("Request Aborted!", {position:"bottom-center"})
            }
            else{
                toast.error("Gets Data Failed!", {position:"bottom-center"})
                
                this.setState({
                    is_loading:false
                })
            }
        })
    }
    renderJSONVT=(kecamatan)=>{
        const month=this.month_selected()

        //geojson
        const geo_json={
            type:"FeatureCollection",
            features:kecamatan.map(kec=>{
                const ch=kec.properties.curah_hujan.find(f=>f.bulan.toString()==month.bulan.toString() && f.input_ke.toString()==month.input_ke.toString())

                return {
                    type:kec.type,
                    properties:{
                        region:kec.properties.region,
                        curah_hujan:!isUndefined(ch)?ch.curah_hujan:""
                    },
                    geometry:kec.geometry
                }
            })
        }

        //geojson vt
        let ch_toleransi=0
        let min=100-ch_toleransi
        let max=200+ch_toleransi

        const options={
            maxZoom: 20,
            tolerance: 3,
            debug: 0,
            style:properties=>{
                const ch=ceil(properties.curah_hujan)

                let color="#8c2323"
                if(ch>=min && ch<=max) color="#238c3f"

                return {
                    fillColor:color,
                    color:color,
                    weight:1,
                    opacity:1,
                    fillOpacity:0.8,
                }
            }
        }
        
        //map
        const {map}=this.state
        if(map!=null){
            map.remove()
        }

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
            map:myMap
        }, ()=>{
            myMap.on("dragend", e=>{
                this.updateLabel(myMap.getCenter(), myMap.getZoom())
            })
            myMap.on("zoomend", e=>{
                this.updateLabel(myMap.getCenter(), myMap.getZoom())
            })

            L.geoJson.vt(geo_json, options).addTo(myMap)
        })
    }
    updateLabel=(latlng, zoom)=>{
        const {geo_json_label, map, kecamatan}=this.state

        if(zoom>=10){
            if(geo_json_label!=null){
                map.removeLayer(geo_json_label)
            }

            const data_geo_json=kecamatan.filter(f=>{
                let coord={lat:f.properties.center.latitude, lng:f.properties.center.longitude}

                if(haversine(latlng, coord)<50000) return true
                return false
            })
            const geo_json={
                type:"FeatureCollection",
                features:data_geo_json.map(kec=>{
                    return {
                        type:kec.type,
                        properties:{
                            region:kec.properties.region,
                            center:kec.properties.map_center
                        },
                        geometry:kec.geometry
                    }
                })
            }

            const g_label=L.geoJSON(geo_json, {
                style:{
                    color:"#fff",
                    weight:0,
                    fillColor:"#0f0",
                    fillOpacity:0
                },
                onEachFeature:(feature, layer)=>{
                    layer.bindTooltip(feature.properties.region.toString(), {permanent:true, direction:"center", className:"tooltip-region"})
                }
            })
            map.addLayer(g_label)

            this.setState({
                geo_json_label:g_label
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
            this.fetchCurahHujan()
        })
    }
    typeBulan=value=>{
        if(!this.state.is_loading){
            this.setState({
                bulan:value
            }, ()=>{
                this.renderJSONVT(this.state.kecamatan)
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
    
    render(){
        const {tahun, bulan, show_menu, collapse, search_data, is_loading}=this.state

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

                                            this.state.map.setView([e[0].center.latitude, e[0].center.longitude], e[0].center.zoom)
                                        }
                                    }}
                                    renderMenuItemChildren={(option, {text})=>{
                                        return (
                                            <>
                                                <Highlighter search={text} highlightClassName="pe-0">{option.region}</Highlighter>
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

                                            this.state.map.setView([e[0].center.latitude, e[0].center.longitude], e[0].center.zoom)
                                        }
                                    }}
                                    renderMenuItemChildren={(option, {text})=>{
                                        return (
                                            <>
                                                <Highlighter search={text} highlightClassName="pe-0">{option.region}</Highlighter>
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
            </>
        )
    }
}

export default Frontpage