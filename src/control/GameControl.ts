
// import {countSizeByValue, getBgTexture, getGroundTexture, getRigidAttrByValue, getTextureByValue, initTexture, onTextureReady} from './texture';
/**
 * 游戏控制脚本。定义了几个dropBox，bullet，createBoxInterval等变量，能够在IDE显示及设置该变量
 * 更多类型定义，请参考官方文档
 */
import {EVENT} from '../util/constant';
import event from '../util/event';
import {IPoint, ISize} from '../util/type';
import {getMapPosition, initMap, mapAutoMove, moveMapTo} from './map-control';
import {SCREEN_CENTER, setRelativeSize} from './size';

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
    private _uiControl: Laya.Sprite;
    static player: Laya.Sprite;
    constructor () {
        super();
        GameControl.instance = this;
    }

    onEnable (): void {
        setRelativeSize();
        
        this._gameBox = this.owner.getChildByName('gameBox') as Laya.Sprite;
        this._uiControl = this.owner.getChildByName('uiControl') as Laya.Sprite;
        
        event.regist(EVENT.ON_MAP_MOVE, () => {
            const mapOffset = getMapPosition();
            this._uiControl.x = mapOffset.x;
            this._uiControl.y = mapOffset.y;
        });

        event.regist(EVENT.ON_INIT_SIZE, (size: ISize) => {
            this._uiControl.width = size.width;
            this._uiControl.height = size.height;
        });

        window.createWall = this.createWall.bind(this);
        window.gameBox = this._gameBox;
        window.uiControl = this._uiControl;
        window.gameControl = this;
    }
    onStart () {
        initMap(this);
        this._initPlayer();
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
        wall.pivot(wall.width / 2, wall.height / 2);
        wall.pos(x, y);
        this._gameBox.addChild(wall);
        // this.owner.addChild(wall);
        window.wall = wall;
    }

    private _initPlayer () {
        const player: Laya.Sprite = Laya.Pool.getItemByCreateFun('player', this.player.create, this.player);
        const playerRig = player.getComponent(Laya.RigidBody) as Laya.RigidBody;
        player.pivot(player.width / 2, player.height / 2);
        GameControl.player = player;
        // 给定人物其实位置
        player.pos(200, 200);
        this._gameBox.addChild(player);

        window.player = player;

        event.regist(EVENT.ON_STICK_DEG_CHANGE, ({
            release, offset
        }: {
            release: boolean, offset: IPoint
        }) => {
            playerRig.setVelocity({
                x: release ? 0 : offset.x * 0.1,
                y: release ? 0 : offset.y * 0.1
            });
        });
        
        event.regist(EVENT.ON_INIT_SIZE, () => {
            moveMapTo({
                x: player.x - SCREEN_CENTER.x,
                y: player.y - SCREEN_CENTER.y,
            });
        });
    }
    

}