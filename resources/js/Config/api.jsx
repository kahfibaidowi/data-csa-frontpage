import axios from "axios";
import { BASE_URL, BASE_URL_XP } from "./config";


export const api=(jwt_token="")=>{
    let config={
        'content-type':'application/json'
    }

    if(jwt_token!=""){
        config.Authorization=`Bearer ${jwt_token}`
    }

    return axios.create({
        baseURL:BASE_URL,
        headers:config
    })
}
export const api_express=()=>{
    let config={
        'content-type':'application/json'
    }

    return axios.create({
        baseURL:BASE_URL_XP,
        headers:config
    })
}