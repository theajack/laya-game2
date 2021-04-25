
// import {countSizeByValue, getBgTexture, getGroundTexture, getRigidAttrByValue, getTextureByValue, initTexture, onTextureReady} from './texture';
/**
 * 游戏控制脚本。定义了几个dropBox，bullet，createBoxInterval等变量，能够在IDE显示及设置该变量
 * 更多类型定义，请参考官方文档
 */
import {initMap, mapAutoMove} from './map-control';

export default class GameControl extends Laya.Script {
    /** @prop {name:wall,tips:"墙预制体对象",type:Prefab}*/
    wall: Laya.Prefab;
    /** @prop {name:player,tips:"玩家预制体对象",type:Prefab}*/
    player: Laya.Prefab;
    /** @prop {name:enemy,tips:"敌人预制体对象",type:Prefab}*/
    enemy: Laya.Prefab;
    /** @prop {name:star,tips:"道具预制体对象",type:Prefab}*/
    star: Laya.Prefab;
    static instance: GameControl;
    private _gameBox: Laya.Sprite;
    constructor () {
        super();
        GameControl.instance = this;
    }

    onEnable (): void {
        this._gameBox = this.owner.getChildByName('gameBox') as Laya.Sprite;
        window.createWall = this.createWall.bind(this);
        console.log(this._gameBox);
    }
    onStart () {
        initMap(this);
    }
    onUpdate () {
        mapAutoMove();
    }
    onStageClick (e: Laya.Event): void {
        // 停止事件冒泡，提高性能，当然也可以不要
        // if (this.height !== Laya.stage.height) {
        //     this._initSize();
        // }
        e.stopPropagation();
        // moveMap({x: 0, y: 100});
        // // 舞台被点击后，使用对象池创建子弹
        // const x = Laya.stage.mouseX;
        // const y = 50;
        // this._creatNewBall(this.nextValue, x, y);
        // this.nextValue = this._randomValue();
        // // this.nextValue = 512;
        // this._drawNextBall();
        // if (this.didTipShow) {
        //     (this.owner.getChildByName('tip') as Laya.Text).visible = false;
        //     (this.owner.getChildByName('tip2') as Laya.Text).visible = false;
        // }
    }

    createWall (x: number, y: number) {
        const wall: Laya.Sprite = Laya.Pool.getItemByCreateFun('wall', this.wall.create, this.wall);
        wall.pos(x, y);
        this._gameBox.addChild(wall);
        // this.owner.addChild(wall);
        window.wall = wall;
    }
    

}