/*
 * Worker API 를 사용하기위해 공통 클래스 작성
 */

/**
 * Worker 에서 수신하는 메시지 이벤트 데이터 인터페이스
 */
export interface WorkerRequestMessage {
    [key: string]: any;
}

/**
 * Worker 에서 송신하는 응답 데이터 인터페이스
 */
export interface WorkerResponseMessage {
    type: string;
    features: any[];
    [key: string]: any;
}

// Worker 전역 컨텍스트
const ctx: DedicatedWorkerGlobalScope = self as any;

ctx.onmessage = (e: MessageEvent<WorkerRequestMessage>): void => {
    getData().then((res: WorkerResponseMessage) => ctx.postMessage(res));

    // postMessage({result:data});
};

async function getData(): Promise<WorkerResponseMessage> {
    const url = 'http://118.42.103.144:9090/geoserver/swap/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=swap%3AWTL_FREQCOMP_AS_TEMP&maxFeatures=50&outputFormat=application%2Fjson';

    const res = await fetch(url);
    const data: WorkerResponseMessage = await res.json();
    return data;
}
