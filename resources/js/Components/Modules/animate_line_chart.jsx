import { Line } from "react-chartjs-2"
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    defaults
} from 'chart.js';
import React, { useEffect, useState } from "react"
import { isUndefined } from "@/Config/config";

defaults.font.family="Poppins"

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

export default function AnimateLineChart({data=[]}){
    const [data_ch, setDataCH]=useState({
        pos:0,
        data:Array(36).fill(null)
    })
    const [data_chn, setDataCHN]=useState({
        pos:0,
        data:Array(36).fill(null)
    })

    useEffect(()=>{
        if(data_ch.pos<36){
            let curah_hujan=data

            setTimeout(()=>{
                setDataCH(({pos, data})=>{
                    if(!isUndefined(curah_hujan[pos])){
                        data[pos]=curah_hujan[pos].curah_hujan!=""?curah_hujan[pos].curah_hujan:null
                    }
                    else{
                        data[pos]=null
                    }

                    return {
                        pos:pos+1,
                        data:data
                    }
                })
            }, 60)
        }
        if(data_chn.pos<36){
            let curah_hujan=data

            setTimeout(()=>{
                setDataCHN(({pos, data})=>{
                    if(!isUndefined(curah_hujan[pos])){
                        data[pos]=curah_hujan[pos].curah_hujan_normal!=""?curah_hujan[pos].curah_hujan_normal:null
                    }
                    else{
                        data[pos]=null
                    }

                    return {
                        pos:pos+1,
                        data:data
                    }
                })
            }, 60)
        }
    }, [data_ch, data_chn])

    const labels=()=>{
        let value=[]
        for(var i=1; i<=36; i++){
            value=value.concat([i])
        }

        return value
    }
    const data_generated=()=>{
        return [
            {
                label:"Curah Hujan Prediksi",
                disabled:false,
                data:data_ch.data,
                color:"#78799a",
                weight:1,
                pointRadius:0
            },
            {
                label:"Curah Hujan Normal",
                disabled:false,
                data:data_chn.data,
                color:"#0099ff",
                weight:1,
                pointRadius:0
            }
        ]
    }

    //actions

    return (
        <>
            <div style={{width:"100%", minWidth:"766px", height:"300px", position:"relative"}}>
                <Line
                    data={{
                        labels:labels(),
                        datasets:data_generated().map(bj=>{
                            return {
                                label:bj.label,
                                data:bj.data,
                                borderWidth:bj.weight,
                                borderColor:bj.color,
                                backgroundColor:bj.color,
                                pointRadius:bj.pointRadius
                            }
                        })
                    }}
                    options={{
                        scales:{
                            x:{
                                grid:{
                                    display:true
                                }
                            }
                        },
                        plugins:{
                            legend:{
                                display:true,
                                align:"start"
                            }
                        },
                        interaction:{
                            intersect:false,
                            mode:"index"
                        },
                        responsive:true,
                        maintainAspectRatio:false
                    }}
                />
            </div>
        </>
    )
}