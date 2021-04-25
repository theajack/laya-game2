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
        window.stick = this;
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