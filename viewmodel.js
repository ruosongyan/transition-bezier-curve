class Observer{
    constructor(obj){
        this.observer(obj);
    }
    observer(obj){
        if(!obj || Object.prototype.toString.call(obj) != '[object Object]'){
            return;
        }
        for(let key in obj){
            this._initReactive(obj,key);
        }
    }
    _initReactive(obj,key){
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
        for(let event of this.eventList){
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
        let value = this.data[this.exp];
        Dep.target = null;
        return value;
    }
}

class SelfVue{
    constructor(el,data){
        let self = this;
        this.data = data;
        //代理模式?
        Object.keys(this.data).forEach(element => {
            self.proxyKey(element)
        });
        new Observer(data);
        let frag = this.compile(el,data);
        let parent = el.parentNode;
        parent.removeChild(el);
        parent.appendChild(frag);
        
    }
    proxyKey(key){
        Object.defineProperty(this,key,{
            enumerable:false,
            configurable:true,
            get:function(){
                return this.data[key];
            },
            set:function(value){
                this.data[key] = value;
            }
        })
    }
    compile(el,data){
        let fragment = document.createDocumentFragment();
        fragment.appendChild(el.cloneNode(true));
        let reg = /{{([\w\d]+)}}/;
        let elClone = fragment.children[0];
        this.compileNode(elClone,data,reg);
        return fragment;
    }
    compileNode(el,data,reg){
        //初始化
        for(let child of el.children){
            let textNode = Array.from(child.childNodes).find((node) => {
                return node.nodeType == 3 && reg.test(node.nodeValue);
            });
            if(textNode){
                let result = reg.exec(textNode.nodeValue);
                if(Object.keys(data).includes(result[1])){
                    textNode.nodeValue = textNode.nodeValue.replace(result[0],data[result[1]]);
                    new Watcher(data,result[1],(value,oldValue) => {
                        textNode.nodeValue = textNode.nodeValue.replace(oldValue,value);
                    })
                }
            }
            this.compileNode(child,data,reg);
        }
    }
}



