class Observer{
    constructor(obj){
        this.eventList={};
        this._initReactive(obj);
    }
    on(key,event){
        let eventList = this.eventList;
        eventList[key]=eventList[key] || [];
        if(event && event instanceof Watcher){
            eventList[key].push(event);
        }  
    }
    trigger(key,value){
        let eventList = this.eventList;
        if(eventList[key] && eventList[key].length>0){
            for(let event of eventList[key]){
                event.call(value);
            }
        }
    }
    _initReactive(obj){
        let that = this;
        for(let key in obj){
            let value = obj[key];
            Object.defineProperty(obj,key,{
                configurable:true,
                enumerable:true,
                get:function(){
                    return value;
                },
                set:function(newValue){
                    value = newValue;
                    that.trigger(key,newValue);
                }
            })
            if(Object.prototype.toString.call(obj[key]) == '[object Object]'){
                this._initReactive(obj[key]);
            }
        }
    }
}
class Watcher{
    constructor(action){
        this.call = action;
    }
}




