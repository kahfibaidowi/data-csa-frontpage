import { Bar, Line } from "react-chartjs-2"
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

export default function LineChart({datasets=[], labels=[]}){
    //actions

    return (
        <>
            <div>
                <Line
                    data={{
                        labels:labels,
                        datasets:datasets
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
                                display:true,
                                align:"center",
                                position:"bottom"
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