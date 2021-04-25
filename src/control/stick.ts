import {EVENT} from '../util/constant';
import event from '../util/event';
import {isPointInRect} from '../util/util';
import {POS} from './map-control';


export default class stick extends Laya.Script {
    private isTouchDown: boolean = false;
    
    private stick: Laya.Sprite;
    constructor () { super(); }
    
    onEnable (): void {
        this.stick = this.owner.getChildByName('stick') as Laya.Sprite;
        // this.stick.on(Laya.Event.MOUSE_DOWN, this, (e: Laya.Event) => {
        //     // e.stageX 是点击点相对于左上角的距离
        //     this.isTouchDown = true;
        //     this._setStickPosition(e);
        // });
        // this.stick.on(Laya.Event.MOUSE_UP, this, this._releaseStick);
        // this.owner.parent.on(Laya.Event.MOUSE_UP, this, this._releaseStick);
        event.regist(EVENT.ON_MAP_MOVE, () => {
            const owner = (this.owner as Laya.Sprite);
            POS.resetStickPos();
            owner.x = POS.TRUE_POS.x;
            owner.y = POS.TRUE_POS.y;
        });
        window.stick = stick;
        window._this = this;
        // debugger;
    }
    onStageMouseDown (e: Laya.Event): void{
        if (isPointInRect({
            point: {
                x: e.stageX,
                y: e.stageY,
            },
            rect: {
                x: POS.RELATIVE_POS.x,
                y: POS.RELATIVE_POS.y,
                width: POS.DIAMETER,
                height: POS.DIAMETER,
            }
        })) {
            this.isTouchDown = true;
            this._setStickPosition(e);
        }
    }
    onStageMouseUp (): void{
        this._releaseStick();
    }
    onStageMouseMove (e: Laya.Event): void{
        if (!this.isTouchDown) {return;}
        this._setStickPosition(e);
    }
    private _countStickDeg (dis: number, dx: number, dy: number) {
        event.emit(EVENT.ON_STICK_DEG_CHANGE, {
            release: false,
            offset: {
                x: POS.RADIUS * (dx / dis),
                y: POS.RADIUS * (dy / dis)
            }
        });
    }
    private _releaseStick () {
        if (this.isTouchDown) {
            this.isTouchDown = false;
            this._resetStickPosition();
            event.emit(EVENT.ON_STICK_DEG_CHANGE, {release: true});
        }
    }

    private _setStickPosition (e: Laya.Event) {
        const dis = POS.RELATIVE_CENTER_POS.distance(e.stageX, e.stageY);
        let x: number, y: number;
        if (dis >  POS.RADIUS) {
            const rate = POS.RADIUS / dis;
            x = POS.RADIUS + rate * (e.stageX - POS.RELATIVE_CENTER_POS.x);
            y = POS.RADIUS + rate * (e.stageY - POS.RELATIVE_CENTER_POS.y);
        } else {
            x = e.stageX - POS.RELATIVE_POS.x;
            y = e.stageY - POS.RELATIVE_POS.y;
        }
        this._countStickDeg(dis, e.stageX - POS.RELATIVE_CENTER_POS.x, e.stageY - POS.RELATIVE_CENTER_POS.y);
        // POS.setMapOffset(x, y);
        this._initStickPosition(x - POS.STICK_RADIUS, y - POS.STICK_RADIUS);
    }
    private _resetStickPosition () {
        this._initStickPosition(POS.STICK_OFFSET, POS.STICK_OFFSET);
    }
    private _initStickPosition (x: number, y: number) {
        POS.STICK_RELATIVE_POS.setTo(x, y);
        this.stick.x = x;
        this.stick.y = y;
    }
}