(function () {
    'use strict';

    const SIZE = {
        MAP_WIDTH: 1200,
        MAP_HEIGHT: 1200,
        BLOCK_LEN: 300,
        OBJECT_RADIUS: 50,
    };
    const COLOR = {
        MAP_BG: '#ffffff',
        BLOCK_LINE: '#eeeeee',
        STAGE_BG: '#dddddd',
    };
    const EVENT = {
        ON_MAP_MOVE: 'ON_MAP_MOVE',
        ON_STICK_DEG_CHANGE: 'ON_STICK_DEG_CHANGE',
        ON_INIT_SIZE: 'ON_INIT_SIZE',
    };

    function isUndf(v) { return typeof v === 'undefined'; }
    function isObject(v) { return typeof v === 'object'; }
    function findPos(array, order, orderBefore) {
        const n = array.length;
        if (n === 0) {
            return 0;
        }
        const result = bsearch(array, 0, n - 1, order, orderBefore);
        return result;
    }
    function bsearch(array, low, high, order, orderBefore) {
        const mid = Math.floor((low + high) / 2);
        if (low > high)
            return mid + 1;
        if (array[mid].order > order) {
            return bsearch(array, low, mid - 1, order, orderBefore);
        }
        else if (array[mid].order < order) {
            return bsearch(array, mid + 1, high, order, orderBefore);
        }
        else {
            if (orderBefore) {
                if (mid === 0 || array[mid - 1].order < order) {
                    return mid;
                }
                return bsearch(array, low, mid - 1, order, orderBefore);
            }
            else {
                if (mid === array.length - 1 || array[mid + 1].order > order) {
                    return mid + 1;
                }
                return bsearch(array, mid + 1, high, order, orderBefore);
            }
        }
    }

    function createLocker() {
        let list = [];
        let locked = false;
        function exec() {
            if (list.length === 0) {
                return;
            }
            list.sort((a, b) => b.index - a.index);
            for (let i = 0; i < list.length; i++) {
                list[i].func();
            }
            list = [];
        }
        return {
            add({ index, func }) {
                locked ? list.push({ index, func }) : func();
            },
            lock(fn) {
                locked = true;
                const ret = fn();
                exec();
                locked = false;
                return ret;
            }
        };
    }

    let _onRegist;
    function onRegist(fn) {
        _onRegist = fn;
    }
    const triggerOnRegist = (option) => {
        if (_onRegist)
            _onRegist(option);
    };
    let _onEmit;
    function onEmit(fn) {
        _onEmit = fn;
    }
    const triggerOnEmit = (option) => {
        if (_onEmit)
            _onEmit(option);
    };
    function clearInterceptor() {
        _onRegist = undefined;
        _onEmit = undefined;
    }

    function createListener(event, { listener, immediate = true, once = false, order, orderBefore = false, name = '', head = false, tail = false, times = -1, }) {
        const id = ++event.id;
        if (once) {
            times = 1;
        }
        return {
            eventName: event.eventName,
            listener,
            once,
            immediate,
            hasTrigger: false,
            order,
            id,
            name: name || (`${event.eventName}-${id}`),
            single: event.singleMode,
            head,
            tail,
            orderBefore,
            times,
            timesLeft: times,
        };
    }
    function triggerListenerItem(listenerItem, data, firstEmit) {
        if (!listenerItem || listenerItem.timesLeft === 0)
            return;
        listenerItem.hasTrigger = true;
        if (listenerItem.timesLeft > 0) {
            listenerItem.timesLeft--;
        }
        const event = getEvent(listenerItem.eventName);
        if (typeof firstEmit === 'undefined') {
            firstEmit = event.hasTrigger === false;
        }
        const emitOption = buildListenOption({
            firstEmit,
            item: listenerItem,
            event
        });
        listenerItem.listener(data, emitOption);
        triggerOnEmit(Object.assign({ eventName: event.eventName, data }, emitOption));
    }
    function buildListenOption({ firstEmit, item, event }) {
        return {
            firstEmit,
            item,
            remove: () => event.remove(item.id),
            clear: () => event.clear()
        };
    }

    function countInsertIndex({ listeners, eventOrder, index, order, orderBefore = false, head, tail }) {
        let insertIndex;
        const n = listeners.length;
        let needAddOrder = false;
        if (head) {
            index = 0;
        }
        else if (tail) {
            index = n;
        }
        if (typeof index === 'number') {
            if (index > n) {
                index = n;
            }
            else if (index < 0) {
                index = 0;
            }
            const item = listeners[index === n ? index - 1 : index];
            if (item) {
                order = item.order;
            }
            else {
                order = eventOrder + 1;
                needAddOrder = true;
            }
            insertIndex = index;
        }
        else {
            if (typeof order !== 'number') {
                order = eventOrder + 1;
                needAddOrder = true;
            }
            insertIndex = (n === 0 || order > findLastOrder(listeners)) ?
                n :
                findPos(listeners, order, orderBefore);
        }
        return { insertIndex, order, needAddOrder };
    }
    function findLastOrder(listeners) {
        for (let i = listeners.length - 1; i >= 0; i--) {
            if (listeners[i]) {
                return listeners[i].order;
            }
        }
        return 0;
    }

    class Event {
        constructor(eventName) {
            this.eventName = eventName;
            this._init();
        }
        _init() {
            this._locker = createLocker();
            this._triggerData = undefined;
            this.order = 0;
            this.hasTrigger = false;
            this.id = 0;
            this.singleMode = false;
            this.listeners = [];
        }
        regist({ listener, immediate = true, once = false, order, orderBefore = false, index, single = false, name = '', head = false, tail = false, times = -1, }) {
            this.singleMode = (this.singleMode || single);
            let insertIndex;
            if (this.singleMode) {
                this.listeners = [];
                insertIndex = 0;
                order = 0;
            }
            else {
                const result = countInsertIndex({
                    listeners: this.listeners,
                    eventOrder: this.order,
                    index, order, orderBefore, head, tail
                });
                if (result.needAddOrder) {
                    this.order++;
                }
                insertIndex = result.insertIndex;
                order = result.order;
            }
            const item = createListener(this, {
                listener, immediate, once, order, orderBefore, name, head, tail, times,
            });
            triggerOnRegist({ eventName: this.eventName, item });
            this._locker.add({
                index: insertIndex,
                func: () => { this.listeners.splice(insertIndex, 0, item); }
            });
            if (immediate && this.hasTrigger) {
                triggerListenerItem(item, this._triggerData);
            }
            return item;
        }
        emit(data) {
            return this._locker.lock(() => {
                this._triggerData = data;
                const firstEmit = this.hasTrigger === false;
                if (!this.hasTrigger) {
                    this.hasTrigger = true;
                }
                for (let i = 0; i < this.listeners.length; i++) {
                    triggerListenerItem(this.listeners[i], data, firstEmit);
                }
                return firstEmit;
            });
        }
        remove(cond, immediate = false) {
            let index;
            if (this.singleMode) {
                index = 0;
            }
            else {
                let attr;
                const type = typeof cond;
                if (type === 'number') {
                    attr = 'id';
                }
                else if (type === 'function') {
                    attr = 'listener';
                }
                else {
                    console.warn('removeEvent 传入的参数有误');
                    return false;
                }
                const result = this.listeners.find(item => {
                    return item && item[attr] === cond;
                });
                if (!result) {
                    return false;
                }
                index = this.listeners.indexOf(result);
                if (immediate) {
                    this.listeners[index] = undefined;
                }
            }
            this._locker.add({
                index,
                func: () => { this.listeners.splice(index, 1); }
            });
            return true;
        }
        clear() {
            this._init();
            return true;
        }
    }

    let events = {};
    let EVENT$1 = {};
    function getEvent(eventName) {
        return events[nameToStr(eventName)];
    }
    function setEvent(eventName) {
        const name = nameToStr(eventName);
        events[name] = new Event(name);
        EVENT$1[name] = name;
    }
    function delEvent(eventName) {
        delete events[nameToStr(eventName)];
        delete EVENT$1[nameToStr(eventName)];
    }
    function getEVENT(eventName) {
        if (isUndf(eventName)) {
            return EVENT$1;
        }
        return EVENT$1[nameToStr(eventName)];
    }
    function clearEvent() {
        events = {};
        EVENT$1 = {};
        clearInterceptor();
    }
    function nameToStr(eventName) {
        if (typeof eventName === 'number') {
            return eventName.toString();
        }
        return eventName;
    }

    var version = '0.0.6';

    function createEventLink(eventName) {
        const options = {
            eventName,
            listener: () => { }
        };
        return {
            single(single = true) {
                options.single = single;
                return this;
            },
            notImmediate(immediate = false) {
                options.immediate = immediate;
                return this;
            },
            once(once = true) {
                options.once = once;
                return this;
            },
            index(index) {
                options.index = index;
                return this;
            },
            head() {
                options.head = true;
                return this;
            },
            tail() {
                options.tail = true;
                return this;
            },
            name(name) {
                options.name = name;
                return this;
            },
            orderBefore(orderBefore = true) {
                options.orderBefore = orderBefore;
                return this;
            },
            order(order) {
                options.order = order;
                return this;
            },
            listener(listener) {
                options.listener = listener;
                return this;
            },
            times(times) {
                options.times = times;
                return this;
            },
            listen(listener) {
                if (listener) {
                    options.listener = listener;
                }
                return registBase(options);
            }
        };
    }

    function checkEvent(eventName) {
        if (getEvent(eventName)) {
            return true;
        }
        else {
            return false;
        }
    }
    function init(eventName) {
        if (isUndf(getEVENT(eventName))) {
            setEvent(eventName);
        }
    }
    function regist(eventName, listener) {
        if (isObject(eventName)) {
            const result = {};
            for (const key in eventName) {
                result[key] = regist(key, eventName[key]);
            }
            return result;
        }
        if (typeof listener === 'function') {
            return registBase({ eventName: eventName, listener });
        }
        else if (typeof listener === 'object') {
            return registBase(Object.assign({ eventName: eventName }, listener));
        }
        else if (typeof listener === 'undefined') {
            if (typeof eventName === 'string' || typeof eventName === 'number') {
                return createEventLink(eventName);
            }
        }
        console.warn('错误的listener', eventName, listener);
        return null;
    }
    function registNotImmediate(eventName, listener) {
        return regist(eventName, {
            immediate: false,
            listener
        });
    }
    function registOnce(eventName, listener) {
        return regist(eventName, {
            once: true,
            listener
        });
    }
    function registNotImmediateOnce(eventName, listener) {
        return regist(eventName, {
            immediate: false,
            once: true,
            listener
        });
    }
    function registSingle(eventName, listener) {
        return regist(eventName, {
            single: true,
            listener,
        });
    }
    function registBase({ once = false, immediate = true, eventName, listener, order, orderBefore, index, single, name, head, tail, times, }) {
        if (!checkEvent(eventName)) {
            init(eventName);
        }
        return getEvent(eventName).regist({
            listener, once, immediate, order, orderBefore, index, single, name, head, tail, times
        });
    }
    function remove(eventName, cond, immediate) {
        if (typeof eventName === 'object') {
            immediate = cond;
            if (eventName === null) {
                console.error('参数错误', eventName);
                return false;
            }
            return remove(eventName.eventName, eventName.id, immediate);
        }
        if (typeof eventName === 'object') {
            const item = eventName;
            return remove(item.eventName, item.id);
        }
        if (!checkEvent(eventName)) {
            console.warn('removeEvent:未找到事件 ' + eventName);
            return false;
        }
        if (isUndf(cond)) {
            console.error('请传入要移除的listener 或 id');
            return false;
        }
        else {
            return getEvent(eventName).remove(cond, immediate);
        }
    }
    function clear(eventName) {
        if (typeof eventName === 'string' || typeof eventName === 'number') {
            if (checkEvent(eventName)) {
                getEvent(eventName).clear();
                delEvent(eventName);
            }
        }
        else if (eventName instanceof Array) {
            eventName.forEach(n => {
                clear(n);
            });
        }
        else {
            clearEvent();
        }
    }
    function emit(eventName, data) {
        if (!checkEvent(eventName)) {
            init(eventName);
        }
        return getEvent(eventName).emit(data);
    }
    function order(eventName) {
        if (checkEvent(eventName)) {
            return getEvent(eventName).order;
        }
        else {
            return -1;
        }
    }
    var event = {
        version,
        EVENT: getEVENT(),
        emit,
        onEmit,
        regist,
        onRegist,
        checkEvent,
        remove,
        clear,
        order,
        registNotImmediate,
        registNotImmediateOnce,
        registOnce,
        registSingle,
    };

    function getStageSize() {
        return {
            width: Laya.stage.width,
            height: Laya.stage.height
        };
    }
    const DEFAULT_STAGE_SIZE = {
        WIDTH: 667,
        HEIGHT: 375,
    };
    const MAP_DIAMETER = 1200;
    const OBJ_DIAMETER = 100;
    const SCREEN_CENTER = {
        x: DEFAULT_STAGE_SIZE.WIDTH / 2,
        y: DEFAULT_STAGE_SIZE.HEIGHT / 2,
    };
    const STICK = (() => {
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
            RELATIVE_POS,
            STICK_MARGIN,
            RELATIVE_CENTER_POS,
            STICK_RELATIVE_POS: new Laya.Point(STICK_MARGIN, STICK_MARGIN),
            setRelativeSize(stageHeight) {
                SCREEN_HEIGHT = stageHeight;
                RELATIVE_POS.y = SCREEN_HEIGHT - DIAMETER - MARGIN;
                RELATIVE_CENTER_POS.y = RELATIVE_POS.y + DIAMETER / 2;
            }
        };
        POS.setRelativeSize(DEFAULT_STAGE_SIZE.HEIGHT);
        return POS;
    })();
    function setRelativeSize() {
        const stageSize = getStageSize();
        STICK.setRelativeSize(stageSize.height);
        SCREEN_CENTER.x = stageSize.width / 2;
        SCREEN_CENTER.y = stageSize.height / 2;
        event.emit(EVENT.ON_INIT_SIZE, stageSize);
        Laya.stage.on(Laya.Event.RESIZE, null, () => {
            setRelativeSize();
        });
    }

    let scene;
    const mapPos = { x: 0, y: 0 };
    function getMapPosition() {
        return mapPos;
    }
    function initMap(instance) {
        scene = instance.owner;
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
    function initMapAutoMoveEvent() {
        event.regist(EVENT.ON_STICK_DEG_CHANGE, ({ release }) => {
            AutoMove.enable = !release;
        });
    }
    function mapAutoMove() {
        if (!AutoMove.enable) {
            return;
        }
        moveMapTo({
            x: GameControl.player.x - SCREEN_CENTER.x,
            y: GameControl.player.y - SCREEN_CENTER.y,
        });
    }
    window.moveMapTo = moveMapTo;
    function moveMapTo(point) {
        const size = getStageSize();
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
            setRelativeSize();
            this._gameBox = this.owner.getChildByName('gameBox');
            this._uiControl = this.owner.getChildByName('uiControl');
            event.regist(EVENT.ON_MAP_MOVE, () => {
                const mapOffset = getMapPosition();
                this._uiControl.x = mapOffset.x;
                this._uiControl.y = mapOffset.y;
            });
            event.regist(EVENT.ON_INIT_SIZE, (size) => {
                this._uiControl.width = size.width;
                this._uiControl.height = size.height;
            });
            window.createWall = this.createWall.bind(this);
            window.gameBox = this._gameBox;
            window.uiControl = this._uiControl;
            window.gameControl = this;
        }
        onStart() {
            initMap(this);
            this._initPlayer();
        }
        onUpdate() {
            mapAutoMove();
        }
        onStageClick(e) {
            e.stopPropagation();
        }
        createWall(x, y) {
            const wall = Laya.Pool.getItemByCreateFun('wall', this.wall.create, this.wall);
            wall.pivot(wall.width / 2, wall.height / 2);
            wall.pos(x, y);
            this._gameBox.addChild(wall);
            window.wall = wall;
        }
        _initPlayer() {
            const player = Laya.Pool.getItemByCreateFun('player', this.player.create, this.player);
            const playerRig = player.getComponent(Laya.RigidBody);
            player.pivot(player.width / 2, player.height / 2);
            GameControl.player = player;
            player.pos(SCREEN_CENTER.x, SCREEN_CENTER.y);
            this._gameBox.addChild(player);
            window.player = player;
            event.regist(EVENT.ON_STICK_DEG_CHANGE, ({ release, offset }) => {
                if (release) {
                    playerRig.setVelocity({ x: 0, y: 0 });
                }
                else {
                    playerRig.setVelocity({
                        x: offset.x * 0.1, y: offset.y * 0.1
                    });
                }
            });
            event.regist(EVENT.ON_INIT_SIZE, () => {
                moveMapTo({
                    x: player.x - SCREEN_CENTER.x,
                    y: player.y - SCREEN_CENTER.y,
                });
            });
        }
    }

    function random(a, b) {
        return (a + Math.round(Math.random() * (b - a)));
    }
    function isPointInRect({ point, rect, border = false, }) {
        if (border) {
            return (point.x >= rect.x &&
                point.x <= rect.x + rect.width &&
                point.y >= rect.y &&
                point.y <= rect.y + rect.height);
        }
        return (point.x > rect.x &&
            point.x < rect.x + rect.width &&
            point.y > rect.y &&
            point.y < rect.y + rect.height);
    }

    class stick extends Laya.Script {
        constructor() {
            super();
            this.isTouchDown = false;
        }
        onEnable() {
            this.stick = this.owner.getChildByName('stick');
            event.regist(EVENT.ON_INIT_SIZE, () => {
                const stickBg = this.owner;
                stickBg.x = STICK.RELATIVE_POS.x;
                stickBg.y = STICK.RELATIVE_POS.y;
            });
            window.stick = this;
        }
        onStageMouseDown(e) {
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
        onStageMouseUp() {
            this._releaseStick();
        }
        onStageMouseMove(e) {
            if (!this.isTouchDown) {
                return;
            }
            this._setStickPosition(e);
        }
        _countStickDeg(dis, dx, dy) {
            event.emit(EVENT.ON_STICK_DEG_CHANGE, {
                release: false,
                offset: {
                    x: STICK.RADIUS * (dx / dis),
                    y: STICK.RADIUS * (dy / dis)
                }
            });
        }
        _releaseStick() {
            if (this.isTouchDown) {
                this.isTouchDown = false;
                this._resetStickPosition();
                event.emit(EVENT.ON_STICK_DEG_CHANGE, { release: true });
            }
        }
        _setStickPosition(e) {
            const dis = STICK.RELATIVE_CENTER_POS.distance(e.stageX, e.stageY);
            let x, y;
            if (dis > STICK.RADIUS) {
                const rate = STICK.RADIUS / dis;
                x = STICK.RADIUS + rate * (e.stageX - STICK.RELATIVE_CENTER_POS.x);
                y = STICK.RADIUS + rate * (e.stageY - STICK.RELATIVE_CENTER_POS.y);
            }
            else {
                x = e.stageX - STICK.RELATIVE_POS.x;
                y = e.stageY - STICK.RELATIVE_POS.y;
            }
            this._countStickDeg(dis, e.stageX - STICK.RELATIVE_CENTER_POS.x, e.stageY - STICK.RELATIVE_CENTER_POS.y);
            this._initStickPosition(x - STICK.STICK_RADIUS, y - STICK.STICK_RADIUS);
        }
        _resetStickPosition() {
            this._initStickPosition(STICK.STICK_MARGIN, STICK.STICK_MARGIN);
        }
        _initStickPosition(x, y) {
            STICK.STICK_RELATIVE_POS.setTo(x, y);
            this.stick.x = x;
            this.stick.y = y;
        }
    }

    class enemy extends Laya.Script {
        constructor() {
            super();
            this.intType = 1000;
            this.numType = 1000;
            this.strType = 'hello laya';
            this.boolType = true;
        }
        onEnable() {
        }
        onDisable() {
        }
    }

    class player extends Laya.Script {
        constructor() {
            super();
            this.intType = 1000;
            this.numType = 1000;
            this.strType = 'hello laya';
            this.boolType = true;
        }
        onEnable() {
            window.playerScript = this;
        }
        onDisable() {
        }
    }

    class star extends Laya.Script {
        constructor() {
            super();
            this.intType = 1000;
            this.numType = 1000;
            this.strType = 'hello laya';
            this.boolType = true;
        }
        onEnable() {
        }
        onDisable() {
        }
    }

    class wall extends Laya.Script {
        constructor() {
            super();
            this.intType = 1000;
            this.numType = 1000;
            this.strType = 'hello laya';
            this.boolType = true;
        }
        onEnable() {
        }
        onDisable() {
        }
    }

    class GameConfig {
        constructor() {
        }
        static init() {
            var reg = Laya.ClassUtils.regClass;
            reg("control/GameControl.ts", GameControl);
            reg("control/stick.ts", stick);
            reg("object/enemy.ts", enemy);
            reg("object/player.ts", player);
            reg("object/star.ts", star);
            reg("object/wall.ts", wall);
        }
    }
    GameConfig.width = 667;
    GameConfig.height = 375;
    GameConfig.scaleMode = "fixedwidth";
    GameConfig.screenMode = "horizontal";
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
