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
                width = this.overlapperComponent.imageBase.width / 3,
                height = this.overlapperComponent.imageBase.height / 3,
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
        this.width = parent.width;
        this.height = parent.height;
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
        let img = document.getElementById(this.id);
        this.perspective = new PerspectiveTransform(img, this.width, this.height, false);
        for (let i = this.polygon.points.length - 1; i >= 0; i--) {
            this.polygon.points[i].updatePoint();
            this.moveCornerPerspective(this.polygon.points[i]);
        }
        if (TapDoorToUnlock) {
            interact('#' + this.id).on('tap', (event: any) => {
                (<any>window).zoneImpl.run(() =>
                    (<any>window).appImage[this.id].toggleDragImage(true));
            });
        }
        setTimeout(() => this.toggleDragImage(), 0);
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
        if (!this.hasPolyonError(this.polygon.points, event.dx, event.dy, this.corners[corner])) {
            point.move(event.dx, event.dy, true);
            this.sendPointToMainService(this.index, this.corners[corner], point);
            this.moveCornerPerspective(point);
        } else {
            console.log('Polygon has error');
        }
    }
    // Get the determinant of given 3 points
    private _getDeterminant(p0: any, p1: any, p2: any) {
        return p0.x * p1.y + p1.x * p2.y + p2.x * p0.y - p0.y * p1.x - p1.y * p2.x - p2.y * p0.x;
    }
    hasPolyonError(pointsOrigin: model.Point[], dx: number, dy: number, pointPosition: number) {
        let points: model.Point[] = pointsOrigin.map((point, index) => {
            let sumX = pointPosition === index ? dx : 0,
                sumY = pointPosition === index ? dy : 0;
            return new model.Point(point.x + sumX, point.y + sumY);
        });
        let det1 = this._getDeterminant(points[0], points[1], points[3]);
        let det2 = this._getDeterminant(points[3], points[2], points[0]);
        if (det1 <= 0 || det2 <= 0) {
            return true;
        }
        det1 = this._getDeterminant(points[1], points[3], points[2]);
        det2 = this._getDeterminant(points[2], points[0], points[1]);
        if (det1 <= 0 || det2 <= 0) {
            return true;
        }
        if (points[pointPosition].x > this.overlapperComponent.width ||
            points[pointPosition].y > this.overlapperComponent.height ||
            points[pointPosition].x < 0 ||
            points[pointPosition].y < 0) {
            return true;
        }
        return false || this._hasAngleError(points) || this._hasOrientationError(points) || this._hasSizeError(points);
    }
    private _hasAngleError(points: model.Point[]): boolean {
        let groupsOfPoints = [
            [points[1], points[2], points[0]],
            [points[3], points[0], points[1]],
            [points[2], points[1], points[3]],
            [points[0], points[3], points[2]],
        ];
        return groupsOfPoints.some(groupOfPoints => {
            let angle = this._getAngle(groupOfPoints[0], groupOfPoints[1], groupOfPoints[2]);
            return (angle < 0.6 || angle > 2.8);
        });
    }
    private _hasOrientationError(points: model.Point[]): boolean {
        return points[0].y > points[2].y ||
            points[0].y > points[3].y ||
            points[1].y > points[2].y ||
            points[1].y > points[3].y ||
            points[0].x > points[1].x ||
            points[0].x > points[3].x ||
            points[2].x > points[1].x ||
            points[2].x > points[3].x;
    }
    private _hasSizeError(points: model.Point[]): boolean {
        let minumumSize = 40; 
        return points[1].x - points[0].x < minumumSize ||
            points[3].x - points[2].x < minumumSize ||
            points[2].y - points[0].y < minumumSize ||
            points[3].y - points[1].y < minumumSize;
    }

    /**
     * Calculates the angle (in radians) between two vectors pointing outward from one center
     *
     * @param p0 first point
     * @param p1 second point
     * @param c center point
     */
    private _getAngle(p0: model.Point, p1: model.Point, c: model.Point) {
        var p0c = Math.sqrt(Math.pow(c.x-p0.x,2)+
                            Math.pow(c.y-p0.y,2)); // p0->c (b)   
        var p1c = Math.sqrt(Math.pow(c.x-p1.x,2)+
                            Math.pow(c.y-p1.y,2)); // p1->c (a)
        var p0p1 = Math.sqrt(Math.pow(p1.x-p0.x,2)+
                            Math.pow(p1.y-p0.y,2)); // p0->p1 (c)
        return Math.acos((p1c*p1c+p0c*p0c-p0p1*p0p1)/(2*p1c*p0c));
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
