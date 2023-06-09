import React, { useEffect, useMemo, useRef, useState } from "react"
import update from "immutability-helper"
import { isUndefined, mapbox_access_token, WINDY_KEY } from "@/Config/config"
import { Map, LayersControl, TileLayer, Marker, Popup, GeoJSON, Tooltip, ZoomControl, useLeaflet } from "react-windy-leaflet"
import CreatableSelect from "react-select/creatable"
import { FiAlertTriangle, FiHome, FiMenu, FiSearch } from "react-icons/fi"
import Select from "react-select"
import { Dropdown, Offcanvas } from "react-bootstrap"
import * as turf from '@turf/turf'
import AsyncSelect from 'react-select/async'
import { AsyncTypeahead, Highlighter, Typeahead } from "react-bootstrap-typeahead"
import classNames from "classnames"
import { ceil } from "@/Config/helpers"


const { BaseLayer, Overlay } = LayersControl;


const MapWindy=(props)=>{
    const [bulan, setBulan]=useState("")
    const [center, setCenter]=useState({
        latitude:-1.973,
        longitude:116.253,
        zoom:5
    })
    const mapRef=useRef(null)
    

    //helpers
    const month_selected=()=>{
        if(bulan.toString().trim()=="") return {bulan:"", input_ke:""}
        else{
            const new_bulan=bulan.toString().split("_")
            return {bulan:new_bulan[0], input_ke:new_bulan[1]}
        }
    }
    const mapStyle=feature=>{
        const curah_hujan=curahHujan(feature)
        const color=blockColor(curah_hujan.curah_hujan, curah_hujan.curah_hujan_normal)

        return {
            stroke:true,
            color:"#FFF",
            weight:1,
            opacity:1,
            fillColor:color,
            fillOpacity:.6
        }
    }
    const curahHujan=feature=>{
        const select=month_selected()
        if(select.bulan.toString()!=""){
            const curah_hujan=feature.properties.curah_hujan[(Number(select.bulan)-1)*3+(Number(select.input_ke)-1)]

            return {
                curah_hujan:curah_hujan.curah_hujan,
                curah_hujan_normal:curah_hujan.curah_hujan_normal
            }
        }
        else{
            const curah_hujan=feature.properties.curah_hujan

            let ch="", curah_hujan_normal="", count_curah_hujan=0
            for(var i=0; i<curah_hujan.length; i++){
                if(curah_hujan[i].curah_hujan.toString().trim()!=""){
                    if(ch==""){
                        ch=Number(curah_hujan[i].curah_hujan)
                        curah_hujan_normal=Number(curah_hujan[i].curah_hujan_normal)
                    }
                    else{
                        ch+=Number(curah_hujan[i].curah_hujan)
                        curah_hujan_normal+=Number(curah_hujan[i].curah_hujan_normal)
                    }
                    count_curah_hujan++
                }
            }

            return {
                curah_hujan:ch!=""?ceil(ch/count_curah_hujan):ch,
                curah_hujan_normal:ch!=""?(curah_hujan_normal/count_curah_hujan):curah_hujan_normal
            }
        }
    }
    const blockColor=(curah_hujan, normal)=>{
        const value=curah_hujan.toString().trim()!=""?Number(curah_hujan):""

        if(value==""){
            return "#238c3f"
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
    const sifatHujan=(curah_hujan, normal)=>{
        if(curah_hujan.toString().trim()==""||normal.toString().trim()==""){
            return ""
        }
        if(Number(normal)==0){
            return "?"
        }

        const value=curah_hujan/normal;
        if(value<=0.3){
            return "<div class='d-flex'><div class='d-flex mx-1' style='width:25px;height:15px;background:#4a1400'></div> (0 - 30%) Bawah Normal</div>";
        }
        if(value<=0.5){
            return "<div class='d-flex'><div class='d-flex mx-1' style='width:25px;height:15px;background:#a65900'></div> (31 - 50%) Bawah Normal</div>";
        }
        if(value<=0.84){
            return "<div class='d-flex'><div class='d-flex mx-1' style='width:25px;height:15px;background:#f3c40f'></div> (51 - 84%) Bawah Normal</div>";
        }
        if(value<=1.15){
            return "<div class='d-flex'><div class='d-flex mx-1' style='width:25px;height:15px;background:#fefe00'></div> (85 - 115%) Normal</div>";
        }
        if(value<=1.5){
            return "<div class='d-flex'><div class='d-flex mx-1' style='width:25px;height:15px;background:#89b700'></div> (116 - 150%) Atas Normal</div>";
        }
        if(value<=2){
            return "<div class='d-flex'><div class='d-flex mx-1' style='width:25px;height:15px;background:#238129'></div> (151 - 200%) Atas Normal</div>";
        }
        if(value>2){
            return "<div class='d-flex'><div class='d-flex mx-1' style='width:25px;height:15px;background:#00460e'></div> (> 200%) Atas Normal</div>";
        }
    }
    const sifatBulan=(curah_hujan)=>{
        if(curah_hujan.toString().trim()==""){
            return ""
        }

        if(curah_hujan>200){
            return "Bulan Basah"
        }
        else if(curah_hujan>=100 && curah_hujan<=200){
            return "Bulan Lembab"
        }
        else if(curah_hujan>=60 && curah_hujan<100){
            return "Bulan Kering"
        }
        else if(curah_hujan<60){
            return "Bulan Sangat Kering"
        }
    }

    

    //value
    const valueKekeringan=(str_value)=>{
        const value=str_value.toString().trim()!=""?Number(str_value):""
        
        if(value=="") return ""

        if(value<60){
            return "Rawan"
        }
        else if(value>=60 && value<75){
            return "Waspada"
        }
        else if(value>=75){
            return "Aman"
        }

        return ""
    }
    const month=[
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
    const tahun_options=()=>{
        const year=(new Date()).getFullYear()

        let years=[]
        for(var i=year-2; i<=year+2; i++){
            years=years.concat([{value:i, label:i}])
        }

        return [{value:"", label:"Pilih Tahun"}].concat(years)
    }

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
                                options={props.search_data}
                                placeholder="Cari Wilayah ..."
                                maxResults={10}
                                onChange={e=>{
                                    if(e.length>0){
                                        if(mapRef.current.leafletElement==null) return

                                        mapRef.current.leafletElement.setView([e[0].center.latitude, e[0].center.longitude], e[0].center.zoom)
                                        setCenter({
                                            latitude:e[0].center.latitude,
                                            longitude:e[0].center.longitude,
                                            zoom:e[0].center.zoom
                                        })
                                    }
                                }}
                                renderMenuItemChildren={(option, {text})=>{
                                    return (
                                        <>
                                            <Highlighter search={text} highlightClassName="pe-0">{option.region}</Highlighter>
                                            <div className="text-muted">
                                                <small>
                                                    {option.type=="kabupaten_kota"?
                                                        <>
                                                            {option.provinsi}
                                                        </>
                                                    :
                                                        <>
                                                            {option.kabupaten_kota}, {' '}
                                                            {option.provinsi}
                                                        </>
                                                    }
                                                </small>
                                            </div>
                                        </>
                                    )
                                }}
                                
                            />
                        </div>
                    </div>
                    <div className="d-flex">
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
                        <div className="ms-2" style={{minWidth:"200px"}}>
                            <Select
                                options={month}
                                styles={{
                                    container:(baseStyles, state)=>({
                                        ...baseStyles,
                                        zIndex:99999999999
                                    })
                                }}
                                value={month.find(f=>f.value==bulan)}
                                onChange={e=>setBulan(e.value)}
                                placeholder="Pilih Bulan"
                                isSearchable
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
                                    className={classNames((!isUndefined(props.className)?props.className:"map-responsive"), (center.zoom>=9?"map-show-region":""))}
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
                                            {props.data.map(df=>{
                                                const curah_hujan=curahHujan(df)

                                                return (
                                                    <GeoJSON
                                                        key={Date.now()+Math.random()+"-"+df.properties.region}
                                                        data={df}
                                                        style={mapStyle(df)}
                                                    >
                                                        <Tooltip direction="center" className="d-flex flex-column align-items-center tooltip-region" style={{fontFamily:"Poppins"}} permanent>
                                                            {(center.zoom>=9)&&<>{df.properties.region}</>}
                                                            {valueKekeringan(curah_hujan.curah_hujan)=="Rawan"&&<span className="blink-animation text-white fs-18px"><FiAlertTriangle/></span>}
                                                        </Tooltip>
                                                        <Popup>
                                                            <div class='d-flex flex-column'>
                                                                <span>Kabupaten/Kota : <strong>{df.properties.region}</strong></span>
                                                                <span>Curah Hujan : <strong>{curah_hujan.curah_hujan}</strong></span>
                                                                <span>Curah Hujan Normal : <strong>{curah_hujan.curah_hujan_normal}</strong></span>
                                                                <span class='d-flex'>Sifat Hujan : <strong dangerouslySetInnerHTML={{__html:sifatHujan(curah_hujan.curah_hujan, curah_hujan.curah_hujan_normal)}}></strong></span>
                                                                <span class='d-flex'>Sifat Bulan : <strong>{sifatBulan(curah_hujan.curah_hujan)}</strong></span>
                                                                <span class='d-flex'>Kekeringan : <strong>{valueKekeringan(curah_hujan.curah_hujan)}</strong></span>
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
        </>
    )
}
 
export default MapWindy