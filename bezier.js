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
            this.radius = radius;
            this.isSelect = isSelect ? isSelect : false;
        }
        draw() {
            let path = this.getPath();
            if (this.isSelect) {
                ctx.lineWidth = 5;
            } else {
                ctx.lineWidth = 1;
            }
            ctx.beginPath();
            ctx.stroke(path);
        }
        getPath() {
            let circle = new Path2D();
            circle.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            return circle;
        }
        getX(){
            return this.x/300;
        }
        getY(){
            return this.y/300;
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


    let tx = 100,
        ty = 100,
        cx = 15,
        cy = 15,
        ax = 15,
        ay = 15,
        len = 300;

    ctx.save();
    ctx.translate(tx, ty);
    //坐标系
    drawCoordinate();

    //bezier-curve
    let p0 = { x: 0, y: 0 };
    let p1 = { x: 1, y: 1 };
    let p2 = new Circle(50, 50, 10);
    let p3 = new Circle(250, 250, 10);
    p2.draw();
    p3.draw();
    


    function drawCoordinate(){
        ctx.beginPath();
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
    function drawCircles(circles){
        for(let c of circles){
            c.draw();
            
        }
    }



}()
