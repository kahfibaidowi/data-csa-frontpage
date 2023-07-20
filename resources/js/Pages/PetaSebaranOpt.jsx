import { Layout } from "@/Components/layout"
import { api } from "@/Config/api"
import axios from "axios"
import React from "react"
import MapWindy from "@/Components/Modules/map_windy_sebaran_opt"
import { BASE_URL, isUndefined } from "@/Config/config"
import { Head } from "@inertiajs/react"
import { toast, ToastContainer } from "react-toastify"
import { FiBarChart2, FiChevronDown, FiCloudRain, FiHome, FiMenu, FiWind } from "react-icons/fi"
import * as turf from '@turf/turf'
import { centroid, ceil } from "@/Config/helpers"
import { Collapse, Offcanvas } from "react-bootstrap"
import classNames from "classnames"
import MenuSidebar from "@/Components/menu_sidebar"
import { ToastApp } from "@/Components/toast"



class Frontpage extends React.Component{
    state={
        bulan:"",
        tahun:"",
        sebaran_opt:[],
        search_data:[],
        is_loading:false,
        collapse:"sebaran_opt"
    }

    componentDidMount=()=>{
        const date=new Date()

        this.setState({
            tahun:date.getFullYear(),
            bulan:date.getMonth()+1
        }, ()=>{
            this.fetchRegionSebaranOpt()
        })
    }
    
    //REQUEST, QUERY, MUTATION
    abortController=new AbortController()
    request={
        apiGetsRegionSebaranOpt:async(tahun, bulan)=>{
            this.abortController.abort()
            this.abortController=new AbortController()

            return await api().get("/frontpage/region/data/sebaran_opt", {
                params:{
                    tahun:tahun,
                    bulan:bulan
                },
                signal:this.abortController.signal
            })
            .then(res=>res.data)
        }
    }
    //--data
    fetchRegionSebaranOpt=async()=>{
        const {tahun, bulan}=this.state

        this.setState({is_loading:true})
        await this.request.apiGetsRegionSebaranOpt(tahun, bulan)
        .then(data=>{
            //map
            const geo_features=data.data.map(d=>{
                return {
                    type:"Feature",
                    properties:{
                        region:d.region,
                        sebaran_opt:d.sebaran_opt
                    },
                    geometry:!isUndefined(d.geo_json.graph)?d.geo_json.graph:{type:"MultiPolygon", coordinates:[]}
                }
            })

            //search
            const search_data=data.data.map(d=>{
                return {
                    region:d.region,
                    map_center:d.geo_json.map_center
                }
            })

            this.setState({
                sebaran_opt:geo_features,
                search_data:search_data,
                is_loading:false
            })
        })
        .catch(err=>{
            if(err.name=="CanceledError"){
                toast.warn("Request Aborted!", {position:"bottom-center"})
            }
            else{
                toast.error("Gets Data Failed!", {position:"bottom-center"})
                this.setState({is_loading:false})
            }
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

    //ACTIONS
    typeTahun=e=>{
        this.setState({
            tahun:e.value
        }, ()=>{
            if(this.state.tahun.toString()!=""){
                this.fetchRegionSebaranOpt()
            }
        })
    }
    typeBulan=e=>{
        this.setState({
            bulan:e.value
        }, ()=>{
            if(this.state.bulan.toString()!=""){
                this.fetchRegionSebaranOpt()
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
        const {tahun, bulan, sebaran_opt, search_data, show_menu, collapse}=this.state

        return (
            <>
                <Head>
                    <title>Peta Sebaran OPT</title>
                </Head>
                <MapWindy
                    data={sebaran_opt} 
                    search_data={search_data}
                    className="map-responsive-2"
                    setShowMenu={this.setShowMenu}
                    typeTahun={this.typeTahun}
                    typeBulan={this.typeBulan}
                    tahun={tahun}
                    bulan={bulan}
                />

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