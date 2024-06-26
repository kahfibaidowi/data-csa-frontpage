import React, { useEffect, useRef, useState } from "react"
import update from "immutability-helper"
import { isUndefined, mapbox_access_token, WINDY_KEY } from "@/Config/config"
import { Map, LayersControl, TileLayer, Marker, Popup, GeoJSON, Tooltip, ZoomControl, useLeaflet, MapControl } from "react-windy-leaflet"
import CreatableSelect from "react-select/creatable"
import { FiHome, FiMenu, FiSearch } from "react-icons/fi"
import Select from "react-select"
import { Dropdown, Offcanvas } from "react-bootstrap"
import * as turf from '@turf/turf'
import AsyncSelect from 'react-select/async'
import { AsyncTypeahead, Highlighter, Typeahead } from "react-bootstrap-typeahead"


const { BaseLayer, Overlay } = LayersControl;

const geojson=[[[[111.63005999957039,-7.524659999758398],[111.63202999958588,-7.525120000286961],[111.63368000013293,-7.52591999940762],[111.63370999971778,-7.526159999683443],[111.63384999987863,-7.52660999975086],[111.63399999960137,-7.526899999634452],[111.63411000017743,-7.527099999864276],[111.63414000066155,-7.527260000048159],[111.63404000144595,-7.52754999993175],[111.63390000038578,-7.527769999285226],[111.63378000114716,-7.52788999942311],[111.63364000008698,-7.527899999884255],[111.63296000020489,-7.527560000392896],[111.63236999997656,-7.527320000117129],[111.63217000064606,-7.52728000007113],[111.63199000133852,-7.527369998825577],[111.63193000037029,-7.527469999839809],[111.63195000039326,-7.527650000046663],[111.6321299997008,-7.527990000437342],[111.63234277210228,-7.528263776551228],[111.6324500000685,-7.528410000020699],[111.6324849998839,-7.528749998612739],[111.63243000004553,-7.52897999932668],[111.6323200003688,-7.529120000386911],[111.63210000011594,-7.529219998703184],[111.63161999956435,-7.529369999325183],[111.63134000014196,-7.529499999924269],[111.63121000134151,-7.529640000085124],[111.63111231158496,-7.529835377799657],[111.63109000030431,-7.530030000083627],[111.63113000035031,-7.530169999345162],[111.63172816642282,-7.530648531303882],[111.63187999986314,-7.530770000034693],[111.63185999984017,-7.530899999734402],[111.63111999988911,-7.531229998764616],[111.63098000062757,-7.531299999294731],[111.63078999995957,-7.531379999386672],[111.63070999986763,-7.531630000123585],[111.63074408417322,-7.531794826069586],[111.63117999995808,-7.53231000000568],[111.63147500007227,-7.53265499972764],[111.63189999988612,-7.533150000071657],[111.6319550006238,-7.53338500011688],[111.63163000002555,-7.533569998755638],[111.63111999988911,-7.533749999861811],[111.63102000157284,-7.533784999677209],[111.63076000037478,-7.533930000068665],[111.63041037094291,-7.534146134135995],[111.63021000019239,-7.534269999560024],[111.63017999970828,-7.534380000136082],[111.63025000113771,-7.534499999374646],[111.63049000141348,-7.534809999281265],[111.63058000016792,-7.534919999857323],[111.63078000039775,-7.535089998703654],[111.63100000065054,-7.535289999832798],[111.63107999984317,-7.535459999578507],[111.63111000032728,-7.535679999831302],[111.63108148192589,-7.536164813554478],[111.6309900001894,-7.536469999390135],[111.6308399995674,-7.536740000150076],[111.63070999986763,-7.536839999365668],[111.63052999966078,-7.536869999849785],[111.62965000134756,-7.536969999964697],[111.62947000024138,-7.537079999641492],[111.62942000063356,-7.537159999733376],[111.62837384807568,-7.537339629419535],[111.62778087918525,-7.537325998395318],[111.62752000024886,-7.537319999917258],[111.62500000005099,-7.537030000033667],[111.62485000032831,-7.537030000033667],[111.62458261839419,-7.537030000033667],[111.62385999964033,-7.537030000033667],[111.62327000031132,-7.537050000056638],[111.62266000006002,-7.537059999618464],[111.62216000038478,-7.536649999596989],[111.62165000024834,-7.536259998699165],[111.62089000027436,-7.53542999999371],[111.62006000066953,-7.534309999605966],[111.61930000069555,-7.533259999748395],[111.6187099995679,-7.532449999267271],[111.61948000000302,-7.531890000422379],[111.62040000106026,-7.530499999274753],[111.62097999992812,-7.529359999763358],[111.62192000010896,-7.527839998916022],[111.62249000031431,-7.527170000394392],[111.62305999962035,-7.526430000443384],[111.62353000061012,-7.525840001114375],[111.6241399999621,-7.525379999686436],[111.62431000060707,-7.525290000032669],[111.62465000009848,-7.52516000033296],[111.62500000005099,-7.52509999936467],[111.626750000713,-7.524659999758398],[111.62871000026735,-7.524550000081661],[111.62927118441866,-7.524595727010364],[111.63005999957039,-7.524659999758398]]]]

