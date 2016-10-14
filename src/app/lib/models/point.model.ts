import * as model from './';
export class Point {
    x: number;
    y: number;
    id: string;
    type: string;
    extraOptions: any;
    public static calcRateFactor(
        locationImageBase: model.Point, factor: number, referencePoint: model.Point, index: number, type: string
    ): Point {
        return new Point(
            (referencePoint.x / factor) + locationImageBase.x,
            (referencePoint.y / factor) + locationImageBase.y,
            'point_' + index + '_' + type,
            type
        );
    }
    constructor(x, y, id?: string, type?: string) {
        this.id = id;
        this.type = type;
        this.updateCoords(x, y);
        // extra options to use perspective transform
        if (type === 'br') {
            this.extraOptions = {
                transformAttribute: 'bottomRight',
                transformSumX: 5,
                transformSumY: 5,
            };
        } else if (type === 'bl') {
            this.extraOptions = {
                transformAttribute: 'bottomLeft',
                transformSumX: 0,
                transformSumY: 5,
            };
        } else if (type === 'tl') {
            this.extraOptions = {
                transformAttribute: 'topLeft',
                transformSumX: 5,
                transformSumY: 0,
            };
        } else if (type === 'tr') {
            this.extraOptions = {
                transformAttribute: 'topRight',
                transformSumX: 5,
                transformSumY: 0,
            };
        }
    }
    updateCoords(x, y) {
        this.x = x;
        this.y = y;
    }
    initPerspective() {
        let target = document.getElementById(this.id);
        target.style.webkitTransform =
            target.style.transform =
            'translate(' + this.x + 'px, ' + this.y + 'px)';
    }
}
