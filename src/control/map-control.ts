import {COLOR, SIZE} from '../util/constant';
import {IPoint} from '../util/type';
import GameControl from './GameControl';
import {getStageSize} from './size';

let scene: Laya.Scene;

const mapPos: IPoint = {x: 0, y: 0};

export function getMapPosition () {
    return mapPos;
}

export function initMap (instance: GameControl) {
    scene = instance.owner as Laya.Scene;
    scene.width = SIZE.MAP_WIDTH;
    scene.height = SIZE.MAP_HEIGHT;
    Laya.stage.bgColor = COLOR.STAGE_BG;
    drawMap();
}

export function moveMapTo (point: IPoint) {
    const size = getStageSize();
    scene.viewport.setTo(point.x, point.y, size.width, size.height);
    scene.x = -point.x;
    scene.y = -point.y;

    mapPos.x = point.x;
    mapPos.y = point.y;
}

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