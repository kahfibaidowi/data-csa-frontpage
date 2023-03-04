import { useCallback, useRef, useState, useEffect } from "react";


//url
export const BASE_URL=process.env.NODE_ENV==="development"?
    "http://localhost/data-csa/public":
    "https://api.ews.tifpsdku.com";

//windy
export const WINDY_KEY="HvSDfrRvwQCr6g4WSF5WFBh3zlvWajN8"

//login storage
export const login_data=()=>{
    const data=localStorage.getItem("login_data")
    return JSON.parse(data)
}
export const is_login=()=>{
    const user_data=localStorage.getItem("login_data")

    if(user_data!==null){
        return true
    }
    else{
        return false
    }
}
export const access_token=()=>{
    if(is_login()){
        return login_data().access_token
    }
    else{
        return ""
    }
}

//theme
export const get_theme=()=>{
    const theme=localStorage.getItem("preferences.theme")

    if(theme!==null){
        return theme
    }
    else{
        return "light"
    }
}
export const get_sidebar=()=>{
    const theme=localStorage.getItem("preferences.sidebar")

    if(theme!==null){
        return theme
    }
    else{
        return "dark"
    }
}
export const get_sidebar_collapsed=()=>{
    const theme=localStorage.getItem("preferences.sidebar_collapsed")

    if(theme!==null){
        return JSON.parse(theme)
    }
    else{
        return {
            is_open:false,
            is_folded:false
        }
    }
}
export const set_theme=(theme)=>{
    localStorage.setItem("preferences.theme", theme)
}
export const set_sidebar=(theme)=>{
    localStorage.setItem("preferences.sidebar", theme)
}
export const set_sidebar_collapsed=(theme)=>{
    localStorage.setItem("preferences.sidebar_collapsed", JSON.stringify(theme))
}

//mapbox
export const mapbox_access_token="pk.eyJ1IjoiZGFybWF3YW4xNCIsImEiOiJjbGNjcGwxaHo0YWh3M3dtbnF5bHV5aHRkIn0.0YIhpyNutx_k_B_5AteECw"

//helper
export const useStateCallback=(initialState)=>{
    const [state, setState]=useState(initialState)
    const cbRef=useRef(null)
  
    const setStateCallback=useCallback((state, cb)=>{
      cbRef.current=cb
      setState(state)
    }, [])
  
    useEffect(()=>{
      if(cbRef.current){
        cbRef.current(state)
        cbRef.current=null
      }
    }, [state])

    return [state, setStateCallback]
}
export const is_object=v=>{
    if(typeof v==='object' && v!=null){
        return true
    }
    return false
}
export const isUndefined=v=>{
    if(typeof v==="undefined") return true
    else return false
}
export const akronim=str=>{
    if(str.trim()===""){
        return ""
    }
    else{
        const matches=str.match(/\b(\w)/g)
        return matches.join('').toUpperCase().substring(0, 2)
    }
}
export const get_file=str=>{
    const data=str.split("__")
    return data[data.length-1]
}
export const name_slice=(str)=>{
    if(isUndefined(str)){
        return ""
    }
    
    const first_name=ucwords(str.replace(/ .*/,''))

    if(first_name.length>7){
        return first_name.substring(0, 5)+"..."
    }
    else{
        return first_name
    }
}
export const ucwords=str=>{
    if(isUndefined(str)){
        return ""
    }
    const text=str.toLowerCase().replace(/\b[a-z]/g, function(letter) {
        return letter.toUpperCase();
    })

    return text
}
export const ceil_with_enclosure=(number, enclosure=0.5)=>{
    const int_number=Math.floor(number);

    if(number<=int_number+enclosure){
        return Math.floor(number);
    }
    else{
        return Math.round(number);
    }
}
export const random_rgba=()=>{
    var o = Math.round, r = Math.random, s = 255;
    return 'rgba(' + o(r()*s) + ',' + o(r()*s) + ',' + o(r()*s) + ',1)';
}
export function readFile(fileRes){
    return new Promise((resolve, reject)=>{
        const reader=new FileReader()
        reader.readAsArrayBuffer(fileRes)
        reader.onload=()=>{
            resolve(reader.result)
        }
    })
}
export const isNull=(v)=>{
    if(v===null) return true
    if(v.toString().trim()=="") return true
    
    return false
}