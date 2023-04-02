import { Layout } from "@/Components/layout"
import { api } from "@/Config/api"
import axios from "axios"
import React from "react"
import MapWindy from "@/Components/Modules/map_windy_banjir"
import { BASE_URL, isUndefined } from "@/Config/config"
import { Head } from "@inertiajs/react"
import { toast, ToastContainer } from "react-toastify"
import { FiBarChart2, FiChevronDown, FiCloudRain, FiHome, FiMenu, FiWind } from "react-icons/fi"
import * as turf from '@turf/turf'
import { centroid } from "@/Config/helpers"
import { Collapse, Offcanvas } from "react-bootstrap"
import classNames from "classnames"



class Frontpage extends React.Component{
    state={
        tahun:"",
        provinsi_form:[],
        summary_ews_produksi:{
            bawang_merah:0,
            cabai_besar:0,
            cabai_rawit:0
        },
        map_curah_hujan:[],
        search_curah_hujan:[],
        banjir:[],
        kekeringan:[],
        loaded:false,
        show_menu:false,
        collapse:"peringatan_dini"
    }

    componentDidMount=()=>{
        const tahun=(new Date()).getFullYear()

        this.setState({
            tahun:tahun,
            loaded:true
        }, ()=>{
            this.fetchSummarySifatHujanKabupatenKota()
        })
    }
    
    //REQUEST, QUERY, MUTATION
    abortController=new AbortController()
    request={
        apiGetSummaryEwsProduksi:async(tahun)=>{
            return await api().get("/frontpage/summary/type/ews_produksi", {
                params:{
                    tahun:tahun
                }
            })
            .then(res=>res.data)
        },
        apiGetSummarySifatHujanKabupatenKota:async(tahun)=>{
            this.abortController.abort()
            this.abortController=new AbortController()

            return await api().get("/frontpage/summary/type/sifat_hujan_kabupaten_kota", {
                params:{
                    tahun:tahun
                },
                signal:this.abortController.signal
            })
            .then(res=>res.data)
        },
        apiGetSummarySifatHujanKecamatan:async(tahun)=>{
            return await api().get("/frontpage/summary/type/sifat_hujan_kecamatan", {
                params:{
                    tahun:tahun
                }
            })
            .then(res=>res.data)
        },
        apiGetProvinsiForm:async()=>{
            return await api().get("/frontpage/region/type/provinsi")
            .then(res=>res.data)
        }
    }
    //--data
    fetchSummarySifatHujanKabupatenKota=async()=>{
        const {tahun}=this.state

        await this.request.apiGetSummarySifatHujanKabupatenKota(tahun)
        .then(data=>{
            //map
            const geo_features=data.data.map(d=>{
                const kecamatan=d.kecamatan.map(k=>{
                    //curah hujan
                    let curah_hujan=[]
                    this.months_year().map(month=>{
                        for(var i=1; i<=3; i++){
                            const find_curah_hujan=k.curah_hujan.find(f=>f.bulan.toString()==month.toString() && f.input_ke.toString()==i.toString())
                            if(!isUndefined(find_curah_hujan)){
                                curah_hujan=curah_hujan.concat([find_curah_hujan])
                            }
                            else{
                                const data_curah_hujan={
                                    id_region:d.id_region,
                                    tahun:tahun,
                                    bulan:month,
                                    curah_hujan:"",
                                    curah_hujan_normal:"",
                                    sifat:""
                                }
                                curah_hujan=curah_hujan.concat([data_curah_hujan])
                            }
                        }
                    })

                    return {
                        region:k.region,
                        curah_hujan:curah_hujan
                    }
                })

                const curah_hujan_kabkota=this.valueKabupatenKotaCurahHujan({kecamatan})

                return {
                    type:"Feature",
                    properties:{
                        region:d.region,
                        curah_hujan:curah_hujan_kabkota
                    },
                    geometry:!isUndefined(d.geo_json.graph)?d.geo_json.graph:{type:"MultiPolygon", coordinates:[]}
                }
            })
            //search
            let search_regions=[]
            data.data.map(d=>{
                search_regions=search_regions.concat([{
                    id_region:d.id_region,
                    type:"kabupaten_kota", 
                    region:d.region, 
                    provinsi:d.parent.region,
                    center:d.geo_json.map_center
                }])
                d.kecamatan.map(dk=>{
                    search_regions=search_regions.concat([{
                        id_region:dk.id_region,
                        type:"kecamatan", 
                        region:dk.region, 
                        kabupaten_kota:dk.parent.region, 
                        provinsi:dk.parent.parent.region,
                        center:dk.geo_json.map_center
                    }])
                })
            })
            
            this.setState({
                map_curah_hujan:geo_features,
                search_curah_hujan:search_regions
            })
        })
        .catch(err=>{
            if(err.name=="CanceledError"){
                toast.warn("Request Aborted!", {position:"bottom-center"})
            }
            else{
                toast.error("Gets Data Failed!", {position:"bottom-center"})
            }
        })
    }
    fetchProvinsiForm=async()=>{
        await this.request.apiGetProvinsiForm()
        .then(data=>{
            this.setState({
                provinsi_form:data.data
            })
        })
        .catch(err=>{
            toast.error("Gets Data Failed!", {position:"bottom-center"})
        })
    }

