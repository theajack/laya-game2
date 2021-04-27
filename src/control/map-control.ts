import {COLOR, EVENT, SIZE} from '../util/constant';
import event from '../util/event';
import {IPoint} from '../util/type';
import GameControl from './GameControl';
import {getStageSize, SCREEN_CENTER} from './size';

let scene: Laya.Scene;

const mapPos: IPoint = {x: 0, y: 0};

export function getMapPosition () {
    return mapPos;
}

export function initMap (instance: GameControl) {
    scene = instance.owner as Laya.Scene;
    window.scene = scene;
    scene.width = SIZE.MAP_WIDTH;
    scene.height = SIZE.MAP_HEIGHT;
    Laya.stage.bgColor = COLOR.STAGE_BG;
    drawMap();
    initMapAutoMoveEvent();
}


const AutoMove = {
    enable: false,
    RATE: 0.1,
    offset: {
        x: 0,
        y: 0,
    }
};
export function initMapAutoMoveEvent () {
    event.regist(EVENT.ON_STICK_DEG_CHANGE, ({
        release
    }: {
        release: boolean, offset: IPoint
    }) => {
        AutoMove.enable = !release;
    });
}

export function mapAutoMove () {
    if (!AutoMove.enable) {return;}

    moveMapTo({
        x: GameControl.player.x - SCREEN_CENTER.x,
        y: GameControl.player.y - SCREEN_CENTER.y,
    });
    // scene.transform = new Laya.Matrix(1,0,0,1,-x,-y)
}
window.moveMapTo = moveMapTo;

export function moveMapTo (point: IPoint) {
    const size = getStageSize();
    // if (!Laya.stage.viewport) {
    //     Laya.stage.viewport = new Laya.Rectangle(0, 0, size.width, size.height);
    // }
    // Laya.stage.viewport.setTo(point.x, point.y, size.width, size.height);
    scene.viewport.setTo(point.x, point.y, size.width, size.height);
    if (!Laya.stage.scrollRect) {
        Laya.stage.scrollRect = new Laya.Rectangle(0, 0, size.width, size.height);
    }
    Laya.stage.scrollRect.x = point.x;
    Laya.stage.scrollRect.y = point.y;

    mapPos.x = point.x;
    mapPos.y = point.y;
    event.emit(EVENT.ON_MAP_MOVE);
}
window.moveMap = moveMap;

export function moveMap (point: IPoint) {
    moveMapTo({
        x: mapPos.x + point.x,
        y: mapPos.y + point.y
    });
}

export function drawMap () {
    const g = scene.graphics;
    g.clear();
    g.drawRect(0, 0, SIZE.MAP_WIDTH, SIZE.MAP_HEIGHT, COLOR.MAP_BG);

    let x = SIZE.BLOCK_LEN;
    while (x < SIZE.MAP_WIDTH) {
        g.drawLine(x, 0, x, SIZE.MAP_HEIGHT, COLOR.BLOCK_LINE);
        x += SIZE.BLOCK_LEN;
    }
    
    let y = SIZE.BLOCK_LEN;
    while (y < SIZE.MAP_WIDTH) {
        g.drawLine(0, y, SIZE.MAP_WIDTH, y, COLOR.BLOCK_LINE);
        y += SIZE.BLOCK_LEN;
    }
}