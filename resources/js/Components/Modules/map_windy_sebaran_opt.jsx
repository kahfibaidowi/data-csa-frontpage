import React, { useEffect, useMemo, useRef, useState } from "react"
import update from "immutability-helper"
import { isUndefined, mapbox_access_token, WINDY_KEY } from "@/Config/config"
import { Map, LayersControl, TileLayer, Marker, Popup, GeoJSON, Tooltip, ZoomControl, useLeaflet } from "react-windy-leaflet"
import CreatableSelect from "react-select/creatable"
import { FiAlertTriangle, FiFilter, FiHome, FiMenu, FiSearch } from "react-icons/fi"
import Select from "react-select"
import { Dropdown, Offcanvas, Modal } from "react-bootstrap"
import * as turf from '@turf/turf'
import AsyncSelect from 'react-select/async'
import { AsyncTypeahead, Highlighter, Typeahead } from "react-bootstrap-typeahead"
import classNames from "classnames"
import { arrayMonths, ceil } from "@/Config/helpers"


const { BaseLayer, Overlay } = LayersControl;


const MapWindy=(props)=>{
    const [mobile_show, setMobileShow]=useState(false)
    const [center, setCenter]=useState({
        latitude:-1.973,
        longitude:116.253,
        zoom:5
    })
    const [detail, setDetail]=useState({
        is_open:false,
        data:{}
    })
    const mapRef=useRef(null)
    

    //helpers
    const mapStyle=feature=>{
        let color="#238c3f"
        if(feature.properties.sebaran_opt.length>0){
            color="#c7bc42"
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

    //values
    const tahun_options=()=>{
        const year=(new Date()).getFullYear()

        let years=[]
        for(var i=year-2; i<=year+2; i++){
            years=years.concat([{value:i, label:i}])
        }

        return years
    }
    const months_options=()=>{
        let months=[]
        for(var i=1; i<=12; i++){
            months=months.concat([{label:arrayMonths[i-1], value:i}])
        }

        return months
    }

    //actions
    const toggleDetail=(is_open=false, data={})=>{
        setDetail({
            is_open:is_open,
            data:data
        })
    }

    return (
        <>
            <nav class="navbar bg-white" style={{left:0, top:0, width:"100%", zIndex:999, height:"auto", border:"0", position:"relative"}}>
                <div class="container-fluid" style={{minHeight:"50px"}}>
                    <div className="d-flex align-items-center">
                        <button 
                            class="btn btn-link link-dark p-0 px-1 fs-3" 
                            type="button"
                            onClick={e=>props.setShowMenu(true)}
                        >
                            <FiMenu/>
                        </button>
                        <h4 className="ms-3 mb-0 d-none d-md-inline fs-5 fw-semibold">Peta Sebaran OPT</h4>
                    </div>
                    <div className="d-flex d-md-none">
                        <button
                            type="button" 
                            className="btn btn-secondary btn-icon"
                            onClick={e=>setMobileShow(true)}
                        >
                            <FiFilter/>
                        </button>
                    </div>
                    <div className="d-none d-md-flex">
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

                                        mapRef.current.leafletElement.setView([e[0].map_center.latitude, e[0].map_center.longitude], e[0].map_center.zoom)
                                        setCenter({
                                            latitude:e[0].map_center.latitude,
                                            longitude:e[0].map_center.longitude,
                                            zoom:e[0].map_center.zoom
                                        })
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
                                options={months_options()}
                                styles={{
                                    container:(baseStyles, state)=>({
                                        ...baseStyles,
                                        zIndex:99999999999
                                    })
                                }}
                                value={months_options().find(f=>f.value==props.bulan)}
                                onChange={e=>props.typeBulan(e)}
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
                                                return (
                                                    <GeoJSON
                                                        key={Date.now()+Math.random()+"-"+df.properties.region}
                                                        data={df}
                                                        style={mapStyle(df)}
                                                        onEachFeature={(feature, layer)=>{
                                                            layer.on({
                                                                click:e=>{
                                                                    toggleDetail(true, {
                                                                        sebaran_opt:feature.properties.sebaran_opt,
                                                                        region:feature.properties.region
                                                                    })
                                                                }
                                                            })
                                                        }}
                                                    >
                                                        <Tooltip direction="center" className="d-flex flex-column align-items-center tooltip-region" style={{fontFamily:"Poppins"}} permanent>
                                                            {(center.zoom>=9)&&<>{df.properties.region}</>}
                                                        </Tooltip>
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
                            <th> <span class='ms-2'>Tidak ada Serangan</span></th>
                        </tr>
                        <tr style={{borderTop:"1px solid #9a9a9a"}}>
                            <td class='pt-1'><div class='d-flex'><div class='d-flex me-1' style={{width:"25px", height:"15px", background:"#c7bc42"}}></div></div></td>
                            <th> <span class='ms-2'>Ada Serangan</span></th>
                        </tr>
                    </table>
                </div>
            </div>

            <Modal show={detail.is_open} onHide={()=>toggleDetail()} backdrop="static" size="lg" scrollable>
                <Modal.Header closeButton>
                    <h4 className="modal-title">Sebaran OPT {!isUndefined(detail.data.region)&&<>({detail.data.region})</>}</h4>
                </Modal.Header>
                <Modal.Body>
                <div className="table-responsive">
                    <table className="table table-hover table-hover table-custom table-wrap mb-0">
                        <thead className="thead-light">
                            <tr>
                                <th className="" width="50">#</th>
                                <th className="">Bulan</th>
                                <th className="">Tahun</th>
                                <th className="">Komoditas</th>
                                <th className="">Jenis OPT</th>
                                <th className="">LTS (Ringan)</th>
                                <th className="">LTS (Sedang)</th>
                                <th className="">LTS (Berat)</th>
                                <th className="">Sum of Total LTS</th>
                                <th className="">LTS (Puso)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {!isUndefined(detail.data.sebaran_opt)&&
                                <>
                                    {detail.data.sebaran_opt.map((list, idx)=>(
                                        <tr key={list}>
                                            <td className="align-middle">{(idx+1)}</td>
                                            <td>{list.bulan}</td>
                                            <td>{list.tahun}</td>
                                            <td>{list.komoditas}</td>
                                            <td>{list.opt}</td>
                                            <td>{list.lts_ringan}</td>
                                            <td>{list.lts_sedang}</td>
                                            <td>{list.lts_berat}</td>
                                            <td>{list.sum_lts}</td>
                                            <td>{list.lts_puso}</td>
                                        </tr>
                                    ))}
                                    {detail.data.sebaran_opt.length==0&&
                                        <tr>
                                            <td colSpan={10} className="text-center">Data tidak ditemukan!</td>
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
                        onClick={e=>toggleDetail()}
                    >
                        Tutup
                    </button>
                </Modal.Footer>
            </Modal>

            {/* FILTER MOBILE */}
            <Offcanvas show={mobile_show} onHide={()=>setMobileShow(false)} placement="end">
                <Offcanvas.Header closeButton>
                    <Offcanvas.Title>Filter</Offcanvas.Title>
                </Offcanvas.Header>
                <Offcanvas.Body>
                    <div className="d-flex flex-column">
                        <div class="mb-2">
                            <Typeahead
                                id="rendering-example"
                                labelKey="region"
                                options={props.search_data}
                                placeholder="Cari Wilayah ..."
                                maxResults={10}
                                onChange={e=>{
                                    if(e.length>0){
                                        if(mapRef.current.leafletElement==null) return

                                        mapRef.current.leafletElement.setView([e[0].map_center.latitude, e[0].map_center.longitude], e[0].map_center.zoom)
                                        setCenter({
                                            latitude:e[0].map_center.latitude,
                                            longitude:e[0].map_center.longitude,
                                            zoom:e[0].map_center.zoom
                                        })
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
                            <CreatableSelect
                                options={tahun_options()}
                                onChange={e=>props.typeTahun(e)}
                                value={tahun_options().find(f=>f.value==props.tahun)}
                                placeholder="Pilih Tahun"
                                styles={{
                                    container:(baseStyles, state)=>({
                                        ...baseStyles,
                                        zIndex:10
                                    })
                                }}
                            />
                        </div>
                        <div className="mb-2">
                            <Select
                                options={months_options()}
                                styles={{
                                    container:(baseStyles, state)=>({
                                        ...baseStyles,
                                        zIndex:9
                                    })
                                }}
                                value={months_options().find(f=>f.value==props.bulan)}
                                onChange={e=>props.typeBulan(e)}
                                placeholder="Pilih Bulan"
                                isSearchable
                            />
                        </div>
                    </div>
                </Offcanvas.Body>
            </Offcanvas>
        </>
    )
}

export default MapWindy