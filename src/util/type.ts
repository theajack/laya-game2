declare global {
    interface Window {
        [prop: string]: any;
    }
}

export interface IPoint {
    x: number;
    y: number;
};