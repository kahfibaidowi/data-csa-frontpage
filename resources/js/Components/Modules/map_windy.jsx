import React, { useEffect, useRef, useState } from "react"
import update from "immutability-helper"
import { isUndefined, mapbox_access_token, WINDY_KEY } from "@/Config/config"
import { Map, LayersControl, TileLayer, Marker, Popup, GeoJSON, Tooltip } from "react-windy-leaflet"
import CreatableSelect from "react-select/creatable"


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
    const tahun_options=()=>{
        const year=(new Date()).getFullYear()

        let years=[]
        for(var i=year-2; i<=year+2; i++){
            years=years.concat([{value:i, label:i}])
        }

        return [{value:"", label:"Pilih Tahun"}].concat(years)
    }
    const month_selected=()=>{
        if(bulan.toString().trim()=="") return {bulan:"", input_ke:""}
        else{
            const new_bulan=bulan.toString().split("_")
            return {bulan:new_bulan[0], input_ke:new_bulan[1]}
        }
    }
    const mapStyle=feature=>{
        let color="#fefe00"
        const select=month_selected()
        if(select.bulan.toString()!=""){
            const curah_hujan=feature.properties.curah_hujan[(Number(select.bulan)-1)*3+(Number(select.input_ke)-1)]

            color=blockColor(curah_hujan.curah_hujan, curah_hujan.curah_hujan_normal)
        }
        else{
            const curah_hujan=feature.properties.curah_hujan

            let ch="", curah_hujan_normal=""
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
                }
            }

            color=blockColor(ch, curah_hujan_normal)
        }

        return {
            stroke:true,
            color:"#FFF",
            weight:1,
            opacity:1,
            fillColor:color,
            fillOpacity:.9
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
                curah_hujan:ch!=""?(ch/count_curah_hujan):ch,
                curah_hujan_normal:ch!=""?(curah_hujan_normal/count_curah_hujan):curah_hujan_normal
            }
        }
    }
    const blockColor=(curah_hujan, normal)=>{
        if(curah_hujan.toString().trim()==""||normal.toString().trim()==""){
            return "#fefe00"
        }
        if(Number(normal)==0){
            return "#fefe00"
        }

        const value=curah_hujan/normal;
        if(value<=0.3){
            return "#4a1400";
        }
        if(value<=0.5){
            return "#a65900";
        }
        if(value<=0.84){
            return "#f3c40f";
        }
        if(value<=1.15){
            return "#fefe00"
        }
        if(value<=1.5){
            return "#89b700"
        }
        if(value<=2){
            return "#238129"
        }
        if(value>200){
            return "#00460e"
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

    return (
        <>
            <div className="container">
                <div className="d-flex justify-content-between mb-3">
                    <div style={{maxWidth:"200px"}}>
                        <select className="form-select" value={bulan} onChange={e=>setBulan(e.target.value)}>
                            <option value="">Rata-rata per tahun</option>
                            {month.map(month=>(
                                <option value={month.value}>{month.label}</option>
                            ))}
                        </select>
                    </div>
                    <div style={{minWidth:"150px"}}>
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
            <Map
                ref={(ref)=>mapRef.current=ref}
                className={!isUndefined(props.className)?props.className:"map-responsive"}
                windyKey={WINDY_KEY}
                windyLabels={false}
                windyControls={false}
                overlay="wind"
                overlayOpacity={0.5}
                particlesAnim={false}
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
                        <LayersControl>
                            <BaseLayer checked name="OSM">
                                <TileLayer
                                    attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
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
                                    {(center.zoom>=8)&&<Tooltip direction="center" className="tooltip-region" permanent>{df.properties.region}</Tooltip>}
                                    <Popup>
                                        <div class='d-flex flex-column'>
                                            <span>Kabupaten/Kota : <strong>{df.properties.region}</strong></span>
                                            <span>Curah Hujan : <strong>{curah_hujan.curah_hujan}</strong></span>
                                            <span>Curah Hujan Normal : <strong>{curah_hujan.curah_hujan_normal}</strong></span>
                                            <span class='d-flex'>Sifat Hujan : <strong dangerouslySetInnerHTML={{__html:sifatHujan(curah_hujan.curah_hujan, curah_hujan.curah_hujan_normal)}}></strong></span>
                                            <span class='d-flex'>Sifat Bulan : <strong>{sifatBulan(curah_hujan.curah_hujan)}</strong></span>
                                        </div>
                                    </Popup>
                                </GeoJSON>
                            )
                        })}
                    </React.Fragment>
                }
            />
        </>
    )
}

 
export default MapWindy