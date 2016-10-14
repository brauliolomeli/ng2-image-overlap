import { PerspectiveTransform } from '../PerspectiveTransform';
import * as model from './';

export class DisplayingImage {
    public parent: model.Image;
    public perspective: PerspectiveTransform;
    public polygon: model.Polygon;
    public id: string;
    public width: number;
    public height: number;

    constructor(
        parent: model.Image,
        locationImageBase: model.Point,
        factor: number,
        index: number
    ) {
        this.id = 'img_' + index;
        this.parent = parent;
        this.polygon = model.Polygon.calcRateFactor(locationImageBase, factor, parent, index);
    }
    initPerspectiveTransform() {
        let dataImage = new Image();
        dataImage.onload = () => {
            this.width = dataImage.width;
            this.height = dataImage.height;
            let img = document.getElementById(this.id);
            this.perspective = new PerspectiveTransform(img, dataImage.width, dataImage.height, true);
            for (let i = this.polygon.points.length - 1; i >= 0; i--) {
                this.polygon.points[i].initPerspective();
                this.moveCorner(this.polygon.points[i]);
            }
        };
        dataImage.src = this.parent.url;
    }
    moveCorner(point: model.Point) {
        console.log(point.type, point.x + point.extraOptions.transformSumX, point.y + point.extraOptions.transformSumY);
        this.perspective[point.extraOptions.transformAttribute]
            .updateCoords(point.x + point.extraOptions.transformSumX, point.y + point.extraOptions.transformSumY);
        if (this.perspective.checkError() === 0) {
            this.perspective.update();
        } else {
            console.log('Error, should hide image or something');
        }
    }
}
