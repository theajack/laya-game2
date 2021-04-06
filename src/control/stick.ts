const DIAMETER = 100;
const RADIUS = DIAMETER / 2;
const POS = {
    X: 20,
    Y: 20,
};

export default class stick extends Laya.Script {
    private size = DIAMETER / 2;
    private bgRadius = RADIUS;
    private isTouchDown: boolean = false;
    private point: Laya.Point = new Laya.Point(this.size, this.size);
    private centerPoint = new Laya.Point(POS.X + this.bgRadius, POS.Y + this.bgRadius)
    private stick: Laya.Sprite;
    constructor () { super(); }
    
    onEnable (): void {
        this.stick = this.owner.getChildByName('stick') as Laya.Sprite;
        this.stick.on(Laya.Event.MOUSE_DOWN, this, (e: Laya.Event) => {
            this.isTouchDown = true;
            this._setStickPosition(e);
        });
        this.stick.on(Laya.Event.MOUSE_UP, this, () => {
            this.isTouchDown = false;
            this._resetStickPosition();
        });
        window.stick = stick;
        // debugger;
    }
    onStageMouseMove (e: Laya.Event): void{
        if (!this.isTouchDown) {return;}
        this._setStickPosition(e);
    }

    private _setStickPosition (e: Laya.Event) {
        const dis = this.centerPoint.distance(e.stageX, e.stageY);
        let x = e.stageX - POS.X;
        let y = e.stageY - POS.Y;
        if (dis >  this.bgRadius) {
            const rate = this.bgRadius / dis;
            x = POS.X + this.bgRadius + (())
            x *= rate;
            y *= rate;
        }
        this.point.setTo(x, y);
        this._initStickPosition();
    }
    private _resetStickPosition () {
        this.point.setTo(
            POS.X + RADIUS / 2,
            POS.Y + RADIUS / 2,
        );
        this._initStickPosition();
    }
    private _initStickPosition () {
        this.stick.x = this.point.x - this.size / 2;
        this.stick.y = this.point.y - this.size / 2;
    }
}