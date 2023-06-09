export const arrayMonths=[
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei", 
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember"
]
export const sheetColumn=(col)=>{
    let n=col-1

    var ordA='a'.charCodeAt(0)
    var ordZ='z'.charCodeAt(0)
    var len=ordZ-ordA+1
  
    var s=""
    while(n>=0){
        s=String.fromCharCode(n%len+ordA)+s
        n=Math.floor(n/len)-1
    }
    return s.toUpperCase();
}

/* CENTEROID */
const area=(poly)=>{
    var s = 0.0;
    var ring = poly.coordinates[0];
    for(i= 0; i < (ring.length-1); i++){
        s += (ring[i][0] * ring[i+1][1] - ring[i+1][0] * ring[i][1]);
    }
    return 0.5 *s;
}

export const centroid=(poly)=>{
    var c = [0,0];
    var ring = poly.coordinates[0];
    for(i= 0; i < (ring.length-1); i++){
        c[0] += (ring[i][0] + ring[i+1][0]) * (ring[i][0]*ring[i+1][1] - ring[i+1][0]*ring[i][1]);
        c[1] += (ring[i][1] + ring[i+1][1]) * (ring[i][0]*ring[i+1][1] - ring[i+1][0]*ring[i][1]);
    }
    var a = area(poly);
    c[0] /= a *6;
    c[1] /= a*6;
    return c;
}
export const paginate=(array, page_size, page_number)=>{
    return array.slice((page_number - 1) * page_size, page_number * page_size);
}

export const ceil=num=>{
    if(num=="") return ""
    else return Math.ceil(num)
}