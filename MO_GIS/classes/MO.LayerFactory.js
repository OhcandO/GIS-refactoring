import { SourceFactory } from "./MO.SourceFactory";
import Source from '../../lib/openlayers_v7.5.1/source/Source.js'
import * as KEY from '../MO.keyMap.js';

/**
 * MOSourceConfig 인스턴스로 Openlayers Layer 객체를 생산하는 객체
 *
 * @class LayerFactory
 * @author jhoh
 */
class LayerFactory{

    #INSTANCE_SourceConfig;
    #INSTANCE_olSource;
    constructor(srcConf){
        if(this.#isValid_sourceConfig(srcConf)){
            this.#INSTANCE_SourceConfig = srcConf;
        }
    }

    #isValid_sourceConfig(sourceConfig){
        let bool = false;
        if(sourceConfig instanceof SourceFactory){
            bool = true;
        }else if (sourceConfig instanceof Source){
            this.#INSTANCE_olSource = sourceConfig;
            bool = true;
        }else{
            console.error(`입력된 레이어 소스설정 인스턴스가 적합하지 않음`)
            console.log(sourceConfig)
            bool = false;
            // throw new Error(`입력된 레이어 소스설정 인스턴스가 적합하지 않음`)
        }
        return bool;
    }

    #isValid_ol_source(){

    }
    get source(){
        return this.#INSTANCE_SourceConfig.source;
    }



}