//transition中P0(0,0),P3(1,1)
//P1,P2的X坐标范围[0,1],y范围无穷
class Bezier {
    constructor(x1, y1, x2, y2) {
        //modify
        this.x1 = x1;
        this.y1 = y1;
        this.x2 = x2;
        this.y2 = y2;
        this.getX = this.produceFunc(x1, x2);
        this.getY = this.produceFunc(y1, y2);
    }

    produceFunc(a1, a2) {
        let func = "";
        let t = "t";
        let _t = "(1-t)";
        let adds = [];
        adds.push(['3', t, _t, _t, a1].join('*'));
        adds.push(['3', t, t, _t, a2].join('*'));
        adds.push([_t, _t, _t,].join('*'));
        return new Function('t', 'return ' + adds.join('+'))
    }
}


!function () {
    class Circle {
        constructor(x, y, radius, isSelect) {
            this.x = x;
            this.y = y;
            this.coordX = this.getCoordX();
            this.coordY = this.getCoordY();
            this.radius = radius;
            this.isSelect = isSelect ? isSelect : false;
            this.path = null;
        }
        draw() {
            this.path = this.getPath();
            if (this.isSelect) {
                ctx.lineWidth = 5;
            } else {
                ctx.lineWidth = 1;
            }
            ctx.beginPath();
            ctx.stroke(this.path);
        }
        getPath() {
            let circle = new Path2D();
            circle.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            return circle;
        }
        getCoordX() {
            return parseFloat((this.x / 300).toFixed(3));
        }
        setCoordX(value) {
            this.x = value;
            this.coordX = parseFloat((value / 300).toFixed(3));
        }
        getCoordY() {
            return parseFloat(((300-this.y) / 300).toFixed(3));
        }
        setCoordY(value) {
            this.y = value;
            this.coordY = parseFloat(((300-value) / 300).toFixed(3));
        }

    }

    //设置外层盒子的高度,垂直居中
    let container = document.querySelector('div.ct-vertical');
    //-16因为body标签默认margin:8px
    container.style.height = (window.innerHeight - 16) + "px";
    container.style.width = (window.innerWidth - 16) + "px";
    //canvas
    let canvas = document.getElementById('curve');
    let ctx = canvas.getContext('2d');

    //坐标系参数
    let tx = 100,
        ty = 100,
        cx = -10,
        cy = -10,
        ax = 15,
        ay = 15,
        len = 300;
    //bezier curve参数
    let p0, p1, p2, p3;

    ctx.save();
    ctx.translate(tx, ty);
    //初始化
    drawCanvas();

    //绑定事件
    let drag = false,
        dragCircle = null;
    canvas.addEventListener('mousedown', function (e) {
        let pos = getPosition(e.clientX, e.clientY);
        if (ctx.isPointInPath(p2.path, pos.x, pos.y)) {
            drag = true;
            dragCircle = p2;
            p2.isSelect = true;
            drawCanvas();
        } else if (ctx.isPointInPath(p3.path, pos.x, pos.y)) {
            drag = true;
            dragCircle = p3;
            p3.isSelect = true;
            drawCanvas();
        }
    });
    canvas.addEventListener('mousemove', function (e) {
        let pos = getPosition(e.clientX, e.clientY);
        if (drag) {
            if(pos.x >=0+ty && pos.x <=300+ty){
                dragCircle.setCoordX(pos.x - tx);
                dragCircle.setCoordY(pos.y - ty);
                drawCanvas();
            }
            
        }
    });
    canvas.addEventListener('mouseup', function (e) {
        let pos = getPosition(e.clientX, e.clientY);
        drag = false;
        dragCircle.isSelect = false;
        drawCanvas();
    });
    function getPosition(x, y) {
        let rect = canvas.getBoundingClientRect();
        return { x: x - rect.left, y: y - rect.top }
    }

    function drawCanvas() {
        ctx.clearRect(-tx, -ty, canvas.width, canvas.height);
        //坐标系
        drawTransaction(drawCoordinate);

        //bezier-curve
        p0 = new Circle(0, 300, 10);
        p1 = new Circle(300, 0, 10);
        p2 = p2 ? p2 : new Circle(250, 250, 10);
        p3 = p3 ? p3 : new Circle(50, 50, 10);
        drawTransaction(drawCircle.bind(null, [p0, p1, p2, p3]));

        drawTransaction(drawJoinLine.bind(null, p2, p3));
        ctx.beginPath();
        ctx.moveTo(0, 300);
        ctx.bezierCurveTo(p2.x, p2.y, p3.x, p3.y, 300, 0);
        ctx.stroke();
    }


    function drawCoordinate() {
        ctx.beginPath();
        //need transaction
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, 300 + cy);
        ctx.lineTo(0, 0 - ay);
        ctx.moveTo(-ax, 0);
        ctx.lineTo(0, 0 - ay);
        ctx.lineTo(ax, 0);
        ctx.moveTo(0 - cx, 300);
        ctx.lineTo(300 + ax, 300);
        ctx.moveTo(300, 300 - ay);
        ctx.lineTo(300 + ax, 300);
        ctx.lineTo(300, 300 + ay);
        ctx.stroke();
    }
    function drawJoinLine(p2, p3) {
        //画连接线
        ctx.beginPath();
        let is1 = getIntersection(1 - p2.radius / Math.pow(p2.x * p2.x + (p2.y - 300) * (p2.y - 300), 0.5), 0, 300, p2.x, p2.y);
        ctx.moveTo(0, 300);
        ctx.lineTo(is1.x, is1.y);
        let is2 = getIntersection(p3.radius / Math.pow((p3.x - 300) * (p3.x - 300) + p3.y * p3.y, 0.5), p3.x, p3.y, 300, 0);
        ctx.moveTo(300, 0);
        ctx.lineTo(is2.x, is2.y);
        ctx.stroke();
    }
    function drawCircle(circles) {
        for (let c of circles) {
            c.draw();
        }
    }
    /*
    scale:比例
    (x0,y0):起点
    (x1,y1):终点
    */
    function getIntersection(scale, x0, y0, x1, y1) {
        return {
            x: x0 + (x1 - x0) * scale,
            y: y0 + (y1 - y0) * scale
        }
    }
    function drawTransaction() {
        ctx.save();
        for (let func of arguments) {
            if (typeof func == 'function') {
                func();
            }
        }
        ctx.restore();
    }

    //viewmodel
    let obsP2 = new Observer(p2);
    let obsP3 = new Observer(p3);
    let x1Dom = document.querySelector('#x1');
    let y1Dom = document.querySelector('#y1');
    let x2Dom = document.querySelector('#x2');
    let y2Dom = document.querySelector('#y2');
    x1Dom.value = p2.coordX;
    y1Dom.value = p2.coordY;
    x2Dom.value = p3.coordX;
    y2Dom.value = p3.coordY;
    new Watcher(p2,"coordX",(value) => {
        x1Dom.value = value;
    })
    new Watcher(p2,"coordY",(value) => {
        y1Dom.value = value;
    })
    new Watcher(p3,"coordX",(value) => {
        x2Dom.value = value;
    })
    new Watcher(p3,"coordY",(value) => {
        y2Dom.value = value;
    })

}()
