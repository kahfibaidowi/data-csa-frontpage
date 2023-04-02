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
import { arrayMonths } from '@/Config/helpers';
import AnimateLineChart from '@/Components/Modules/animate_line_chart';

export default class JadwalTanam extends React.Component{
    state={
        curah_hujan:{
            data:[],
            per_page:15,
            last_page:0,
            page:1,
            tahun:"",
            q:"",
            is_loading:false
        },
        detail_curah_hujan:{
            is_open:false,
            data:{}
        }
    }

    componentDidMount=async()=>{
        const tahun=(new Date()).getFullYear()

        this.setState({
            curah_hujan:update(this.state.curah_hujan, {
                tahun:{$set:tahun}
            })
        }, ()=>{
            this.fetchJadwalTanamKecamatan()
        })
    }
    request={
        apiGetJadwalTanamKecamatan:async(params)=>{
            return await api().get("/frontpage/summary/type/jadwal_tanam_kecamatan", {
                params:params
            })
            .then(res=>res.data)
        }
    }
    fetchJadwalTanamKecamatan=async()=>{
        const {data, ...params}=this.state.curah_hujan

        this.setLoading(true)
        await this.request.apiGetJadwalTanamKecamatan(params)
        .then(data=>{
            this.setState({
                curah_hujan:update(this.state.curah_hujan, {
                    data:{$set:data.data},
                    page:{$set:data.current_page},
                    last_page:{$set:data.last_page},
                    is_loading:{$set:false}
                })
            })
        })
        .catch(err=>{
            toast.error("Gets Data Failed!", {position:"bottom-center"})
            this.setLoading(false)
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
    setPerPage=e=>{
        const target=e.target

        this.setState({
            curah_hujan:update(this.state.curah_hujan, {
                per_page:{$set:target.value},
                page:{$set:1}
            })
        }, ()=>{
            this.fetchJadwalTanamKecamatan()
        })
    }
    goToPage=page=>{
        this.setState({
            curah_hujan:update(this.state.curah_hujan, {
                page:{$set:page}
            })
        }, ()=>{
            this.fetchJadwalTanamKecamatan()
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
                case "q":
                    if(this.timeout) clearTimeout(this.timeout)
                    this.timeout=setTimeout(()=>{
                        this.fetchJadwalTanamKecamatan()
                    }, 500);
                break
                case "status":
                case "role":
                    this.fetchJadwalTanamKecamatan()
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
    toggleDetail=(show=false, data={})=>{
        this.setState({
            detail_curah_hujan:{
                is_open:show,
                data:data
            }
        })
    }

    render(){
        const {curah_hujan, detail_curah_hujan}=this.state

        return (
            <>
                <Head>
                    <title>Jadwal Tanam</title>
                </Head>
                <Layout {...this.props}>
                    <div id="content-section" className='d-block' style={{marginTop:"80px", marginBottom:"80px"}}>
                        <div className='container'>
                            <div class="d-flex justify-content-between align-items-center flex-wrap grid-margin">
                                <div>
                                    <h4 class="mb-3 mb-md-0 fw-bold">Jadwal Tanam</h4>
                                </div>
                                <div class="d-flex align-items-center flex-wrap text-nowrap">
                                    <div style={{minWidth:"150px"}}>
                                        <CreatableSelect
                                            options={this.tahun_options()}
                                            onChange={e=>this.typeFilter({target:{name:"tahun", value:e.value}})}
                                            value={this.tahun_options().find(f=>f.value==curah_hujan.tahun)}
                                            placeholder="Pilih Tahun"
                                            styles={{
                                                container:(baseStyles, state)=>({
                                                    ...baseStyles,
                                                    zIndex:998
                                                })
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className='row mt-4'>
                                <div className='col-12'>
                                    <Table
                                        data={curah_hujan}
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

                <ModalDetail
                    data={detail_curah_hujan}
                    hideModal={this.toggleDetail}
                />
            </>
        );
    }
}

const Table=({data, typeFilter, setPerPage, goToPage, toggleDetail})=>{
    return (
        <div className='card'>
            <div className='card-body'>
                <div className='d-flex mb-4'>
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
                                <th className="">Provinsi</th>
                                <th className="">Kabupaten/Kota</th>
                                <th className="">Kecamatan</th>
                                <th className="" width="50"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {!data.is_loading?
                                <>
                                    {data.data.map((list, idx)=>(
                                        <tr key={list}>
                                                <td className="align-middle">{(idx+1)+((data.page-1)*data.per_page)}</td>
                                                <td>{list.provinsi}</td>
                                                <td>{list.kabupaten_kota}</td>
                                                <td>{list.region}</td>
                                                <td className="text-nowrap p-1 align-middle">
                                                    <button type="button" className="btn btn-link p-0" onClick={e=>toggleDetail(true, list)}>
                                                        Detail
                                                    </button>
                                                </td>
                                        </tr>
                                    ))}
                                    {data.data.length==0&&
                                        <tr>
                                            <td colSpan={5} className="text-center">Data tidak ditemukan!</td>
                                        </tr>
                                    }
                                </>
                            :
                                <>
                                    <tr>
                                        <td colSpan={5} className="text-center">
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

const ModalDetail=({data, hideModal})=>{
    const [tab_open, setTabOpen]=useState("cabai-besar")
    const ch_toleransi=20

    useEffect(()=>{
        if(data.is_open==true){
            setTabOpen("cabai-besar")
        }
    }, [data])

    const curah_hujan=()=>{
        let curah_hujan=!isUndefined(data.data.curah_hujan)?data.data.curah_hujan:[]

        let new_curah_hujan=[]
        months_year().map(month=>{
            for(var i=1; i<=3; i++){
                const find_curah_hujan=curah_hujan.find(f=>f.bulan.toString()==month.toString() && f.input_ke.toString()==i.toString())
                if(!isUndefined(find_curah_hujan)){
                    new_curah_hujan=new_curah_hujan.concat([find_curah_hujan])
                }
                else{
                    const data_curah_hujan={
                        id_region:"",
                        input_ke:i,
                        bulan:month,
                        tahun:"",
                        curah_hujan:"",
                        curah_hujan_normal:""
                    }
                    new_curah_hujan=new_curah_hujan.concat([data_curah_hujan])
                }
            }
        })

        return new_curah_hujan
    }

    //VALUES
    const jadwal_tanam_cabai_besar=()=>{
        let ch_ignore=[]
        let ch_data=[]
        let min=100-ch_toleransi
        let max=200+ch_toleransi
        let ch_raw=curah_hujan()

        ch_raw.map((ch, idx)=>{
            let found=true
            if(idx>27){
                found=false
            }
            else{
                for(var i=idx; i<idx+9; i++){
                    if(ch_raw[i].curah_hujan.toString().trim()==""){
                        found=false
                        break
                    }
                    if(Number(ch_raw[i].curah_hujan)<min || Number(ch_raw[i].curah_hujan)>max){
                        found=false
                        break
                    }
                    if(ch_ignore.includes(idx)){
                        found=false
                        break
                    }
                }
            }

            if(found){
                ch_ignore=ch_ignore.concat([
                    idx, idx+1, idx+2, idx+3, idx+4, idx+5, idx+6, idx+7, idx+8
                ])
                ch_data=ch_data.concat([
                    {
                        text:arrayMonths[ch.bulan-1]+" "+ch.input_ke+" - "+arrayMonths[ch_raw[idx+8].bulan-1]+" "+ch_raw[idx+8].input_ke,
                        data:[ch, ch_raw[idx+1], ch_raw[idx+2], ch_raw[idx+3], ch_raw[idx+4], ch_raw[idx+5], ch_raw[idx+6], ch_raw[idx+7], ch_raw[idx+8]]
                    }
                ])
            }
        })

        return ch_data
    }
    const jadwal_tanam_cabai_rawit=()=>{
        let ch_ignore=[]
        let ch_data=[]
        let min=85-ch_toleransi
        let max=250+ch_toleransi
        let ch_raw=curah_hujan()

        ch_raw.map((ch, idx)=>{
            let found=true
            if(idx>27){
                found=false
            }
            else{
                for(var i=idx; i<idx+9; i++){
                    if(ch_raw[i].curah_hujan.toString().trim()==""){
                        found=false
                        break
                    }
                    if(Number(ch_raw[i].curah_hujan)<min || Number(ch_raw[i].curah_hujan)>max){
                        found=false
                        break
                    }
                    if(ch_ignore.includes(idx)){
                        found=false
                        break
                    }
                }
            }

            if(found){
                ch_ignore=ch_ignore.concat([
                    idx, idx+1, idx+2, idx+3, idx+4, idx+5, idx+6, idx+7, idx+8
                ])
                ch_data=ch_data.concat([
                    {
                        text:arrayMonths[ch.bulan-1]+" "+ch.input_ke+" - "+arrayMonths[ch_raw[idx+8].bulan-1]+" "+ch_raw[idx+8].input_ke,
                        data:[ch, ch_raw[idx+1], ch_raw[idx+2], ch_raw[idx+3], ch_raw[idx+4], ch_raw[idx+5], ch_raw[idx+6], ch_raw[idx+7], ch_raw[idx+8]]
                    }
                ])
            }
        })

        return ch_data
    }
    const jadwal_tanam_bawang_merah=()=>{
        let ch_ignore=[]
        let ch_data=[]
        let min=30-ch_toleransi
        let max=200+ch_toleransi
        let ch_raw=curah_hujan()

        ch_raw.map((ch, idx)=>{
            let found=true
            if(idx>27){
                found=false
            }
            else{
                for(var i=idx; i<idx+9; i++){
                    if(ch_raw[i].curah_hujan.toString().trim()==""){
                        found=false
                        break
                    }
                    if(Number(ch_raw[i].curah_hujan)<min || Number(ch_raw[i].curah_hujan)>max){
                        found=false
                        break
                    }
                    if(ch_ignore.includes(idx)){
                        found=false
                        break
                    }
                }
            }

            if(found){
                ch_ignore=ch_ignore.concat([
                    idx, idx+1, idx+2, idx+3, idx+4, idx+5, idx+6, idx+7, idx+8
                ])
                ch_data=ch_data.concat([
                    {
                        text:arrayMonths[ch.bulan-1]+" "+ch.input_ke+" - "+arrayMonths[ch_raw[idx+8].bulan-1]+" "+ch_raw[idx+8].input_ke,
                        data:[ch, ch_raw[idx+1], ch_raw[idx+2], ch_raw[idx+3], ch_raw[idx+4], ch_raw[idx+5], ch_raw[idx+6], ch_raw[idx+7], ch_raw[idx+8]]
                    }
                ])
            }
        })

        return ch_data
    }

    //HELPERS
    const months_year=()=>{
        let months=[]
        for(var i=1; i<=12; i++){
            months=months.concat([i])
        }

        return months
    }

    return (
        <Modal show={data.is_open} onHide={hideModal} backdrop="static" size="lg" scrollable>
            <Modal.Header closeButton>
                <h4 className="modal-title">Detail Jadwal Tanam</h4>
            </Modal.Header>
            <Modal.Body>
                <table cellPadding="5">
                    <tr>
                        <th width="180">Provinsi</th>
                        <td width="10">:</td>
                        <td>{data.data?.provinsi}</td>
                    </tr>
                    <tr>
                        <th width="180">Kabupaten/Kota</th>
                        <td width="10">:</td>
                        <td>{data.data?.kabupaten_kota}</td>
                    </tr>
                    <tr>
                        <th valign="top" width="180">Kecamatan</th>
                        <td valign="top" width="10">:</td>
                        <td>{data.data?.region}</td>
                    </tr>
                </table>
                <Tabs
                    defaultActiveKey="cabai-besar"
                    id="tab-detail-jadwal-tanam"
                    className="mb-3 mt-3"
                    onSelect={e=>setTabOpen(e)}
                >
                    <Tab eventKey="cabai-besar" title="Cabai Besar">
                        <p>Curah hujan optimal untuk cabai merah adalah <strong>100-200mm/bulan</strong></p>
                        <div className="table-responsive mt-3">
                            <table className="table table-hover table-hover table-custom table-wrap mb-0">
                                <thead className="thead-light">
                                    <tr>
                                        <th className="" width="50">#</th>
                                        <th className="">Jadwal Tanam Optimal</th>
                                        <th className="">Analisa</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {jadwal_tanam_cabai_besar().map((list, idx)=>(
                                        <tr>
                                            <td>{idx+1}</td>
                                            <td>{list.text}</td>
                                            <td>
                                                <ul>
                                                    {list.data.map(ch=>(
                                                        <li>{arrayMonths[ch.bulan-1]} {ch.input_ke} CH={ch.curah_hujan}</li>
                                                    ))}
                                                </ul>
                                            </td>
                                        </tr>
                                    ))}
                                    {jadwal_tanam_cabai_besar().length==0&&
                                        <tr>
                                            <td colSpan={3} className="text-center">
                                                <div className="d-flex align-items-center justify-content-center">
                                                    Data tidak ditemukan!
                                                </div>
                                            </td>
                                        </tr>
                                    }
                                </tbody>
                            </table>
                        </div>
                    </Tab>
                    <Tab eventKey="cabai-rawit" title="Cabai Rawit">
                        <p>Curah hujan optimal untuk cabai rawit adalah <strong>85-250mm/bulan</strong></p>
                        <div className="table-responsive mt-3">
                            <table className="table table-hover table-hover table-custom table-wrap mb-0">
                                <thead className="thead-light">
                                    <tr>
                                        <th className="" width="50">#</th>
                                        <th className="">Jadwal Tanam Optimal</th>
                                        <th className="">Analisa</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {jadwal_tanam_cabai_rawit().map((list, idx)=>(
                                        <tr>
                                            <td>{idx+1}</td>
                                            <td>{list.text}</td>
                                            <td>
                                                <ul>
                                                    {list.data.map(ch=>(
                                                        <li>{arrayMonths[ch.bulan-1]} {ch.input_ke} CH={ch.curah_hujan}</li>
                                                    ))}
                                                </ul>
                                            </td>
                                        </tr>
                                    ))}
                                    {jadwal_tanam_cabai_rawit().length==0&&
                                        <tr>
                                            <td colSpan={3} className="text-center">
                                                <div className="d-flex align-items-center justify-content-center">
                                                    Data tidak ditemukan!
                                                </div>
                                            </td>
                                        </tr>
                                    }
                                </tbody>
                            </table>
                        </div>
                    </Tab>
                    <Tab eventKey="bawang-merah" title="Bawang Merah">
                        <p>Curah hujan optimal untuk bawang merah adalah <strong>30-200mm/bulan</strong></p>
                        <div className="table-responsive mt-3">
                            <table className="table table-hover table-hover table-custom table-wrap mb-0">
                                <thead className="thead-light">
                                    <tr>
                                        <th className="" width="50">#</th>
                                        <th className="">Jadwal Tanam Optimal</th>
                                        <th className="">Analisa</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {jadwal_tanam_bawang_merah().map((list, idx)=>(
                                        <tr>
                                            <td>{idx+1}</td>
                                            <td>{list.text}</td>
                                            <td>
                                                <ul>
                                                    {list.data.map(ch=>(
                                                        <li>{arrayMonths[ch.bulan-1]} {ch.input_ke} CH={ch.curah_hujan}</li>
                                                    ))}
                                                </ul>
                                            </td>
                                        </tr>
                                    ))}
                                    {jadwal_tanam_bawang_merah().length==0&&
                                        <tr>
                                            <td colSpan={3} className="text-center">
                                                <div className="d-flex align-items-center justify-content-center">
                                                    Data tidak ditemukan!
                                                </div>
                                            </td>
                                        </tr>
                                    }
                                </tbody>
                            </table>
                        </div>
                    </Tab>
                </Tabs>
                <div className='mt-3'>
                    <span className='fw-semibold fs-5 d-flex mb-2'>Grafik Curah Hujan</span>
                    {data.is_open&&
                        <AnimateLineChart
                            data={curah_hujan()}
                        />
                    }
                </div>
            </Modal.Body>
            <Modal.Footer className="mt-3 border-top pt-2">
                <button 
                    type="button" 
                    className="btn btn-link text-gray me-auto" 
                    onClick={e=>hideModal()}
                >
                    Tutup
                </button>
            </Modal.Footer>
        </Modal>
    )
}