import {EVENT} from '../util/constant';
import event from '../util/event';
import {isPointInRect} from '../util/util';
import {STICK} from './size';


export default class stick extends Laya.Script {
    private isTouchDown: boolean = false;
    
    private stick: Laya.Sprite;
    constructor () { super(); }
    
    onEnable (): void {
        this.stick = this.owner.getChildByName('stick') as Laya.Sprite;
        
        event.regist(EVENT.ON_INIT_SIZE, () => {
            const stickBg = this.owner as Laya.Sprite;
            stickBg.x = STICK.RELATIVE_POS.x;
            stickBg.y = STICK.RELATIVE_POS.y;
        });

        window.stick = this;
    }
    onStageMouseDown (e: Laya.Event): void{
        if (isPointInRect({
            point: {
                x: e.stageX,
                y: e.stageY,
            },
            rect: {
                x: STICK.RELATIVE_POS.x,
                y: STICK.RELATIVE_POS.y,
                width: STICK.DIAMETER,
                height: STICK.DIAMETER,
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
                x: STICK.RADIUS * (dx / dis),
                y: STICK.RADIUS * (dy / dis)
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
        const dis = STICK.RELATIVE_CENTER_POS.distance(e.stageX, e.stageY);
        let x: number, y: number;
        if (dis >  STICK.RADIUS) {
            const rate = STICK.RADIUS / dis;
            x = STICK.RADIUS + rate * (e.stageX - STICK.RELATIVE_CENTER_POS.x);
            y = STICK.RADIUS + rate * (e.stageY - STICK.RELATIVE_CENTER_POS.y);
        } else {
            x = e.stageX - STICK.RELATIVE_POS.x;
            y = e.stageY - STICK.RELATIVE_POS.y;
        }
        this._countStickDeg(dis, e.stageX - STICK.RELATIVE_CENTER_POS.x, e.stageY - STICK.RELATIVE_CENTER_POS.y);
        this._initStickPosition(x - STICK.STICK_RADIUS, y - STICK.STICK_RADIUS);
    }
    private _resetStickPosition () {
        this._initStickPosition(STICK.STICK_MARGIN, STICK.STICK_MARGIN);
    }
    private _initStickPosition (x: number, y: number) {
        STICK.STICK_RELATIVE_POS.setTo(x, y);
        this.stick.x = x;
        this.stick.y = y;
    }
}