const legend=`<table class='mt-3'>
<tr><td><div class='d-flex'><div class='d-flex me-1' style='width:25px;height:15px;background:#4a1400'></div> (0 - 30%)</div></td><th rowspan='3'> <span class='ms-2'>Bawah Normal</span></th></tr>
<tr><td><div class='d-flex'><div class='d-flex me-1' style='width:25px;height:15px;background:#a65900'></div> (31 - 50%)</div></td></tr>
<tr><td><div class='d-flex'><div class='d-flex me-1' style='width:25px;height:15px;background:#f3c40f'></div> (51 - 84%)</div></td></tr>
<tr style='border-top:1px solid #9a9a9a'><td class='pt-1'><div class='d-flex'><div class='d-flex me-1' style='width:25px;height:15px;background:#fefe00'></div> (85 - 115%)</div></td><th> <span class='ms-2'>Normal</span></th></tr>
<tr style='border-top:1px solid #9a9a9a'><td class='pt-1'><div class='d-flex'><div class='d-flex me-1' style='width:25px;height:15px;background:#89b700'></div> (116 - 150%)</div></td><th rowspan='3'> <span class='ms-2'>Atas Normal</span></th></tr>
<tr><td><div class='d-flex'><div class='d-flex me-1' style='width:25px;height:15px;background:#238129'></div> (151 - 200%)</div></td></tr>
<tr><td><div class='d-flex'><div class='d-flex me-1' style='width:25px;height:15px;background:#00460e'></div> (> 200%)</div></td></tr>
</table>`;

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

    

    //value
    const valueBanjir=(str_value)=>{
        const value=str_value.toString().trim()!=""?Number(str_value):""
        
        if(value=="") return ""

        if(value<=150){
            return "Aman"
        }
        else if(value>150 && value<=200){
            return "Waspada"
        }
        else if(value>200){
            return "Rawan"
        }
    }
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
                                            <MapControl position="bottomleft">
                                                <div className="d-flex flex-column">
                                                    <h4 style='font-weight:600;font-size:0.875rem'>SIFAT HUJAN</h4>
                                                    <div dangerouslySetInnerHTML={{__html:legend}}/>
                                                </div>
                                            </MapControl>
                                            {props.data.map(df=>{
                                                const curah_hujan=curahHujan(df)

                                                return (
                                                    <GeoJSON
                                                        key={Date.now()+Math.random()+"-"+df.properties.region}
                                                        data={df}
                                                        style={mapStyle(df)}
                                                    >
                                                        {(center.zoom>=9)&&<Tooltip direction="center" className="tooltip-region" style={{fontFamily:"Arial"}} permanent>{df.properties.region}</Tooltip>}
                                                        <Popup>
                                                            <div class='d-flex flex-column'>
                                                                <span>Kabupaten/Kota : <strong>{df.properties.region}</strong></span>
                                                                <span>Curah Hujan : <strong>{curah_hujan.curah_hujan}</strong></span>
                                                                <span>Curah Hujan Normal : <strong>{curah_hujan.curah_hujan_normal}</strong></span>
                                                                <span class='d-flex'>Sifat Hujan : <strong dangerouslySetInnerHTML={{__html:sifatHujan(curah_hujan.curah_hujan, curah_hujan.curah_hujan_normal)}}></strong></span>
                                                                <span class='d-flex'>Sifat Bulan : <strong>{sifatBulan(curah_hujan.curah_hujan)}</strong></span>
                                                                <span class='d-flex'>Banjir : <strong>{valueBanjir(curah_hujan.curah_hujan)}</strong></span>
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
        </>
    )
}
 
export default MapWindy