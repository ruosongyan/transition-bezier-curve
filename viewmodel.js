class Observer {
    constructor(obj) {
        this.observer(obj);
    }
    observer(obj) {
        if (!obj || Object.prototype.toString.call(obj) != '[object Object]') {
            return;
        }
        for (let key in obj) {
            this._initReactive(obj, key);
        }
    }
    _initReactive(obj, key) {
        let that = this;
        if (Object.prototype.toString.call(obj[key]) == '[object Object]') {
            this._initReactive(obj[key]);
        }
        //obj每一个属性都有一个Dep来管理订阅队列
        let dep = new Dep();
        let value = obj[key];
        Object.defineProperty(obj, key, {
            configurable: true,
            enumerable: true,
            get: function () {
                //在第一次获取值得时候进行订阅
                if (Dep.target) {
                    dep.on(Dep.target);
                }
                return value;
            },
            set: function (newValue) {
                value = newValue;
                dep.notify();
            }
        })
    }
}
class Dep {
    constructor() {
        this.eventList = [];
    }
    on(event) {
        if (event && event instanceof Watcher) {
            this.eventList.push(event);
        }
    }
    notify() {
        for (let event of this.eventList) {
            event.update();
        }
    }
}

class Watcher {
    constructor(data, exp, cb) {
        this.data = data;
        this.exp = exp;
        this.cb = cb;
        this.value = this.get();
    }
    update() {
        this.run();
    }
    run() {
        let oldValue = this.value;
        let newValue = this.data[this.exp];
        if (oldValue != newValue) {
            this.value = newValue;
            //----------cb绑定作用域------------
            this.cb.call(this.data, newValue, oldValue);
        }
    }
    get() {
        Dep.target = this;
        let value = this.data[this.exp];
        Dep.target = null;
        return value;
    }
}

class Compile {
    constructor(el, data) {
        this.el = el;
        this.data = data;
        this.fragment = null;
        this.init();
    }
    init() {
        if (this.el) {
            this.fragment = this.nodeToFragment(this.el);
            this.compile(this.fragment);
            this.el.appendChild(this.fragment);
        } else {
            console.log('el不存在')
        }

    }
    nodeToFragment(el) {
        let fragment = document.createDocumentFragment();
        let child = el.firstChild;
        while (child) {
            fragment.appendChild(child);
            child = el.firstChild;
        }
        return fragment;
    }
    compile(el) {
        let self = this;
        let reg = /\{\{(.*)\}\}/;
        [].slice.call(el.childNodes).forEach((node, index) => {
            let text = node.textContent;
            //在这里进行不同节点的判断
            if (self.isElementNode(node)) {
                self.compileElementNode(node);
            } else if (self.isTextNode(node) && reg.test(text)) {
                let result = reg.exec(text);
                self.compileTextNode(node, result[0], result[1]);
            }
            if (node.childNodes && node.childNodes.length) {
                self.compile(node);
            }
        });
    }
    compileElementNode(el) {
        let self = this;
        let attrs = el.attributes;
        if (attrs && attrs.length) {
            [].slice.call(attrs).forEach((attr) => {
                if(attr.name.indexOf('v-model') == 0){
                    self.compileModel(el,attr.value);
                }
            })
        }

    }
    compileModel(node,exp){
        let self =this;
        let val = this.data[exp];
        this.updateModel(node,val);
        new Watcher(this.data,exp,(value) => {
            self.updateModel(node,value);
        })
        node.addEventListener('input',(e) => {
            let newValue = e.target.value;
            //中文输入法，输入英文字母，再按shift，会触发两次input事件
            if(val == newValue){
                return;
            }
            self.data[exp] = newValue;
            val = newValue;
        })
    }
    compileTextNode(el, matched, exp) {
        this.updateText(el, exp, matched);
        new Watcher(data, exp, (value, oldValue) => {
            this.updateText(el, exp, oldValue);
        })
    }
    updateModel(node,value){
        node.value = typeof value == 'undefined' ? '' : value;
    }
    updateText(node, exp, oldValue) {
        let value = this.data[exp] ? this.data[exp] : null;
        node.nodeValue = node.nodeValue.replace(oldValue, value);
    }
    isTextNode(node) {
        return node && node.nodeType == 3;
    }
    isElementNode(node) {
        return node && node.nodeType == 1;
    }

}

class SelfVue {
    constructor(el, data) {
        let self = this;
        this.data = data;
        //代理模式?
        Object.keys(this.data).forEach(element => {
            self.proxyKey(element)
        });
        new Observer(data);
        new Compile(el, data);

    }
    proxyKey(key) {
        Object.defineProperty(this, key, {
            enumerable: false,
            configurable: true,
            get: function () {
                return this.data[key];
            },
            set: function (value) {
                this.data[key] = value;
            }
        })
    }
}



