import { Layout } from '@/Components/layout';
import update from "immutability-helper"
import { Head, Link } from '@inertiajs/react';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { api } from '@/Config/api';
import CreatableSelect from 'react-select/creatable';
import classNames from 'classnames';
import {FiChevronLeft, FiChevronRight} from "react-icons/fi"
import { Modal, Spinner, Tab, Tabs } from 'react-bootstrap';
import { isUndefined } from '@/Config/config';
import { arrayMonths, ceil, numFix } from '@/Config/helpers';
import AnimateLineChart from '@/Components/Modules/animate_line_chart';
import { ToastApp } from '@/Components/toast';
import Select from "react-select"

export default class BantuanDPI extends React.Component{
    state={
        bantuan_dpi:{
            data:[],
            per_page:15,
            last_page:0,
            page:1,
            tahun:"",
            province_id:"",
            regency_id:"",
            district_id:"",
            q:"",
            is_loading:false
        },
        region:{
            provinsi:[],
            kab_kota:[],
            kecamatan:[]
        }
    }
    
    abortController=new AbortController()
    request={
        apiGetBantuanDPI:async(params)=>{
            this.abortController.abort()
            this.abortController=new AbortController()

            return await api().get("/frontpage/bantuan_dpi", {
                params:params,
                signal:this.abortController.signal
            })
            .then(res=>res.data)
        },
        apiGetsBantuanDPIRegion:async()=>{
            return await api().get("/frontpage/bantuan_dpi/region")
            .then(res=>res.data)
        }
    }

