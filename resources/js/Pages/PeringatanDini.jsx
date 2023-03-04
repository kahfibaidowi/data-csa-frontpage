import { Layout } from "@/Components/layout"
import { api } from "@/Config/api"
import axios from "axios"
import React from "react"
import MapWindy from "@/Components/Modules/map_windy"
import { isUndefined } from "@/Config/config"



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
        banjir:[],
        kekeringan:[],
        loaded:false
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
            return await api().get("/frontpage/summary/type/sifat_hujan_kabupaten_kota", {
                params:{
                    tahun:tahun
                }
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
    fetchSummaryEwsProduksi=async()=>{
        const {tahun}=this.state

        await this.request.apiGetSummaryEwsProduksi(tahun)
        .then(data=>{
            const bawang_merah=data.data.find(f=>f.type=="bawang_merah")
            const cabai_besar=data.data.find(f=>f.type=="cabai_besar")
            const cabai_rawit=data.data.find(f=>f.type=="cabai_rawit")

            this.setState({
                summary_ews_produksi:{
                    bawang_merah:!isUndefined(bawang_merah)?bawang_merah.total_produksi:0,
                    cabai_besar:!isUndefined(cabai_besar)?cabai_besar.total_produksi:0,
                    cabai_rawit:!isUndefined(cabai_rawit)?cabai_rawit.total_produksi:0
                }
            })
        })
        .catch(err=>{
            toast.error("Gets Data Failed!", {position:"bottom-center"})
        })
    }
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
            
            this.setState({
                map_curah_hujan:geo_features
            })
        })
        .catch(err=>{
            toast.error("Gets Data Failed!", {position:"bottom-center"})
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
                this.fetchSummaryEwsProduksi()
                this.fetchSummarySifatHujanKecamatan()
            }
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
        const {tahun, map_curah_hujan, loaded}=this.state

        return (
            <>
                <Layout withFooter={false}>
                    <div className="container-fluid px-0 overflow-hidden">
                        <div className="row" style={{height:"calc(100vh - 50px)", marginTop:"50px"}}>
                            <div className="col-12 h-100">
                                <div class="card h-100">
                                    <div class="card-body px-0" style={{height:"100%"}}>
                                        <MapWindy
                                            data={map_curah_hujan} 
                                            className="map-responsive-2"
                                            typeTahun={this.typeTahun}
                                            tahun={tahun}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </Layout>
            </>
        )
    }
}

export default Frontpage