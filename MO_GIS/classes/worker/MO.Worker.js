/*
Worker API 를 사용하기위해 공통 클래스 작성
*/
onmessage=e=>{
    
    getData().then((res)=>postMessage(res));


    // postMessage({result:data});
};

async function getData(){
    const url = "http://118.42.103.144:9090/geoserver/swap/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=swap%3AWTL_FREQCOMP_AS_TEMP&maxFeatures=50&outputFormat=application%2Fjson";

    const res = await fetch(url);
    const data = await res.json();
    return data;
}