    componentDidMount=async()=>{
        const tahun=(new Date()).getFullYear()

        this.setState({
            bantuan_dpi:update(this.state.bantuan_dpi, {
                tahun:{$set:tahun}
            })
        }, ()=>{
            this.fetchBantuanDPI()
            this.fetchBantuanDPIRegion()
        })
    }

    
    fetchBantuanDPI=async()=>{
        const {data, ...params}=this.state.bantuan_dpi

        this.setLoading(true)
        await this.request.apiGetBantuanDPI(params)
        .then(data=>{
            this.setState({
                bantuan_dpi:update(this.state.bantuan_dpi, {
                    data:{$set:data.data},
                    page:{$set:data.current_page},
                    last_page:{$set:data.last_page},
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
    fetchBantuanDPIRegion=async()=>{
        await this.request.apiGetsBantuanDPIRegion()
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
            bantuan_dpi:update(this.state.bantuan_dpi, {
                is_loading:{$set:loading}
            })
        })
    }
    setPerPage=e=>{
        const target=e.target

        this.setState({
            bantuan_dpi:update(this.state.bantuan_dpi, {
                per_page:{$set:target.value},
                page:{$set:1}
            })
        }, ()=>{
            this.fetchBantuanDPI()
        })
    }
    goToPage=page=>{
        this.setState({
            bantuan_dpi:update(this.state.bantuan_dpi, {
                page:{$set:page}
            })
        }, ()=>{
            this.fetchBantuanDPI()
        })
    }
    typeFilter=e=>{
        const target=e.target

        this.setState({
            bantuan_dpi:update(this.state.bantuan_dpi, {
                page:{$set:1},
                [target.name]:{$set:target.value}
            })
        }, ()=>{
            switch(target.name){
                case "q":
                    if(this.timeout) clearTimeout(this.timeout)
                    this.timeout=setTimeout(()=>{
                        this.fetchBantuanDPI()
                    }, 500);
                break
                case "province_id":
                    this.setState({
                        bantuan_dpi:update(this.state.bantuan_dpi, {
                            regency_id:{$set:""},
                            district_id:{$set:""}
                        })
                    }, ()=>{
                        this.fetchBantuanDPI()
                    })
                break
                case "regency_id":
                    this.setState({
                        bantuan_dpi:update(this.state.bantuan_dpi, {
                            district_id:{$set:""}
                        })
                    }, ()=>{
                        this.fetchBantuanDPI()
                    })
                break
                case "district_id":
                case "tahun":
                    this.fetchBantuanDPI()
                break
            }
        })
    }
    timeout=0

    //HELPERS
    tahun_options=()=>{
        const year=(new Date()).getFullYear()

        let years=[]
        for(var i=year-2; i<=year+2; i++){
            years=years.concat([{value:i, label:i}])
        }

        return [{value:"", label:"Pilih Tahun"}].concat(years)
    }

    //ACTIONS

    render(){
        const {bantuan_dpi, region}=this.state

        return (
            <>
                <Head>
                    <title>Bantuan DPI</title>
                </Head>
                <Layout {...this.props}>
                    <div id="content-section" className='d-block' style={{marginTop:"80px", marginBottom:"80px"}}>
                        <div className='container'>
                            <div class="d-flex justify-content-between align-items-center flex-wrap grid-margin">
                                <div>
                                    <h4 class="mb-3 mb-md-0 fw-bold">Data Bantuan DPI</h4>
                                </div>
                                <div class="d-flex align-items-center flex-wrap text-nowrap">
                                </div>
                            </div>
                            <div className='row mt-4'>
                                <div className='col-12'>
                                    <Table
                                        data={bantuan_dpi}
                                        region={region}
                                        typeFilter={this.typeFilter}
                                        setPerPage={this.setPerPage}
                                        toggleDetail={this.toggleDetail}
                                        goToPage={this.goToPage}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </Layout>

                <ToastApp/>
            </>
        );
    }
}

const Table=({data, region, typeFilter, setPerPage, goToPage, toggleDetail})=>{

    //filter
    const data_provinsi=()=>{
        let prov=region.provinsi

        return [{label:"Semua Provinsi", value:""}].concat(prov.map(p=>{
            return {
                label:p.region,
                value:p.id_region
            }
        }))
    }
    const data_kab_kota=()=>{
        if(data.province_id==""){
            return [{label:"Semua Kabupaten/Kota", value:""}]
        }

        let filtered_kab_kota=region.kab_kota.filter(d=>d.nested==data.province_id)
        return [{label:"Semua Kabupaten/Kota", value:""}].concat(filtered_kab_kota.map(p=>{
            return {
                label:p.region,
                value:p.id_region
            }
        }))
    }
    const data_kecamatan=()=>{
        if(data.regency_id==""){
            return [{label:"Semua Kecamatan", value:""}]
        }

        let filtered_kecamatan=region.kecamatan.filter(d=>d.nested==data.regency_id)
        return [{label:"Semua Kecamatan", value:""}].concat(filtered_kecamatan.map(p=>{
            return {
                label:p.region,
                value:p.id_region
            }
        }))
    }
    const tahun_options=()=>{
        const year=(new Date()).getFullYear()

        let years=[]
        for(var i=year-2; i<=year+2; i++){
            years=years.concat([{value:i, label:i}])
        }

        return [{value:"", label:"Pilih Tahun"}].concat(years)
    }


    return (
        <div className='card'>
            <div className='card-body'>
                <div className='d-flex mb-4'>
                    <div style={{width:"200px"}} className="me-2">
                        <Select
                            options={data_provinsi()}
                            value={data_provinsi().find(f=>f.value==data.province_id)}
                            onChange={e=>{
                                typeFilter({target:{name:"province_id", value:e.value}})
                            }}
                            placeholder="Semua Provinsi"
                        />
                    </div>
                    <div style={{width:"200px"}} className="me-2">
                        <Select
                            options={data_kab_kota()}
                            value={data_kab_kota().find(f=>f.value==data.regency_id)}
                            onChange={e=>{
                                typeFilter({target:{name:"regency_id", value:e.value}})
                            }}
                            placeholder="Semua Kabupaten/Kota"
                        />
                    </div>
                    <div style={{width:"200px"}} className="me-2">
                        <Select
                            options={data_kecamatan()}
                            value={data_kecamatan().find(f=>f.value==data.district_id)}
                            onChange={e=>{
                                typeFilter({target:{name:"district_id", value:e.value}})
                            }}
                            placeholder="Semua Kecamatan"
                        />
                    </div>
                    <div style={{width:"200px"}} className='me-2'>
                        <CreatableSelect
                            options={tahun_options()}
                            onChange={e=>typeFilter({target:{name:"tahun", value:e.value}})}
                            value={tahun_options().find(f=>f.value==data.tahun)}
                            placeholder="Pilih Tahun"
                            styles={{
                                container:(baseStyles, state)=>({
                                    ...baseStyles,
                                    zIndex:998
                                })
                            }}
                        />
                    </div>
                    <div style={{width:"200px"}} className="me-2">
                        <input
                            type="text"
                            className="form-control"
                            name="q"
                            onChange={typeFilter}
                            value={data.q}
                            placeholder="Cari ..."
                        />
                    </div>
                </div>
                <div className="table-responsive">
                    <table className="table table-hover table-hover table-custom table-wrap mb-0">
                        <thead className="thead-light">
                            <tr>
                                <th className="" width="50">#</th>
                                <th className="" width="150">Provinsi</th>
                                <th className="" width="150">Kabupaten/Kota</th>
                                <th className="" width="150">Kecamatan</th>
                                <th className="">Kelompok Tani</th>
                                <th className="">Penanggung Jawab Kelompok Tani</th>
                                <th className="">Jenis Bantuan</th>
                                <th className="" width="80">Tahun Realisasi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {!data.is_loading?
                                <>
                                    {data.data.map((list, idx)=>(
                                        <tr key={list}>
                                                <td className="align-middle">{(idx+1)+((data.page-1)*data.per_page)}</td>
                                                <td>{list.region?.parent?.parent?.region}</td>
                                                <td>{list.region?.parent?.region}</td>
                                                <td>{list.region?.region}</td>
                                                <td>{list.kelompok_tani}</td>
                                                <td>{list.pj_kelompok_tani}</td>
                                                <td>{list.jenis_bantuan}</td>
                                                <td>{list.tahun}</td>
                                        </tr>
                                    ))}
                                    {data.data.length==0&&
                                        <tr>
                                            <td colSpan={8} className="text-center">Data tidak ditemukan!</td>
                                        </tr>
                                    }
                                </>
                            :
                                <>
                                    <tr>
                                        <td colSpan={8} className="text-center">
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
                                </>
                            }
                        </tbody>
                    </table>
                </div>
                <div className="d-flex align-items-center mt-4">
                    <div className="d-flex flex-column">
                        <div>Halaman {data.page} dari {data.last_page}</div>
                    </div>
                    <div className="d-flex align-items-center me-auto ms-3">
                        <select className="form-select" name="per_page" value={data.per_page} onChange={setPerPage}>
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
    )
}