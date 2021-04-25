import {COLOR, EVENT, SIZE} from '../util/constant';
import event from '../util/event';
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
        release, offset
    }: {
        release: boolean, offset: IPoint
    }) => {
        if (release) {
            AutoMove.enable = false;
        } else {
            AutoMove.enable = true;
            AutoMove.offset.x = offset.x * AutoMove.RATE;
            AutoMove.offset.y = offset.y * AutoMove.RATE;
        }
    });
}

export function mapAutoMove () {
    if (!AutoMove.enable) {return;}

    POS.setMapOffset(AutoMove.offset);
}

export function moveMapTo (point: IPoint) {
    const size = getStageSize();
    scene.viewport.setTo(point.x, point.y, size.width, size.height);
    scene.x = -point.x;
    scene.y = -point.y;

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

export const POS = (() => {
    const SCREEN_WIDTH = 667;
    const SCREEN_HEIGHT = 375;
    const DIAMETER = 100;
    const MAP_DIAMETER = 1200;
    const MARGIN = 40;
    const RADIUS = DIAMETER / 2;
    const STICK_DIAMETER = DIAMETER / 2;
    const STICK_OFFSET = (DIAMETER - STICK_DIAMETER) / 2;
    const RELATIVE_POS = new Laya.Point(MARGIN, SCREEN_HEIGHT - DIAMETER - MARGIN);
    const pos = {
        MOVE_RATE: 0.3,
        DIAMETER, // 大圆的
        RADIUS, // 大圆的半径
        STICK_DIAMETER, // 小圆的半径
        STICK_RADIUS: STICK_DIAMETER / 2, // 小圆的直径
        RELATIVE_POS, // 大圆相对屏幕左上角的位置
        RELATIVE_CENTER_POS: new Laya.Point(RELATIVE_POS.x + DIAMETER / 2, RELATIVE_POS.y + DIAMETER / 2),
        STICK_RELATIVE_POS: new Laya.Point(STICK_OFFSET, STICK_OFFSET), // 小圆相对于大圆的位置
        STICK_OFFSET,
        SCREEN_CENTER: {x: SCREEN_WIDTH / 2, y: SCREEN_HEIGHT / 2},

        // 控制不要移动出边界
        setMapOffset (offset: IPoint) {
            // x, y表示鼠标的落点的相对大圆左上角的位置，也就是小圆的中心点相对大圆左上角的位置
            const currentOffset = getMapPosition();
            if (currentOffset.x + offset.x < -POS.SCREEN_CENTER.x) {
                offset.x = -POS.SCREEN_CENTER.x - currentOffset.x;
            } else if (currentOffset.x + offset.x > -POS.SCREEN_CENTER.x + MAP_DIAMETER) {
                offset.x = -POS.SCREEN_CENTER.x + MAP_DIAMETER - currentOffset.x;
            }
            if (currentOffset.y + offset.y < -POS.SCREEN_CENTER.y) {
                offset.y = -POS.SCREEN_CENTER.y - currentOffset.y;
            } else if (currentOffset.y + offset.y > -POS.SCREEN_CENTER.y + MAP_DIAMETER) {
                console.log(offset.y, POS.SCREEN_CENTER.y, MAP_DIAMETER, currentOffset.y);
                offset.y = -POS.SCREEN_CENTER.y + MAP_DIAMETER - currentOffset.y;
            }
            moveMap(offset);
        }
    };
    return pos;
})();