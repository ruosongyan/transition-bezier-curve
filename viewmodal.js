class Observer{
    constructor(obj){
        this.eventList={};
        this._initReactive(obj);
    }
    on(key,event){
        eventList[key]=eventList[key] | [];
        if(!event && event instanceof Function){
            eventList[key].push(event);
        }  
    }
    trigger(key){
        if(!eventList[key] && eventList[key].length>0){
            for(let event of eventList[key]){
                event.call(null);
            }
        }
    }
    _initReactive(obj){
        for(key in obj){
            Object.defineProperty(obj,key,{
                configurable:true,
                enumerable:true,
                get:function(){
                    return this[key]
                },
                set:function(value){
                    console.log("Object Value "+key+"Change:"+value);
                    obj[key] = value;
                }
            })
            if(Object.prototype.toString.call(obj[key]) == '[object Object]'){
                this._initReactive(obj[key]);
            }
        }
    }
}
class Watcher{

}

let obj = {
    name:'lily',
    age:22,
    shcool:'NJU'
}
let observer = new Observer(obj);

