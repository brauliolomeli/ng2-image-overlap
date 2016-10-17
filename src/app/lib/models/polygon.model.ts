import * as model from './';
export class Polygon {
    points: model.Point[];
    public static calcRateFactor(locationImageBase: model.Point, factor: number, referenceImage: model.Image, index: number, zoom: number) {
        return new Polygon([
            model.Point.calcRateFactor(locationImageBase, factor, referenceImage.polygon.points[0], index, 'tl', zoom),
            model.Point.calcRateFactor(locationImageBase, factor, referenceImage.polygon.points[1], index, 'tr', zoom),
            model.Point.calcRateFactor(locationImageBase, factor, referenceImage.polygon.points[2], index, 'bl', zoom),
            model.Point.calcRateFactor(locationImageBase, factor, referenceImage.polygon.points[3], index, 'br', zoom)
        ]);
    }
    constructor(
        points: model.Point[]
    ) {
        this.points = points;
    }
    initPoints() {
        //
    }
}
