class Observer{
    constructor(obj){
        this.observer(obj);
    }
    observer(obj){
        if(!obj || Object.prototype.toString.call(obj) != '[object Object]'){
            return
        }
        for(let key of obj){
            this._initReactive(obj[key]);
        }
    }
    _initReactive(obj){
        let that = this;
        if(Object.prototype.toString.call(obj[key]) == '[object Object]'){
            this._initReactive(obj[key]);
        }
        //obj每一个属性都有一个Dep来管理订阅队列
        let dep = new Dep();
        let value = obj[key];
        Object.defineProperty(obj,key,{
            configurable:true,
            enumerable:true,
            get:function(){
                //在第一次获取值得时候进行订阅
                if(Dep.target){
                    dep.on(Dep.target);
                }
                return value;
            },
            set:function(newValue){
                value = newValue;
                dep.notify();
            }
        })
    }
}
class Dep{
    constructor(){
        this.eventList=[];
    }
    on(event){
        if(event && event instanceof Watcher){
            this.eventList.push(event);
        }
    }
    notify(){
        for(let event of eventList){
            event.update();
        }
    }
}
class Watcher{
    constructor(data,exp,cb){
        this.data = data;
        this.exp = exp;
        this.cb = cb;
        this.value = this.get();
    }
    update(){
        this.run();
    }
    run(){
        let oldValue = this.value;
        let newValue = this.data[this.exp];
        if(oldValue != newValue){
            this.value = newValue;
            //----------cb绑定作用域------------
            this.cb.call(this.data,newValue,oldValue);
        }
    }
    get(){
        Dep.target = this;
        let value = this.data[exp];
        Dep.target = null;
        return value;
    }
}




