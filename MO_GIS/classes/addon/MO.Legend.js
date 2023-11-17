import { MOSubscriber } from "../abstract/MO.Subscriber";

/**
 * 지도 위 범례 정보를 표현하는 객체
 * Subscriber 로서 
 *
 * @class MOLegend
 * @extends {MOSubscriber}
 */
class MOLegend extends MOSubscriber {
    
    

    constructor(div_id){
        super(div_id);

    }


    update(publisherID){
        let publisher = this.getPublisher(publisherID);
        if(publisher){
            let data = publisher.PublisherData; // array
        }
    }


}