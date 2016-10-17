import * as model from './';

export class Point {
    x: number;
    y: number;
    id: string;
    type: string;
    extraOptions: any;
    public static calcRateFactor(
        locationImageBase: model.Point, factor: number, referencePoint: model.Point, index: number, type: string, zoom: number
    ): Point {
        zoom = zoom || 100;
        return new Point(
            (zoom * 0.01 * referencePoint.x / factor) + locationImageBase.x,
            (zoom * 0.01 * referencePoint.y / factor) + locationImageBase.y,
            'point_' + index + '_' + type,
            type
        );
    }
    constructor(x, y, id?: string, type?: string) {
        this.id = id;
        this.type = type;
        this.updateCoords(x, y);
        if (type === 'br') {
            this.extraOptions = {transformAttribute: 'bottomRight'};
        } else if (type === 'bl') {
            this.extraOptions = {transformAttribute: 'bottomLeft'};
        } else if (type === 'tl') {
            this.extraOptions = {transformAttribute: 'topLeft'};
        } else if (type === 'tr') {
            this.extraOptions = {transformAttribute: 'topRight'};
        }
    }
    move(dx, dy, updateDom = false) {
        this.updateCoords(this.x + dx, this.y + dy, updateDom);
    }
    updateCoords(x, y, updateDom = false) {
        this.x = x;
        this.y = y;
        if (updateDom) {
            this.updatePoint();
        }
    }
    updatePoint() {
        let target = document.getElementById(this.id);
        if (target) {
            target.style.webkitTransform =
                target.style.transform =
                'translate(' + this.x + 'px, ' + this.y + 'px)';
        }
    }
}
