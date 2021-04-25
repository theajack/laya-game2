declare global {
    interface Window {
        [prop: string]: any;
    }
}

export interface IPoint {
    x: number;
    y: number;
};

export interface ICircle extends IPoint {
    r: number;
}

export interface IRect {
    x: number;
    y: number;
    width: number;
    height: number;
}