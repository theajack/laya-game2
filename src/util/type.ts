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

export interface IRect extends ISize {
    x: number;
    y: number;
}

export interface ISize {
    width: number;
    height: number;
}