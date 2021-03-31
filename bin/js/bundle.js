(function () {
    'use strict';

    const SIZE = {
        MAP_WIDTH: 1200,
        MAP_HEIGHT: 1200,
        BLOCK_LEN: 300,
    };
    const COLOR = {
        MAP_BG: '#ffffff',
        BLOCK_LINE: '#eeeeee',
        STAGE_BG: '#dddddd',
    };

    function getStageSize() {
        return {
            width: Laya.stage.width,
            height: Laya.stage.height
        };
    }

    let scene;
    const mapPos = { x: 0, y: 0 };
    function getMapPosition() {
        return mapPos;
    }
    function initMap(instance) {
        scene = instance.owner;
        scene.width = SIZE.MAP_WIDTH;
        scene.height = SIZE.MAP_HEIGHT;
        Laya.stage.bgColor = COLOR.STAGE_BG;
        drawMap();
    }
    function moveMapTo(point) {
        const size = getStageSize();
        scene.viewport.setTo(point.x, point.y, size.width, size.height);
        scene.x = -point.x;
        scene.y = -point.y;
        mapPos.x = point.x;
        mapPos.y = point.y;
    }
    function moveMap(point) {
        moveMapTo({
            x: mapPos.x + point.x,
            y: mapPos.y + point.y
        });
    }
    function drawMap() {
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

    class GameControl extends Laya.Script {
        constructor() {
            super();
            GameControl.instance = this;
        }
        onEnable() {
        }
        onStart() {
            initMap(this);
        }
        onUpdate() {
        }
        onStageClick(e) {
            e.stopPropagation();
            moveMap({ x: 0, y: 100 });
        }
    }

    class GameConfig {
        constructor() {
        }
        static init() {
            var reg = Laya.ClassUtils.regClass;
            reg("control/GameControl.ts", GameControl);
        }
    }
    GameConfig.width = 640;
    GameConfig.height = 1136;
    GameConfig.scaleMode = "fixedwidth";
    GameConfig.screenMode = "none";
    GameConfig.alignV = "top";
    GameConfig.alignH = "left";
    GameConfig.startScene = "battle.scene";
    GameConfig.sceneRoot = "";
    GameConfig.debug = false;
    GameConfig.stat = false;
    GameConfig.physicsDebug = false;
    GameConfig.exportSceneToJson = true;
    GameConfig.init();

    ;

    class Main {
        constructor() {
            if (window['Laya3D'])
                Laya3D.init(GameConfig.width, GameConfig.height);
            else
                Laya.init(GameConfig.width, GameConfig.height, Laya['WebGL']);
            Laya['Physics'] && Laya['Physics'].enable();
            Laya['DebugPanel'] && Laya['DebugPanel'].enable();
            Laya.stage.scaleMode = GameConfig.scaleMode;
            Laya.stage.screenMode = GameConfig.screenMode;
            Laya.stage.alignV = GameConfig.alignV;
            Laya.stage.alignH = GameConfig.alignH;
            Laya.URL.exportSceneToJson = GameConfig.exportSceneToJson;
            if (GameConfig.debug || Laya.Utils.getQueryString('debug') == 'true')
                Laya.enableDebugPanel();
            if (GameConfig.physicsDebug && Laya['PhysicsDebugDraw'])
                Laya['PhysicsDebugDraw'].enable();
            if (GameConfig.stat)
                Laya.Stat.show();
            Laya.alertGlobalError(true);
            Laya.ResourceVersion.enable('version.json', Laya.Handler.create(this, this.onVersionLoaded), Laya.ResourceVersion.FILENAME_VERSION);
        }
        onVersionLoaded() {
            Laya.AtlasInfoManager.enable('fileconfig.json', Laya.Handler.create(this, this.onConfigLoaded));
        }
        onConfigLoaded() {
            GameConfig.startScene && Laya.Scene.open(GameConfig.startScene);
        }
    }
    new Main();

}());