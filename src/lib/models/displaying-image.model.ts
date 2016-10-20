import { OverlapperComponent } from '../../overlapper/overlapper.component';
import { PerspectiveTransform } from '../PerspectiveTransform';
import * as model from './';
import * as interact from 'interact.js';
(<any>window).appImage = [];

export class DisplayingImage {
    public parent: model.Image;
    public perspective: any;
    public polygon: model.Polygon;
    public id: string;
    public index: number;
    public width: number;
    public height: number;
    public corners: any = { 'tl': 0, 'tr': 1, 'bl': 2, 'br': 3 };
    public imageLocked: boolean = true;
    public zoom: number;
    public factor: number;
    public locationImageBase: model.Point;
    overlapperComponent: OverlapperComponent;
    constructor(
        parent: model.Image,
        locationImageBase: model.Point,
        factor: number,
        index: number,
        zoom: number,
        overlapperComponent: OverlapperComponent
    ) {
        this.id = 'img_' + index + new Date().getTime();
        this.index = index;
        this.parent = parent;
        this.overlapperComponent = overlapperComponent;
        let polygonChanged = false;
        if (parent.polygon.points[3].x === 0) {
            // the polygon is not defined, define it according to image index
            let order = [2, 1, 3],
                width = this.overlapperComponent.dataImageBase.width / 3,
                height = this.overlapperComponent.dataImageBase.height / 3,
                x = order[index % 3],
                y = order[Math.floor(index / 3) % 3],
                marginX = width / 10,
                marginY = height / 10,
                startX = (width * (x - 1)) + marginX,
                endX = (width * x) - marginX,
                startY = (height * (y - 1)) + marginY,
                endY = (height * y) - marginY;
            this.parent.polygon = new model.Polygon([
                new model.Point(startX, startY),
                new model.Point(endX, startY),
                new model.Point(startX, endY),
                new model.Point(endX, endY)
            ]);
            polygonChanged = true;
        }
        this.polygon = model.Polygon.calcRateFactor(locationImageBase, factor, parent, index, zoom);
        this.zoom = zoom;
        this.factor = factor;
        this.locationImageBase = locationImageBase;
        (<any>window).appImage[this.id] = this;
        if (polygonChanged) {
            for (let i = 0; i <= 3; i++) {
                this.sendPointToMainService(this.index, i, this.parent.polygon.points[i]);
            }
        }
    }
    sendPointToMainService(imageIndex: number, pointIndex: number, point: model.Point) {
        let absPoint = point.toAbsolute(this.zoom, this.factor, this.locationImageBase);
        this.overlapperComponent.sendUpdatedPoint(imageIndex, pointIndex, absPoint.x, absPoint.y);
    }
    initPerspectiveTransform(TapDoorToUnlock: boolean) {
        let dataImage = new Image();
        dataImage.onload = () => {
            this.width = dataImage.width;
            this.height = dataImage.height;
            let img = document.getElementById(this.id);
            this.perspective = new PerspectiveTransform(img, this.width, this.height, true);
            for (let i = this.polygon.points.length - 1; i >= 0; i--) {
                this.polygon.points[i].updatePoint();
                this.moveCornerPerspective(this.polygon.points[i]);
            }
            this.toggleDragImage();
            if (TapDoorToUnlock) {
                interact('#' + this.id).on('tap', (event: any) => {
                    (<any>window).zoneImpl.run(() =>
                        (<any>window).appImage[this.id].toggleDragImage(true));
                });
            }
        };
        dataImage.src = this.parent.url;
    }
    // Update perspective image after a point is dragged
    moveCornerPerspective(point: model.Point) {
        if (this.perspective[point.extraOptions.transformAttribute]) {
            this.perspective[point.extraOptions.transformAttribute]
                .updateCoords(point.x, point.y);
                setTimeout(() => {
                    if (this.perspective.checkError() === 0) {
                        this.perspective.update();
                    } else {
                        console.log('Error, should hide image or something');
                    }
                }, 0);
        }
    }
    // Toggle dragging image
    toggleDragImage(toggle = false) {
        if (toggle) {
            this.imageLocked = !this.imageLocked;
        }
        if (this.imageLocked) {
            interact('.draggable' + this.id).draggable({ enabled: false });
            interact('#' + this.id).draggable({ enabled: false });
        } else {
            interact('.draggable_' + this.id)
                .draggable({
                    inertia: true,
                    restrict: {
                        restriction: 'parent',
                        endOnly: true,
                        elementRect: { top: 0, left: 0, bottom: 1, right: 1 }
                    },
                    autoScroll: false,
                    onmove: (event: any) => {
                        this.dragPointListener(event);
                    },
                    onend: null
                });
            interact('#' + this.id)
                .draggable({
                    inertia: true,
                    restrict: {
                        restriction: 'parent',
                        endOnly: true,
                        elementRect: { top: 0, left: 0, bottom: 1, right: 1 }
                    },
                    autoScroll: false,
                    onmove: (event: any) => {
                        this.dragImageListener(event);
                    },
                    onend: null
                });
        }
    }
    // Move one point and update perspective image on drag
    dragPointListener(event: any) {
        let target = event.target;
        let corner = target.attributes.getNamedItem('corner').value;
        let point: model.Point = this.polygon.points[this.corners[corner]];
        point.move(event.dx, event.dy, true);
        this.sendPointToMainService(this.index, this.corners[corner], point);
        this.moveCornerPerspective(point);
    }
    // Move all points and update perspective image when the image is dragged
    dragImageListener(event: any) {
        if (!this.imageLocked) {
            this.polygon.points.forEach((point: model.Point, index: number) => {
                point.move(event.dx, event.dy, true);
                this.sendPointToMainService(this.index, index, point);
                this.moveCornerPerspective(point);
            });
        }
    }
    // Move all points to their new position when zoom or width are changed
    updatePointsOnZoom(
        locationImageBase: model.Point,
        previousZoom: number,
        newZoom: number,
        previousWidth: number,
        newWidth: number
    ) {
        this.locationImageBase = locationImageBase;
        this.zoom = newZoom;
        previousZoom = previousZoom ? previousZoom : 100;
        this.polygon.points.forEach(point => {
            let relativeX = point.x - locationImageBase.x;
            let relativeY = point.y - locationImageBase.y;
            let newX: any, newY: any;
            if (previousZoom !== newZoom) {
                newX = (relativeX * newZoom / previousZoom) + locationImageBase.x;
                newY = (relativeY * newZoom / previousZoom) + locationImageBase.y;
            } else {
                newX = (relativeX * newWidth / previousWidth) + locationImageBase.x;
                newY = (relativeY * newWidth / previousWidth) + locationImageBase.y;
            }
            point.updateCoords(newX, newY, true);
            this.moveCornerPerspective(point);
        });
    }
    // Move all points when ImageBase is dragged
    moveAll(dx: number, dy: number, locationImageBase: model.Point) {
        this.locationImageBase = locationImageBase;
        this.polygon.points.forEach(point => {
            point.move(dx, dy, true);
            this.moveCornerPerspective(point);
        });
    }
}
