/*
 * @Author: tackchen
 * @Date: 2021-03-31 14:46:51
 * @LastEditors: tackchen
 * @LastEditTime: 2021-03-31 14:49:49
 * @FilePath: \laya-demo-viewport\src\control\size.ts
 * @Description: Coding something
 */

export function getStageSize () {
    return {
        width: Laya.stage.width,
        height: Laya.stage.height
    };
}