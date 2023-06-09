import { Layout } from "@/Components/layout"
import { api } from "@/Config/api"
import axios from "axios"
import React from "react"
import MapWindy from "@/Components/Modules/dump_map_windy_jadwal_tanam_cabai_besar"
import { BASE_URL, isUndefined } from "@/Config/config"
import { Head } from "@inertiajs/react"
import { toast, ToastContainer } from "react-toastify"
import { FiBarChart2, FiChevronDown, FiCloudRain, FiHome, FiMenu, FiWind } from "react-icons/fi"
import * as turf from '@turf/turf'
import { ceil, centroid } from "@/Config/helpers"
import { Collapse, Offcanvas } from "react-bootstrap"
import classNames from "classnames"
import MenuSidebar from "@/Components/menu_sidebar"



class Frontpage extends React.Component{
    state={
        tahun:"",
        regency_id:"",
        ch_toleransi:20,
        kabupaten_kota_form:[],
        kecamatan:[],
        loaded:false,
        show_menu:false,
        collapse:"jadwal_tanam"
    }

    componentDidMount=()=>{
        const tahun=(new Date()).getFullYear()

        this.setState({
            tahun:tahun,
            loaded:true
        }, ()=>{
            this.fetchRegencyForm()
        })
    }
    
    //REQUEST, QUERY, MUTATION
    abortController=new AbortController()
    request={
        apiGetRegionRegency:async()=>{
            return await api().get("/frontpage/region/type/kabupaten_kota")
            .then(res=>res.data)
        },
        apiGetCurahHujanKecamatan:async(tahun, regency_id)=>{
            return await api().get("/frontpage/summary/type/curah_hujan_kecamatan", {
                params:{
                    tahun,
                    regency_id
                }
            })
            .then(res=>res.data)
        }
    }
    //--data
    fetchCurahHujan=async()=>{
        const {tahun, regency_id}=this.state

        this.setState({kecamatan:[]})
        await this.request.apiGetCurahHujanKecamatan(tahun, regency_id)
        .then(data=>{
            const kecamatan=data.data.map(k=>{
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
                                id_region:k.id_region,
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

                const geo_json={
                    type:"Feature",
                    properties:{
                        region:k.region,
                        curah_hujan:curah_hujan
                    },
                    geometry:!isUndefined(k.geo_json.graph)?k.geo_json.graph:{type:"MultiPolygon", coordinates:[]}
                }

                return {
                    region:k.region,
                    geo_json:geo_json,
                    center:k.geo_json.map_center
                }
            })
            
            this.setState({
                kecamatan:kecamatan
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
    fetchRegencyForm=async()=>{
        await this.request.apiGetRegionRegency()
        .then(data=>{
            this.setState({
                kabupaten_kota_form:data.data
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
            if(this.state.tahun.toString()!="" && this.state.regency_id.toString()!=""){
                this.fetchCurahHujan()
            }
        })
    }
    typeRegency=id=>{
        this.setState({
            regency_id:id
        }, ()=>{
            if(this.state.tahun.toString()!="" && this.state.regency_id.toString()!=""){
                this.fetchCurahHujan()
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

    render(){
        const {tahun, kecamatan, kabupaten_kota_form, show_menu, collapse}=this.state

        return (
            <>
                <Head>
                    <title>Peta Jadwal Tanam Cabai Besar</title>
                </Head>
                <MapWindy
                    data={kecamatan}
                    kabupaten_kota={kabupaten_kota_form}
                    className="map-responsive-2"
                    setShowMenu={this.setShowMenu}
                    typeTahun={this.typeTahun}
                    typeRegency={this.typeRegency}
                    tahun={tahun}
                />

                <MenuSidebar
                    show_menu={show_menu}
                    setShowMenu={this.setShowMenu}
                    pengaturan={this.props.pengaturan}
                    setCollapse={this.setCollapse}
                    collapse={collapse}
                />

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