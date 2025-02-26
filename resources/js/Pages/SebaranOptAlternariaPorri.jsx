import { Layout } from "@/Components/layout"
import { api } from "@/Config/api"
import update from "immutability-helper"
import axios from "axios"
import React, { useEffect, useState } from "react"
import MapWindy from "@/Components/Modules/map_windy"
import { BASE_URL, isUndefined } from "@/Config/config"
import { Head } from "@inertiajs/react"
import { toast, ToastContainer } from "react-toastify"
import { FiChevronDown, FiChevronLeft, FiChevronRight, FiCloudRain, FiFilter, FiHome, FiMenu, FiWind } from "react-icons/fi"
import * as turf from '@turf/turf'
import { arrayMonths, centroid, paginate } from "@/Config/helpers"
import { Collapse, Modal, Offcanvas, Spinner } from "react-bootstrap"
import classNames from "classnames"
import Select from "react-select"
import NumberFormat from "react-number-format"
import DataGrid from "react-data-grid"
import * as _ from "underscore"
import ReactApexChart from "react-apexcharts"
import BarChart from "@/Components/Modules/bar_chart"
import { ToastApp } from "@/Components/toast"
import CreatableSelect from "react-select/creatable"
import LineChart from "@/Components/Modules/line_chart"



class Frontpage extends React.Component{
    state={
        curah_hujan:{
            data:[],
            tahun:"",
            province_id:"",
            regency_id:"",
            id_region:"",
            is_loading:false
        },
        region:{
            provinsi:[],
            kab_kota:[],
            kecamatan:[]
        }
    }

    componentDidMount=async()=>{
        this.fetchAllRegion()
    }

    abortController=new AbortController()
    request={
        apiGetsCurahHujan:async(params)=>{
            this.abortController.abort()
            this.abortController=new AbortController()

            return await api().get("/frontpage/curah_hujan/sebaran_opt", {
                params:params,
                signal:this.abortController.signal
            })
            .then(res=>res.data)
        },
        apiGetsAllRegion:async()=>{
            return await api().get("/frontpage/region/type/all")
            .then(res=>res.data)
        }
    }
    fetchCurahHujan=async()=>{
        const {data,  ...params}=this.state.curah_hujan

        if(params.id_region=="" || params.tahun==""){
            this.setState({
                curah_hujan:update(this.state.curah_hujan, {
                    data:{$set:[]}
                })
            })
            return
        }

        this.setLoading(true)
        await this.request.apiGetsCurahHujan(params)
        .then(data=>{
            const new_data=data.data.map(list=>{
                const _0944xch=0.944*list.curah_hujan
                const _ch2=Math.pow(list.curah_hujan, 2)
                const _0002297xch2=0.002297*_ch2
                const prediksi_alternaria_porri=6.08+_0944xch-_0002297xch2
    
                return Object.assign({}, list, {
                    _0944xch:_0944xch,
                    _ch2:_ch2,
                    _0002297xch2:_0002297xch2,
                    prediksi_alternaria_porri:prediksi_alternaria_porri
                })
            })

            this.setState({
                curah_hujan:update(this.state.curah_hujan, {
                    data:{$set:new_data},
                    is_loading:{$set:false}
                })
            })
        })
        .catch(err=>{
            if(err.name=="CanceledError"){
                toast.warn("Request Aborted!", {position:"bottom-center"})
            }
            else{
                toast.error("Gets Data Failed!", {position:"bottom-center"})
                this.setLoading(false)
            }
        })
    }
    fetchAllRegion=async()=>{
        await this.request.apiGetsAllRegion()
        .then(data=>{
            this.setState({
                region:data.data
            })
        })
        .catch(err=>{
            toast.error("Gets Data Failed!", {position:"bottom-center"})
        })
    }

    //TABLE
    setLoading=(loading)=>{
        this.setState({
            curah_hujan:update(this.state.curah_hujan, {
                is_loading:{$set:loading}
            })
        })
    }
    typeFilter=e=>{
        const target=e.target

        this.setState({
            curah_hujan:update(this.state.curah_hujan, {
                page:{$set:1},
                [target.name]:{$set:target.value}
            })
        }, ()=>{
            switch(target.name){
                case "province_id":
                    this.setState({
                        curah_hujan:update(this.state.curah_hujan, {
                            regency_id:{$set:""},
                            id_region:{$set:""}
                        })
                    }, ()=>{
                        this.fetchCurahHujan()
                    })
                break;
                case "regency_id":
                    this.setState({
                        curah_hujan:update(this.state.curah_hujan, {
                            id_region:{$set:""}
                        })
                    }, ()=>{
                        this.fetchCurahHujan()
                    })
                break;
                default:
                    this.fetchCurahHujan()
            }
        })
    }
    timeout=0

    //FILTER
    setFilterMobileOpen=(open=false)=>{
        this.setState({
            filter_mobile_open:open
        })
    }

