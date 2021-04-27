/*
 * @Author: tackchen
 * @Date: 2021-03-31 14:46:51
 * @LastEditors: theajack
 * @LastEditTime: 2021-04-27 22:59:03
 * @FilePath: \laya-demo-viewport\src\control\size.ts
 * @Description: Coding something
 */

import {EVENT} from '../util/constant';
import event from '../util/event';


export function getStageSize () {
    return {
        width: Laya.stage.width,
        height: Laya.stage.height
    };
}

export const DEFAULT_STAGE_SIZE = {
    WIDTH: 667,
    HEIGHT: 375,
};

export const MAP_DIAMETER = 1200;

export const OBJ_DIAMETER = 100;

export const SCREEN_CENTER = {
    x: DEFAULT_STAGE_SIZE.WIDTH / 2,
    y: DEFAULT_STAGE_SIZE.HEIGHT / 2,
};

export const STICK = (() => {
    const MARGIN = 40;
    const DIAMETER = 100;
    let SCREEN_HEIGHT = 0;
    const STICK_DIAMETER = DIAMETER / 2;
    const RELATIVE_POS = new Laya.Point(MARGIN, 0);
    const RELATIVE_CENTER_POS = new Laya.Point(RELATIVE_POS.x + DIAMETER / 2, 0);
    const STICK_MARGIN = (DIAMETER - STICK_DIAMETER) / 2;
    const POS = {
        MARGIN: 40,
        DIAMETER,
        RADIUS: DIAMETER / 2,
        STICK_DIAMETER,
        STICK_RADIUS: DIAMETER / 4,
        RELATIVE_POS, // 大圆相对屏幕左上角的位置
        STICK_MARGIN,
        RELATIVE_CENTER_POS,
        STICK_RELATIVE_POS: new Laya.Point(STICK_MARGIN, STICK_MARGIN), // 小圆相对于大圆的位置
        setRelativeSize (stageHeight: number) {
            SCREEN_HEIGHT = stageHeight;
            RELATIVE_POS.y = SCREEN_HEIGHT - DIAMETER - MARGIN;
            RELATIVE_CENTER_POS.y = RELATIVE_POS.y + DIAMETER / 2;
        }
    };
    POS.setRelativeSize(DEFAULT_STAGE_SIZE.HEIGHT);
    return POS;
})();

export function setRelativeSize () {
    const stageSize = getStageSize();
    STICK.setRelativeSize(stageSize.height);
    SCREEN_CENTER.x = stageSize.width / 2;
    SCREEN_CENTER.y = stageSize.height / 2;

    event.emit(EVENT.ON_INIT_SIZE, stageSize);

    Laya.stage.on(Laya.Event.RESIZE, null, () => {
        setRelativeSize();
    });
}