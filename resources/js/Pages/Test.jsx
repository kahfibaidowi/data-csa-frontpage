import React from "react"
import L from "leaflet"
import geojsonvt from "geojson-vt"
window.geojsonvt = geojsonvt
import "leaflet-geojson-vt/src/leaflet-geojson-vt"
import { toast } from "react-toastify"
import { api } from "@/Config/api"
import { isUndefined } from "@/Config/config"
import { ceil } from "@/Config/helpers"
import { MapContainer, TileLayer } from "react-leaflet"
import { useEffect } from "react"
import { FiMenu } from "react-icons/fi"
import Select from "react-select"
import CreatableSelect from "react-select/creatable"
import haversine from "haversine-distance"


export default function Page(props){
    const coord_1={latitude:-7.631852692878734, longitude:111.59402561081824}
    const coord_2={latitude:-7.577497957333282, longitude:111.95056465625339}

    useEffect(async()=>{
        // Check if site's storage has been marked as persistent
        if (navigator.storage && navigator.storage.persist) {
            const isPersisted=await navigator.storage.persisted();
            console.log(`Persisted storage granted: ${isPersisted}`);
        }
    }, [])
    
    return (
        <div>jaraknya : {haversine(coord_1, coord_2)}</div>
    )
}