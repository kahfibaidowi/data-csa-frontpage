import { Bar } from "react-chartjs-2"
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
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
    BarElement,
    Title,
    Tooltip,
    Legend
);

export default function BarChart({data=[], labels=[]}){
    //actions

    return (
        <>
            <div>
                <Bar
                    data={{
                        labels:labels,
                        datasets:[
                            {
                                data:data,
                                borderWidth:1,
                                borderColor:"#3632a8",
                                backgroundColor:"#3632a8"
                            }
                        ]
                    }}
                    options={{
                        scales:{
                            x:{
                                grid:{
                                    display:false
                                }
                            }
                        },
                        plugins:{
                            legend:{
                                display:false,
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
                    height="400px"
                />
            </div>
        </>
    )
}