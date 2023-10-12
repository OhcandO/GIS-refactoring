import Control from "../../lib/openlayers_v7.5.1/control/Control.js";
import Map from '../../lib/openlayers_v7.5.1/Map.js'
import View from '../../lib/openlayers_v7.5.1/View.js'
import { LayerTree } from "./MO.LayerTree.js";

export class MOGISMap extends Map{
    
    default_viewSpec = {
        /**
         * Openlayers 뷰 포트 객체가 표현하는 좌표계.
         * 배경지도의 원본 좌표계를 설정해 이미지가 열화 없이 표출되도록 함
         * @default 'EPSG:4326' vworld 배경지도 좌표계
         * @memberof MOMapConfig
         */
        projection: `EPSG:3857`, //google map projected Pseudo-Mercator coordinate system. Also Vworld basemap coordinate
        /** mindone */
        center: [127.043879, 37.482099], 
        enableRotation : false,
    };

    default_mapSpec = {
        /** Map 이 생성될 기본 DIV id */
        target: 'map',
    };

    
    #INSTANCE_VIEW;
    #INSTANCE_MAP;
    #INSTANCE_TREE;
    /**
     * 입력한 변수들을 Map 또는 View 객체 생성을 위한 변수로 할당
     * @param {Object} mapConfigSpec Map 또는 View 객체 생성을 위한 key-value Object 
     */
    constructor(mapConfigSpec) {
        if (mapConfigSpec) {
            Object.entries(this.default_mapSpec).forEach(([key,val])=>{
                if(this.default_mapSpec[key]) this.default_mapSpec[key] = val;
            });
        } 
        // 결과로서 Map 객체를 반환
        
    }

    get map(){
        if(!this.#INSTANCE_MAP){
            this.#INSTANCE_MAP = super({
                target: this.default_mapSpec.target,
                view : this.view,
            });
        }
        return this.#INSTANCE_MAP;
    }

    get view(){
        if(!this.#INSTANCE_VIEW){
            this.#INSTANCE_VIEW = new View(this.default_viewSpec);
        }
        return this.#INSTANCE_VIEW;
    }

    set view(view_inst){
        if(view_inst instanceof View){
            this.#INSTANCE_VIEW = view_inst;
        }else{
            console.log(view_inst);
            throw new Error (`Openlayers 뷰 인스턴스가 아님`)
        }
    }

    /**
     * @param {LayerTree} tree_instrance
     */
    setTree(tree_instrance){
        if(tree_instrance instanceof LayerTree){
            this.#INSTANCE_TREE = tree_instrance;
        }
    }
    get tree(){
        if(this.#INSTANCE_TREE) return this.#INSTANCE_TREE;
        else {console.error(`LayerTree 객체 생성되지 않음`)}
    }
}