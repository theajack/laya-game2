export function random (a: number, b: number) {
    return (a + Math.round(Math.random() * (b - a)));
}