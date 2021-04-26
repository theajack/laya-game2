
// import {countSizeByValue, getBgTexture, getGroundTexture, getRigidAttrByValue, getTextureByValue, initTexture, onTextureReady} from './texture';
/**
 * 游戏控制脚本。定义了几个dropBox，bullet，createBoxInterval等变量，能够在IDE显示及设置该变量
 * 更多类型定义，请参考官方文档
 */
import {EVENT, SIZE} from '../util/constant';
import event from '../util/event';
import {IPoint} from '../util/type';
import {getMapPosition, initMap, mapAutoMove, POS} from './map-control';

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
        this._gameBox = this.owner.getChildByName('gameBox') as Laya.Sprite;
        this._uiControl = this.owner.getChildByName('uiControl') as Laya.Sprite;
        
        event.regist(EVENT.ON_MAP_MOVE, () => {
            const mapOffset = getMapPosition();
            this._uiControl.x = mapOffset.x;
            this._uiControl.y = mapOffset.y;
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
        player.pos(POS.SCREEN_CENTER.x, POS.SCREEN_CENTER.y);
        this._gameBox.addChild(player);

        window.player = player;

        event.regist(EVENT.ON_STICK_DEG_CHANGE, ({
            release, offset
        }: {
            release: boolean, offset: IPoint
        }) => {
            if (release) {
                playerRig.setVelocity({x: 0, y: 0});
            } else {
                playerRig.setVelocity({
                    x: offset.x * 0.1, y: offset.y * 0.1
                });
            }
        });
    }
    

}