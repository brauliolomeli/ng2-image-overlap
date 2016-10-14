import * as model from './';
export class Polygon {
    points: model.Point[];
    public static calcRateFactor(locationImageBase: model.Point, factor: number, referenceImage: model.Image, index: number) {
        return new Polygon([
            model.Point.calcRateFactor(locationImageBase, factor, referenceImage.polygon.points[0], index, 'tl'),
            model.Point.calcRateFactor(locationImageBase, factor, referenceImage.polygon.points[1], index, 'tr'),
            model.Point.calcRateFactor(locationImageBase, factor, referenceImage.polygon.points[2], index, 'bl'),
            model.Point.calcRateFactor(locationImageBase, factor, referenceImage.polygon.points[3], index, 'br')
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
