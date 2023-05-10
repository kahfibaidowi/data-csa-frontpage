import { Layout } from "@/Components/layout"
import { api } from "@/Config/api"
import update from "immutability-helper"
import axios from "axios"
import React, { useEffect, useState } from "react"
import MapWindy from "@/Components/Modules/map_windy"
import { BASE_URL, isUndefined } from "@/Config/config"
import { Head } from "@inertiajs/react"
import { toast, ToastContainer } from "react-toastify"
import { FiChevronDown, FiChevronLeft, FiChevronRight, FiCloudRain, FiHome, FiMenu, FiWind } from "react-icons/fi"
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



class Frontpage extends React.Component{
    state={
        sebaran_opt:{
            infografis:{},
            data:[],
            page:1,
            per_page:15,
            last_page:1,
            komoditas:"",
            tahun:"",
            bulan:"",
            provinsi:"",
            kab_kota:"",
            is_loading:false
        },
        region:{
            provinsi:[],
            kab_kota:[]
        }
    }

    componentDidMount=async()=>{
        this.fetchSebaranOptRegion()
        this.fetchSebaranOpt()
    }

    abortController=new AbortController()
    request={
        apiGetsSebaranOpt:async(params)=>{
            this.abortController.abort()
            this.abortController=new AbortController()

            return await api().get("/frontpage/sebaran_opt", {
                params:params,
                signal:this.abortController.signal
            })
            .then(res=>res.data)
        },
        apiGetsSebaranOptRegion:async()=>{
            return await api().get("/frontpage/sebaran_opt/region")
            .then(res=>res.data)
        }
    }
    fetchSebaranOpt=async()=>{
        const {data, infografis, ...params}=this.state.sebaran_opt

        this.setLoading(true)
        await this.request.apiGetsSebaranOpt(params)
        .then(data=>{
            this.setState({
                sebaran_opt:update(this.state.sebaran_opt, {
                    infografis:{$set:data.infografis},
                    data:{$set:data.data.data},
                    page:{$set:data.data.current_page},
                    last_page:{$set:data.data.last_page},
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
    fetchSebaranOptRegion=async()=>{
        await this.request.apiGetsSebaranOptRegion()
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
            sebaran_opt:update(this.state.sebaran_opt, {
                is_loading:{$set:loading}
            })
        })
    }
    setPerPage=e=>{
        const target=e.target

        this.setState({
            sebaran_opt:update(this.state.sebaran_opt, {
                per_page:{$set:target.value},
                page:{$set:1}
            })
        }, ()=>{
            this.fetchSebaranOpt()
        })
    }
    goToPage=page=>{
        this.setState({
            sebaran_opt:update(this.state.sebaran_opt, {
                page:{$set:page}
            })
        }, ()=>{
            this.fetchSebaranOpt()
        })
    }
    typeFilter=e=>{
        const target=e.target

        this.setState({
            sebaran_opt:update(this.state.sebaran_opt, {
                page:{$set:1},
                [target.name]:{$set:target.value}
            })
        }, ()=>{
            switch(target.name){
                case "provinsi":
                    this.setState({
                        sebaran_opt:update(this.state.sebaran_opt, {
                            kab_kota:{$set:""}
                        })
                    }, ()=>{
                        this.fetchSebaranOpt()
                    })
                break;
                default:
                    this.fetchSebaranOpt()
            }
        })
    }
    timeout=0

    render(){
        const {sebaran_opt, region}=this.state

        return (
            <>
                <Head>
                    <title>Sebaran OPT</title>
                </Head>
                
                <Layout {...this.props}>
                    <div id="content-section" className='d-block' style={{marginTop:"80px", marginBottom:"80px"}}>
                        <div className='container'>
                            <div class="d-flex justify-content-between align-items-center flex-wrap grid-margin">
                                <div>
                                    <h4 class="mb-3 mb-md-0 fw-bold">Sebaran OPT</h4>
                                </div>
                                <div class="d-flex align-items-center flex-wrap text-nowrap">
                                    <div style={{minWidth:"150px"}}>
                                    </div>
                                </div>
                            </div>
                            
                            <TableSebaranOpt 
                                data={sebaran_opt}
                                region={region}
                                setPerPage={this.setPerPage}
                                goToPage={this.goToPage}
                                typeFilter={this.typeFilter}
                            />

                            <Infografis 
                                data={sebaran_opt.infografis}
                                is_loading={sebaran_opt.is_loading}
                            />
                        </div>
                    </div>
                </Layout>
            </>
        )
    }
}


const TableSebaranOpt=({data, region, setPerPage, goToPage, typeFilter})=>{

    //filter
    const data_komoditas=[
        {label:"Semua Komoditas", value:""},
        {label:"Aneka Cabai", value:"Aneka Cabai"},
        {label:"Bawang Merah", value:"Bawang Merah"}
    ]
    const data_tahun=[
        {label:"Semua Tahun", value:""},
        {label:"2020", value:"2020"},
        {label:"2021", value:"2021"},
        {label:"2022", value:"2022"}
    ]
    const data_bulan=()=>{
        return [{label:"Semua Bulan", value:""}].concat(Array.from({length:12}, (_, i)=>{
            return {
                label:i+1,
                value:i+1
            }
        }))
    }
    const data_provinsi=()=>{
        let prov=region.provinsi

        return [{label:"Semua Provinsi", value:""}].concat(prov.map(p=>{
            return {
                label:p.provinsi,
                value:p.provinsi
            }
        }))
    }
    const data_kab_kota=()=>{
        if(data.provinsi==""){
            return [{label:"Semua Kabupaten/Kota", value:""}]
        }

        let filtered_kab_kota=region.kab_kota.filter(d=>d.provinsi==data.provinsi)
        return [{label:"Semua Kabupaten/Kota", value:""}].concat(filtered_kab_kota.map(p=>{
            return {
                label:p.kab_kota,
                value:p.kab_kota
            }
        }))
    }

    return (
        <>
            <div className="row mb-4">
                <div className="col-12">
                    <div className="card mb-4">
                        <div className="card-body p-4">
                            <div className="d-flex mb-3 mt-3">
                                <div style={{width:"200px"}} className="me-2">
                                    <Select
                                        options={data_provinsi()}
                                        value={data_provinsi().find(f=>f.value==data.provinsi)}
                                        onChange={e=>{
                                            typeFilter({target:{name:"provinsi", value:e.value}})
                                        }}
                                        placeholder="Semua Provinsi"
                                    />
                                </div>
                                <div style={{width:"200px"}} className="me-2">
                                    <Select
                                        options={data_kab_kota()}
                                        value={data_kab_kota().find(f=>f.value==data.kab_kota)}
                                        onChange={e=>{
                                            typeFilter({target:{name:"kab_kota", value:e.value}})
                                        }}
                                        placeholder="Semua Kabupaten/Kota"
                                    />
                                </div>
                                <div style={{width:"200px"}} className="me-2">
                                    <Select
                                        options={data_komoditas}
                                        value={data_komoditas.find(f=>f.value==data.komoditas)}
                                        onChange={e=>{
                                            typeFilter({target:{name:"komoditas", value:e.value}})
                                        }}
                                        placeholder="Semua Komoditas"
                                    />
                                </div>
                                <div style={{width:"170px"}} className="me-2">
                                    <Select
                                        options={data_tahun}
                                        value={data_tahun.find(f=>f.value==data.tahun)}
                                        onChange={e=>{
                                            typeFilter({target:{name:"tahun", value:e.value}})
                                        }}
                                        placeholder="Semua Tahun"
                                    />
                                </div>
                                <div style={{width:"170px"}} className="me-2">
                                    <Select
                                        options={data_bulan()}
                                        value={data_bulan().find(f=>f.value==data.bulan)}
                                        onChange={e=>{
                                            typeFilter({target:{name:"bulan", value:e.value}})
                                        }}
                                        placeholder="Semua Bulan"
                                    />
                                </div>
                            </div>
                            <div className="table-responsive">
                                <table className="table table-hover table-hover table-custom table-wrap mb-0">
                                    <thead className="thead-light">
                                        <tr>
                                            <th className="" width="50">#</th>
                                            <th className="">Bulan</th>
                                            <th className="">Tahun</th>
                                            <th className="">Provinsi</th>
                                            <th className="">Kabupaten/Kota</th>
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
                                        {!data.is_loading?
                                            <>
                                                {data.data.map((list, idx)=>(
                                                    <tr key={list}>
                                                        <td className="align-middle">{(idx+1)+((data.page-1)*data.per_page)}</td>
                                                        <td>{list.bulan}</td>
                                                        <td>{list.tahun}</td>
                                                        <td>{list.provinsi}</td>
                                                        <td>{list.kab_kota}</td>
                                                        <td>{list.komoditas}</td>
                                                        <td>{list.opt}</td>
                                                        <td>{list.lts_ringan}</td>
                                                        <td>{list.lts_sedang}</td>
                                                        <td>{list.lts_berat}</td>
                                                        <td>{list.sum_lts}</td>
                                                        <td>{list.lts_puso}</td>
                                                    </tr>
                                                ))}
                                                {data.data.length==0&&
                                                    <tr>
                                                        <td colSpan={12} className="text-center">Data tidak ditemukan!</td>
                                                    </tr>
                                                }
                                            </>
                                        :
                                            <tr>
                                                <td colSpan={12} className="text-center">
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
                            <div className="d-flex align-items-center mt-4">
                                <div className="d-flex flex-column">
                                    <div>Halaman {data.page} dari {data.last_page}</div>
                                </div>
                                <div className="d-flex align-items-center me-auto ms-3">
                                    <select className="form-select" name="per_page" value={data.per_page} onChange={e=>setPerPage(e)}>
                                        <option value="15">15 Data</option>
                                        <option value="25">25 Data</option>
                                        <option value="50">50 Data</option>
                                        <option value="100">100 Data</option>
                                    </select>
                                </div>
                                <div className="d-flex ms-3">
                                    <button 
                                        className={classNames(
                                            "btn",
                                            "border-0",
                                            {"btn-secondary":data.page>1}
                                        )}
                                        disabled={data.page<=1}
                                        onClick={()=>goToPage(data.page-1)}
                                    >
                                        <FiChevronLeft/>
                                        Prev
                                    </button>
                                    <button 
                                        className={classNames(
                                            "btn",
                                            "border-0",
                                            {"btn-secondary":data.page<data.last_page},
                                            "ms-2"
                                        )}
                                        disabled={data.page>=data.last_page}
                                        onClick={()=>goToPage(data.page+1)}
                                    >
                                        Next
                                        <FiChevronRight/>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

const Infografis=({data, is_loading})=>{

    return (
        <div className="row mb-4">
            <div className="col-12">
                <div className="card">
                    <div className="card-header">
                        <h4 class="card-title mb-0">Infografis</h4>
                    </div>
                    <div className="card-body">
                        {!is_loading?
                            <BarChart 
                                labels={["LTS Ringan", "LTS Sedang", "LTS Berat", "Sum LTS", "LTS Puso"]}
                                data={[data.sum_lts_ringan, data.sum_lts_sedang, data.sum_lts_berat, data.sum_sum_lts, data.sum_lts_puso]}
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