    render(){
        const {curah_hujan, region}=this.state

        return (
            <>
                <Head>
                    <title>Sebaran OPT Alternaria Porri</title>
                </Head>
                
                <Layout {...this.props}>
                    <div id="content-section" className='d-block' style={{marginTop:"80px", marginBottom:"80px"}}>
                        <div className='container'>
                            <div class="d-flex justify-content-between align-items-center flex-wrap grid-margin">
                                <div>
                                    <h4 class="mb-3 mb-md-0 fw-bold">Sebaran OPT (Alternaria Porri)</h4>
                                </div>
                                <div class="d-flex align-items-center flex-wrap text-nowrap">
                                    <div style={{minWidth:"150px"}}>
                                    </div>
                                </div>
                            </div>
                            
                            <TableSebaranOpt 
                                data={curah_hujan}
                                region={region}
                                setPerPage={this.setPerPage}
                                goToPage={this.goToPage}
                                typeFilter={this.typeFilter}
                            />

                            <Infografis 
                                data={curah_hujan}
                                is_loading={curah_hujan.is_loading}
                            />

                        </div>
                    </div>
                </Layout>

                <ToastApp/>
            </>
        )
    }
}


const TableSebaranOpt=({data, region, setPerPage, goToPage, typeFilter})=>{
    //state
    const [mobile_show, setMobileShow]=useState(false)

    //filter
    const data_tahun=[
        {label:"Pilih Tahun", value:""},
        {label:"2023", value:"2023"},
        {label:"2024", value:"2024"},
        {label:"2025", value:"2025"}
    ]
    const data_provinsi=()=>{
        let prov=region.provinsi

        return [{label:"Pilih Provinsi", value:""}].concat(prov.map(p=>{
            return {
                label:p.region,
                value:p.id_region
            }
        }))
    }
    const data_kab_kota=()=>{
        if(data.province_id==""){
            return [{label:"Pilih Kabupaten/Kota", value:""}]
        }

        let filtered_kab_kota=region.kab_kota.filter(d=>d.nested==data.province_id)
        return [{label:"Pilih Kabupaten/Kota", value:""}].concat(filtered_kab_kota.map(p=>{
            return {
                label:p.region,
                value:p.id_region
            }
        }))
    }
    const data_kecamatan=()=>{
        if(data.regency_id==""){
            return [{label:"Pilih Kecamatan", value:""}]
        }

        let filtered_kecamatan=region.kecamatan.filter(d=>d.nested==data.regency_id)
        return [{label:"Pilih Kecamatan", value:""}].concat(filtered_kecamatan.map(p=>{
            return {
                label:p.region,
                value:p.id_region
            }
        }))
    }

    return (
        <>
            <div className="row mb-4">
                <div className="col-12">
                    <div className="card mb-4">
                        <div className="card-body p-4">
                            <div className="d-none d-md-flex mb-3 mt-3">
                                <div style={{width:"200px"}} className="me-2">
                                    <Select
                                        options={data_provinsi()}
                                        value={data_provinsi().find(f=>f.value==data.province_id)}
                                        onChange={e=>{
                                            typeFilter({target:{name:"province_id", value:e.value}})
                                        }}
                                        placeholder="Pilih Provinsi"
                                    />
                                </div>
                                <div style={{width:"200px"}} className="me-2">
                                    <Select
                                        options={data_kab_kota()}
                                        value={data_kab_kota().find(f=>f.value==data.regency_id)}
                                        onChange={e=>{
                                            typeFilter({target:{name:"regency_id", value:e.value}})
                                        }}
                                        placeholder="Pilih Kabupaten/Kota"
                                    />
                                </div>
                                <div style={{width:"200px"}} className="me-2">
                                    <Select
                                        options={data_kecamatan()}
                                        value={data_kecamatan().find(f=>f.value==data.id_region)}
                                        onChange={e=>{
                                            typeFilter({target:{name:"id_region", value:e.value}})
                                        }}
                                        placeholder="Pilih Kecamatan"
                                    />
                                </div>
                                <div style={{width:"170px"}} className="me-2">
                                    <CreatableSelect
                                        options={data_tahun}
                                        value={data_tahun.find(f=>f.value==data.tahun)}
                                        onChange={e=>{
                                            typeFilter({target:{name:"tahun", value:e.value}})
                                        }}
                                        placeholder="Pilih Tahun"
                                    />
                                </div>
                            </div>
                            <div className="d-flex d-md-none justify-content-end mb-4">
                                <button
                                    type="button" 
                                    className="btn btn-secondary btn-icon-text"
                                    onClick={e=>setMobileShow(true)}
                                >
                                    <FiFilter className="btn-icon-prepend"/>
                                    Filter
                                </button>
                            </div>
                            <div className="table-responsive">
                                <table className="table table-hover table-hover table-custom table-wrap mb-0">
                                    <thead className="thead-light">
                                        <tr>
                                            <th className="" width="50">#</th>
                                            <th className="">Provinsi</th>
                                            <th className="">Kabupaten/Kota</th>
                                            <th className="">Kabupaten/Kota</th>
                                            <th className="">Bulan</th>
                                            <th className="">Input Ke</th>
                                            <th className="">Curah Hujan</th>
                                            <th className="">6.08</th>
                                            <th className="">0.944</th>
                                            <th className="">0.944xCH</th>
                                            <th className="">0.002297</th>
                                            <th className="">CH<sup>2</sup></th>
                                            <th className="">0.002297xCH<sup>2</sup></th>
                                            <th className="">Prediksi OPT</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {!data.is_loading?
                                            <>
                                                {data.data.map((list, idx)=>(
                                                    <tr key={list}>
                                                        <td className="align-middle">{(idx+1)}</td>
                                                        <td>{list.region.parent.parent.region}</td>
                                                        <td>{list.region.parent.region}</td>
                                                        <td>{list.region.region}</td>
                                                        <td>{list.bulan}</td>
                                                        <td>{list.input_ke}</td>
                                                        <td>{list.curah_hujan}</td>
                                                        <td className="">6.08</td>
                                                        <td className="">0.944</td>
                                                        <td className="">{list._0944xch}</td>
                                                        <td className="">0.002297</td>
                                                        <td className="">{list._ch2}</td>
                                                        <td className="">{list._0002297xch2}</td>
                                                        <td className="">{list.prediksi_alternaria_porri}</td>
                                                    </tr>
                                                ))}
                                                {data.data.length==0&&
                                                    <tr>
                                                        <td colSpan={14} className="text-center">Data tidak ditemukan!</td>
                                                    </tr>
                                                }
                                            </>
                                        :
                                            <tr>
                                                <td colSpan={14} className="text-center">
                                                    <div className="d-flex align-items-center justify-content-center">
                                                        <Spinner
                                                            as="span"
                                                            animation="border"
                                                            size="sm"
                                                            role="status"
                                                            aria-hidden="true"
                                                            className="me-2"
                                                        />
                                                        Loading...
                                                    </div>
                                                </td>
                                            </tr>
                                        }
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* FILTER MOBILE */}
            <Offcanvas show={mobile_show} onHide={()=>setMobileShow(false)} placement="end">
                <Offcanvas.Header closeButton>
                    <Offcanvas.Title>Filter</Offcanvas.Title>
                </Offcanvas.Header>
                <Offcanvas.Body>
                    <div className="d-flex flex-column mb-3 mt-3">
                        <div style={{width:"200px"}} className="me-2">
                            <Select
                                options={data_provinsi()}
                                value={data_provinsi().find(f=>f.value==data.province_id)}
                                onChange={e=>{
                                    typeFilter({target:{name:"province_id", value:e.value}})
                                }}
                                placeholder="Pilih Provinsi"
                            />
                        </div>
                        <div style={{width:"200px"}} className="me-2">
                            <Select
                                options={data_kab_kota()}
                                value={data_kab_kota().find(f=>f.value==data.regency_id)}
                                onChange={e=>{
                                    typeFilter({target:{name:"regency_id", value:e.value}})
                                }}
                                placeholder="Pilih Kabupaten/Kota"
                            />
                        </div>
                        <div style={{width:"200px"}} className="me-2">
                            <Select
                                options={data_kecamatan()}
                                value={data_kecamatan().find(f=>f.value==data.id_region)}
                                onChange={e=>{
                                    typeFilter({target:{name:"id_region", value:e.value}})
                                }}
                                placeholder="Pilih Kecamatan"
                            />
                        </div>
                        <div style={{width:"170px"}} className="me-2">
                            <CreatableSelect
                                options={data_tahun}
                                value={data_tahun.find(f=>f.value==data.tahun)}
                                onChange={e=>{
                                    typeFilter({target:{name:"tahun", value:e.value}})
                                }}
                                placeholder="Pilih Tahun"
                            />
                        </div>
                    </div>
                </Offcanvas.Body>
            </Offcanvas>
        </>
    )
}