    //VALUES
    months_year=()=>{
        let months=[]
        for(var i=1; i<=12; i++){
            months=months.concat([i])
        }

        return months
    }
    valueBanjir=(str_value)=>{
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
    valueKekeringan=(str_value)=>{
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

    //ACTIONS
    typeTahun=e=>{
        this.setState({
            tahun:e.value
        }, ()=>{
            if(this.state.tahun.toString()!=""){
                this.fetchSummarySifatHujanKabupatenKota()
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

    //HELPERS
    valueKabupatenKotaCurahHujanColumn=(data_kabkota, idx_column)=>{
        let curah_hujan=[]

        data_kabkota.kecamatan.map(kec=>{
            if(!isUndefined(kec.curah_hujan[idx_column].id_curah_hujan)){
                curah_hujan=curah_hujan.concat([kec.curah_hujan[idx_column]])
            }
        })

        return curah_hujan
    }
    valueKabupatenKotaCurahHujan=(data_kabkota)=>{
        let curah_hujan=[]

        for(var i=0; i<36; i++){
            const ch_kabupaten_kota_column=this.valueKabupatenKotaCurahHujanColumn(data_kabkota, i)

            if(ch_kabupaten_kota_column.length>0){
                const ch=ch_kabupaten_kota_column.reduce((carry, item)=>{
                    return Number(carry)+Number(item.curah_hujan)
                }, 0)
                const ch_normal=ch_kabupaten_kota_column.reduce((carry, item)=>{
                    return Number(carry)+Number(item.curah_hujan_normal)
                }, 0)

                curah_hujan=curah_hujan.concat([{
                    curah_hujan:ch/ch_kabupaten_kota_column.length,
                    curah_hujan_normal:ch_normal/ch_kabupaten_kota_column.length
                }])
            }
            else{
                curah_hujan=curah_hujan.concat([{
                    curah_hujan:"",
                    curah_hujan_normal:""
                }])
            }
        }

        return curah_hujan
    }

    render(){
        const {tahun, map_curah_hujan, search_curah_hujan, show_menu, collapse}=this.state

        return (
            <>
                <Head>
                    <title>Peringatan Dini Banjir</title>
                </Head>
                <MapWindy
                    data={map_curah_hujan} 
                    search_data={search_curah_hujan}
                    className="map-responsive-2"
                    setShowMenu={this.setShowMenu}
                    typeTahun={this.typeTahun}
                    tahun={tahun}
                />

                <Offcanvas show={show_menu} placement="start" onHide={()=>this.setShowMenu(false)}>
                    <Offcanvas.Header>
                        <Offcanvas.Title>
                            <a href="/" className="navbar-brand me-auto ms-3 ms-lg-0">
                                {this.props.pengaturan.logo!=""?
                                    <img src={BASE_URL+"/storage/"+this.props.pengaturan.logo} style={{maxHeight:"20px"}}/>
                                :
                                    <span className="text-success">{this.props.pengaturan.title}</span>
                                }
                                
                            </a>
                        </Offcanvas.Title>
                        <button 
                            type="button" 
                            class="btn-close" 
                            aria-label="Close" 
                            style={{fontSize:"20px"}}
                            onClick={()=>this.setShowMenu(false)}
                        ></button>
                    </Offcanvas.Header>
                    <Offcanvas.Body className="sidebar">
                        <div className="sidebar-body">
                            <ul class="nav p-2">
                                {/* <li class="nav-item nav-category">Main</li> */}
                                <li class="nav-item">
                                    <a href="/" class="nav-link">
                                        <FiHome className="link-icon"/>
                                        <span class="link-title">Dashboard</span>
                                    </a>
                                </li>
                                <li class="nav-item">
                                    <a href="/info_grafis" class="nav-link">
                                        <FiBarChart2 className="link-icon"/>
                                        <span class="link-title">Infografis</span>
                                    </a>
                                </li>
                                <li 
                                    className={classNames(
                                        "nav-item",
                                        "active"
                                    )}
                                >
                                    <a 
                                        className="nav-link cursor-pointer" 
                                        onClick={e=>this.setCollapse(collapse=="peringatan_dini"?"":"peringatan_dini")} 
                                        aria-expanded={collapse=="peringatan_dini"}
                                    >
                                        <FiCloudRain className="link-icon"/>
                                        <span className="link-title">Peringatan Dini</span>
                                        <FiChevronDown className="link-arrow"/>
                                    </a>
                                    <Collapse in={collapse=="peringatan_dini"}>
                                        <div>
                                            <ul className="nav sub-menu">
                                                <li className="nav-item">
                                                    <a href="/peringatan_dini/banjir" className={classNames("nav-link", "active")}>
                                                        Banjir
                                                    </a>
                                                </li>
                                                <li className="nav-item">
                                                    <a href="/peringatan_dini/kekeringan" className={classNames("nav-link")}>
                                                        Kekeringan
                                                    </a>
                                                </li>
                                                <li className="nav-item">
                                                    <a href="#" className={classNames("nav-link")}>
                                                        Sebaran OPT
                                                    </a>
                                                </li>
                                            </ul>
                                        </div>
                                    </Collapse>
                                </li>
                                <li class="nav-item">
                                    <a href="/jadwal_tanam" class="nav-link">
                                        <FiWind className="link-icon"/>
                                        <span class="link-title">Jadwal Tanam</span>
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </Offcanvas.Body>
                </Offcanvas>

                <ToastContainer
                    position="top-center"
                    autoClose={2000}
                    hideProgressBar
                    newestOnTop={false}
                    closeButton={false}
                    closeOnClick
                    rtl={false}
                    pauseOnFocusLoss={false}
                    draggable
                    pauseOnHover
                    theme="colored"
                    limit={1}
                />
            </>
        )
    }
}

export default Frontpage