import {IPoint, IRect} from './type';

export function random (a: number, b: number) {
    return (a + Math.round(Math.random() * (b - a)));
}

export function isPointInRect ({
    point,
    rect,
    border = false,
}: {
    point: IPoint;
    rect: IRect;
    border?: boolean;
}) {
    if (border) {
        return (
            point.x >= rect.x &&
            point.x <= rect.x + rect.width &&
            point.y >= rect.y &&
            point.y <= rect.y + rect.height
        );
    }
    return (
        point.x > rect.x &&
        point.x < rect.x + rect.width &&
        point.y > rect.y &&
        point.y < rect.y + rect.height
    );
}