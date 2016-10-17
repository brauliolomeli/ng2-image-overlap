import { PerspectiveTransform } from '../PerspectiveTransform';
import * as model from './';
import * as interact from 'interact.js';
let instance: DisplayingImage;

export class DisplayingImage {
    public parent: model.Image;
    public perspective: PerspectiveTransform;
    public polygon: model.Polygon;
    public id: string;
    public width: number;
    public height: number;
    public corners: any = {'tr': 0, 'tl': 1, 'bl': 2, 'br': 3};
    constructor(
        parent: model.Image,
        locationImageBase: model.Point,
        factor: number,
        index: number
    ) {
        this.id = 'img_' + index;
        this.parent = parent;
        this.polygon = model.Polygon.calcRateFactor(locationImageBase, factor, parent, index);
        instance = this;
    }
    initPerspectiveTransform() {
        let dataImage = new Image();
        dataImage.onload = () => {
            this.width = dataImage.width;
            this.height = dataImage.height;
            let img = document.getElementById(this.id);
            this.perspective = new PerspectiveTransform(img, this.width, this.height, true);
            for (let i = this.polygon.points.length - 1; i >= 0; i--) {
                this.polygon.points[i].updatePoint();
                this.moveCorner(this.polygon.points[i]);
            }
            // this.toggleDragDoor(false);
        };
        dataImage.src = this.parent.url;
    }
    moveCorner(point: model.Point) {
        console.log(point.type, point.x + point.extraOptions.transformSumX, point.y + point.extraOptions.transformSumY);
        console.log(point.extraOptions.transformAttribute);
        this.perspective[point.extraOptions.transformAttribute]
        .updateCoords(point.x, point.y);
            // .updateCoords(point.x + point.extraOptions.transformSumX, point.y + point.extraOptions.transformSumY);
        if (this.perspective.checkError() === 0) {
            this.perspective.update();
        } else {
            console.log('Error, should hide image or something');
        }
    }
    // toggleDragDoor(lock: boolean) {
    //     if (lock) {
    //         interact('.draggable' + this.id).draggable({ enabled: false });
    //         // interact('.imageUp').draggable({ enabled: false });
    //     } else {
    //         interact('.draggable_' + this.id)
    //         .draggable({
    //             inertia: true,
    //             restrict: {
    //                 restriction: 'parent',
    //                 endOnly: true,
    //                 elementRect: { top: 0, left: 0, bottom: 1, right: 1 }
    //             },
    //             autoScroll: false,
    //             onmove: instance.dragPointListener,
    //             onend: null
    //         });
    //         // interact('.imageUp')
    //         //     .draggable({
    //         //         inertia: true,
    //         //         restrict: {
    //         //             restriction: 'parent',
    //         //             endOnly: true,
    //         //             elementRect: { top: 0, left: 0, bottom: 1, right: 1 }
    //         //         },
    //         //         autoScroll: false,
    //         //         onmove: instance.dragDoorListener,
    //         //         onend: null
    //         //     });
    //     }
    // }
//     dragPointListener(event) {
//         let target = event.target;
//         let corner = target.attributes.getNamedItem('corner').value;
//         let point: model.Point = instance.polygon.points[instance.corners[corner]];
//         point.updateCoords(point.x + event.dx, point.y + event.dy);
//         instance.moveCorner(point);


//         // let x = point.x + dx,
//   //     y = point.y + dy;
//   //   // translate the element
//   //   target.style.webkitTransform =
//   //     target.style.transform =
//   //     'translate(' + x + 'px, ' + y + 'px)';
//   //   // update the posiion attributes
//   //   point.updateCoords(x, y);
//   //   instance.updatePoint(id, x, y);



//         // console.log('move point', event, x);
//         // instance.moveCorner(target, event.dx, event.dy);
//     }
}