const Infografis=({data, is_loading})=>{

    const line_chart_data=()=>{
        return {
            labels:data.data.map(d=>(d.bulan+"-"+d.input_ke)),
            datasets:[
                {
                    label:"Curah Hujan",
                    data:data.data.map(d=>d.curah_hujan),
                    borderWidth:1,
                    borderColor:"#3446eb",
                    backgroundColor:"#3446eb"
                },
                {
                    label:"Prediksi Alternaria Porri",
                    data:data.data.map(d=>d.prediksi_alternaria_porri),
                    borderWidth:1,
                    borderColor:"#eb8034",
                    backgroundColor:"#eb8034"
                }
            ]
        }
    }

    return (
        <div className="row mb-4">
            <div className="col-12">
                <div className="card">
                    <div className="card-header">
                        <h4 class="card-title mb-0">Infografis</h4>
                    </div>
                    <div className="card-body">
                        {!is_loading?
                            <LineChart 
                                labels={line_chart_data().labels}
                                datasets={line_chart_data().datasets}
                            />
                        :
                            <div className="d-flex align-items-center justify-content-center">
                                <Spinner
                                    as="span"
                                    animation="border"
                                    size="sm"
                                    role="status"
                                    aria-hidden="true"
                                    className="me-2"
                                />
                                <span>Loading...</span>
                            </div>
                        }
                    </div>
                </div>
            </div>
        </div>
    )
}


export default Frontpage