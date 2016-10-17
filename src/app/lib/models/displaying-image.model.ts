import { OverlapperService } from '../overlapper.service';
import { PerspectiveTransform } from '../PerspectiveTransform';
import * as model from './';
import * as interact from 'interact.js';
(<any>window).appImage = [];

export class DisplayingImage {
    public parent: model.Image;
    public perspective: PerspectiveTransform;
    public polygon: model.Polygon;
    public id: string;
    public index: number;
    public width: number;
    public height: number;
    public corners: any = { 'tl': 0, 'tr': 1, 'bl': 2, 'br': 3 };
    public doorLocked: boolean = true;
    public overlapperService: OverlapperService;
    constructor(
        parent: model.Image,
        locationImageBase: model.Point,
        factor: number,
        index: number,
        zoom: number,
        overlapperService: OverlapperService
    ) {
        this.id = 'img_' + index;
        this.index = index;
        this.parent = parent;
        this.polygon = model.Polygon.calcRateFactor(locationImageBase, factor, parent, index, zoom);
        this.overlapperService = overlapperService;
        (<any>window).appImage[this.id] = this;
    }
    sendPointToMainService(index: number, point: number, x: number, y: number) {
        // TODO: convert x and y to absolute point
        this.overlapperService.updatePoint(index, point, x, y);
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
                this.moveCornerPerspective(this.polygon.points[i]);
            }
            this.toggleDragDoor();
            interact('#' + this.id).on('tap', (event) => {
                (<any>window).zoneImpl.run(() =>
                    (<any>window).appImage[this.id].toggleDragDoor(true));
            });
        };
        dataImage.src = this.parent.url;
    }
    // Update perspective image after a point is dragged
    moveCornerPerspective(point: model.Point) {
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
    // Toggle dragging door
    toggleDragDoor(toggle = false) {
        if (toggle) {
            this.doorLocked = !this.doorLocked;
        }
        if (this.doorLocked) {
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
                    onmove: (event) => {
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
                    onmove: (event) => {
                        this.dragDoorListener(event);
                    },
                    onend: null
                });
        }
    }
    // Move one point and update perspective image on drag
    dragPointListener(event) {
        let target = event.target;
        let corner = target.attributes.getNamedItem('corner').value;
        let point: model.Point = this.polygon.points[this.corners[corner]];
        point.move(event.dx, event.dy, true);
        this.sendPointToMainService(this.index, this.corners[corner], point.x, point.y);
        this.moveCornerPerspective(point);
    }
    // Move all points and update perspective image when the door is dragged
    dragDoorListener(event) {
        if (!this.doorLocked) {
            this.polygon.points.forEach((point: model.Point, index) => {
                point.move(event.dx, event.dy, true);
                this.sendPointToMainService(this.index, index, point.x, point.y);
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
        previousZoom = previousZoom ? previousZoom : 100;
        this.polygon.points.forEach(point => {
            let relativeX = point.x - locationImageBase.x;
            let relativeY = point.y - locationImageBase.y;
            let newX, newY;
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
    // Move all points when house is dragged
    moveAll(dx: number, dy: number) {
        this.polygon.points.forEach(point => {
            point.move(dx, dy, true);
            this.moveCornerPerspective(point);
        });
    }
}
