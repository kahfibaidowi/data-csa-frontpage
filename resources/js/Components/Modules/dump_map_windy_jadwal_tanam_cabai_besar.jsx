import React, { useEffect, useMemo, useRef, useState } from "react"
import update from "immutability-helper"
import { isUndefined, mapbox_access_token, WINDY_KEY } from "@/Config/config"
import { Map, LayersControl, TileLayer, Marker, Popup, GeoJSON, Tooltip, ZoomControl, useLeaflet, MapControl } from "react-windy-leaflet"
import CreatableSelect from "react-select/creatable"
import { FiAlertTriangle, FiHome, FiMenu, FiSearch, FiUpload } from "react-icons/fi"
import Select from "react-select"
import { Dropdown, Offcanvas } from "react-bootstrap"
import * as turf from '@turf/turf'
import AsyncSelect from 'react-select/async'
import { AsyncTypeahead, Highlighter, Typeahead } from "react-bootstrap-typeahead"
import { ceil, arrayMonths } from "@/Config/helpers"
import * as _ from "underscore"


const { BaseLayer, Overlay } = LayersControl;


const MapWindy=(props)=>{
    const ch_toleransi=20
    const [center, setCenter]=useState({
        latitude:-1.973,
        longitude:116.253,
        zoom:5
    })
    const [bulan, setBulan]=useState("")
    const mapRef=useRef(null)

    useEffect(()=>{
        
    })

    //map
    const map_data=()=>{
        const kec= props.data.map(k=>{
            return Object.assign({}, k.geo_json, {
                properties:{
                    region:k.geo_json.properties.region,
                    jadwal_tanam:jadwal_tanam(k.geo_json.properties.curah_hujan)
                }
            })
        })
        
        return kec
    }
    

    //helpers
    const mapStyle=feature=>{
        const color=blockColor(feature.properties.jadwal_tanam)

        return {
            stroke:true,
            color:"#FFF",
            weight:1,
            opacity:1,
            fillColor:color,
            fillOpacity:.6
        }
    }
    const jadwal_tanam=(curah_hujan)=>{
        let ch_ignore=[]
        let ch_data=[]
        let min=100-ch_toleransi
        let max=200+ch_toleransi
        let ch_raw=curah_hujan

        ch_raw.map((ch, idx)=>{
            let found=true
            if(idx>27){
                found=false
            }
            else{
                for(var i=idx; i<idx+9; i++){
                    const ch_this=ceil(ch_raw[i].curah_hujan)

                    if(ch_this.toString().trim()==""){
                        found=false
                        break
                    }
                    if(Number(ch_this)<min || Number(ch_this)>max){
                        found=false
                        break
                    }
                    if(ch_ignore.includes(idx)){
                        found=false
                        break
                    }
                }
            }

            if(found){
                ch_ignore=ch_ignore.concat([
                    idx, idx+1, idx+2, idx+3, idx+4, idx+5, idx+6, idx+7, idx+8
                ])
                ch_data=ch_data.concat([
                    {
                        text:arrayMonths[ch.bulan-1]+" "+ch.input_ke+" - "+arrayMonths[ch_raw[idx+8].bulan-1]+" "+ch_raw[idx+8].input_ke,
                        data:[ch, ch_raw[idx+1], ch_raw[idx+2], ch_raw[idx+3], ch_raw[idx+4], ch_raw[idx+5], ch_raw[idx+6], ch_raw[idx+7], ch_raw[idx+8]]
                    }
                ])
            }
        })

        return ch_data
    }
    const blockColor=(jadwal_tanam)=>{
        if(jadwal_tanam.length>0){
            return "#238c3f"
        }
        return "#8c2323"
    }

    

    //value
    const tahun_options=()=>{
        const year=(new Date()).getFullYear()

        let years=[]
        for(var i=year-2; i<=year+2; i++){
            years=years.concat([{value:i, label:i}])
        }

        return [{value:"", label:"Pilih Tahun"}].concat(years)
    }
    const month=[
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

    //actions

    return (
        <>
            <nav class="navbar bg-white" style={{left:0, top:0, width:"100%", zIndex:999, height:"auto", border:"0", position:"relative"}}>
                <div class="container-fluid" style={{minHeight:"50px"}}>
                    <div className="d-flex">
                        <button 
                            class="btn btn-link link-dark p-0 px-1 fs-3" 
                            type="button"
                            onClick={e=>props.setShowMenu(true)}
                        >
                            <FiMenu/>
                        </button>
                        <div class="ms-3" style={{minWidth:"250px"}}>
                            <Typeahead
                                id="rendering-example"
                                labelKey="region"
                                options={props.kabupaten_kota}
                                placeholder="Cari Wilayah ..."
                                maxResults={10}
                                onChange={e=>{
                                    if(e.length>0){
                                        if(mapRef.current.leafletElement==null) return

                                        mapRef.current.leafletElement.setView([e[0].geo_json.map_center.latitude, e[0].geo_json.map_center.longitude], e[0].geo_json.map_center.zoom)
                                        setCenter({
                                            latitude:e[0].geo_json.map_center.latitude,
                                            longitude:e[0].geo_json.map_center.longitude,
                                            zoom:e[0].geo_json.map_center.zoom
                                        })
                                        props.typeRegency(e[0].id_region)
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
                    </div>
                    <div className="d-flex">
                        <div style={{minWidth:"120px"}}>
                            <div style={{minWidth:"120px"}}>
                                <Select
                                    options={month}
                                    styles={{
                                        container:(baseStyles, state)=>({
                                            ...baseStyles,
                                            zIndex:99999999999
                                        })
                                    }}
                                    value={month.find(f=>f.value==bulan)}
                                    onChange={e=>this.typeBulan(e.value)}
                                    placeholder="Pilih Bulan"
                                    isSearchable
                                />
                            </div>
                        </div>
                        <div style={{minWidth:"120px"}}>
                            <CreatableSelect
                                options={tahun_options()}
                                onChange={e=>props.typeTahun(e)}
                                value={tahun_options().find(f=>f.value==props.tahun)}
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

            <div className="container-fluid px-0 overflow-hidden">
                <div className="row" style={{height:"calc(100vh - 50px)"}}>
                    <div className="col-12 h-100">
                        <div class="card h-100">
                            <div class="card-body p-0" style={{height:"100%"}}>
                                <Map
                                    ref={(ref)=>mapRef.current=ref}
                                    className={!isUndefined(props.className)?props.className:"map-responsive"}
                                    windyKey={WINDY_KEY}
                                    windyLabels={false}
                                    windyControls={true}
                                    overlay="wind"
                                    overlayOpacity={0.5}
                                    particlesAnim={false}
                                    zoomControl={false}
                                    zoom={center.zoom}
                                    center={[center.latitude, center.longitude]}
                                    removeWindyLayers
                                    onzoomend={()=>{
                                        setCenter(update(center, {
                                            zoom:{$set:mapRef.current.leafletElement.getZoom()}
                                        }))
                                    }}
                                    mapElements={
                                        <React.Fragment>
                                            <LayersControl position="bottomright" style={{display:"none"}}>
                                                <BaseLayer checked name="OSM">
                                                    <TileLayer
                                                        attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                                                        url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}"
                                                    />
                                                </BaseLayer>
                                            </LayersControl>
                                            {map_data().map(df=>{
                                                return (
                                                    <GeoJSON
                                                        key={Date.now()+Math.random()+"-"+df.properties.region}
                                                        data={df}
                                                        style={mapStyle(df)}
                                                    >
                                                        <Popup>
                                                            <div class='d-flex flex-column'>
                                                                <span>Kecamatan : <strong>{df.properties.region}</strong></span>
                                                                <span>
                                                                    Jadwal Tanam :&nbsp;
                                                                    {_.pluck(df.properties.jadwal_tanam, 'text').join(", ")}
                                                                    {df.properties.jadwal_tanam.length==0&&<>-</>}
                                                                </span>
                                                            </div>
                                                        </Popup>
                                                    </GeoJSON>
                                                )
                                            })}
                                        </React.Fragment>
                                    }
                                />
                            </div>
                            
                        </div>
                    </div>
                </div>
            </div>

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
                            <th> <span class='ms-2'>Bisa Ditanam</span></th>
                        </tr>
                        <tr style={{borderTop:"1px solid #9a9a9a"}}>
                            <td class='pt-1'><div class='d-flex'><div class='d-flex me-1' style={{width:"25px", height:"15px", background:"#8c2323"}}></div></div></td>
                            <th> <span class='ms-2'>Tidak Bisa Ditanam</span></th>
                        </tr>
                    </table>
                </div>
            </div>
        </>
    )
}
 
export default MapWindy