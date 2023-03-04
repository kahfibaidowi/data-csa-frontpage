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