/*  Parsed version of PerspectiveTransform.js
 *  by Blomeli
 *  The original PerspectiveTransform.js is created by  Israel Pastrana
 *  http://www.is-real.net/experiments/css3/wonder-webkit/js/real/display/PerspectiveTransform.js
 */

import * as models from './models/';
export class PerspectiveTransform {
    // From constructor
    element: any;
    style: any;
    computedStyle: any;
    width: number;
    height: number;
    useBackFacing: boolean;
    useDPRFix: boolean = false;
    dpr: number = 1;
    topLeft: models.Point;
    topRight: models.Point;
    bottomLeft: models.Point;
    bottomRight: models.Point;

    _transformStyleName: any;
    _transformOriginDomStyleName: any;
    aM = [[0, 0, 1, 0, 0, 0, 0, 0], [0, 0, 1, 0, 0, 0, 0, 0], [0, 0, 1, 0, 0, 0, 0, 0], [0, 0, 1, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 1, 0, 0], [0, 0, 0, 0, 0, 1, 0, 0], [0, 0, 0, 0, 0, 1, 0, 0], [0, 0, 0, 0, 0, 1, 0, 0]];
    bM = [0, 0, 0, 0, 0, 0, 0, 0];
    app = {stylePrefix: ''};
    constructor(element: any, width: number, height: number, useBackFacing: boolean) {
        this.element = element;
        this.style = element.style;
        this.computedStyle = window.getComputedStyle(element);
        this.width = width;
        this.height = height;
        this.useBackFacing = !!useBackFacing;

        this.topLeft = new models.Point(0, 0);
        this.topRight = new models.Point(width, 0);
        this.bottomLeft = new models.Point(0, height);
        this.bottomRight = new models.Point(width, height);
        this._setTransformStyleName();
    }
    private _setTransformStyleName() {
        let testStyle = document.createElement('div').style;
        this.app.stylePrefix =
            'webkitTransform' in testStyle ? 'webkit' :
            'MozTransform' in testStyle ? 'Moz' :
            'msTransform' in testStyle ? 'ms' :
            '';
        this._transformStyleName = this.app.stylePrefix + (this.app.stylePrefix.length > 0 ? 'Transform' : 'transform');
        this._transformOriginDomStyleName = '-' + this.app.stylePrefix.toLowerCase() + '-transform-origin';
    }
    // Check the distances between each points and if there is some points with the distance
    // lequal to or less than 1 pixel, then return true. Otherwise return false;
    private _hasDistancesError(){
        let lenX = this.topLeft.x - this.topRight.x;
        let lenY = this.topLeft.y - this.topRight.y;
        if (Math.sqrt(lenX * lenX +  lenY * lenY) <= 1 ) {
            return true;
        }
        lenX = this.bottomLeft.x - this.bottomRight.x;
        lenY = this.bottomLeft.y - this.bottomRight.y;
        if (Math.sqrt(lenX * lenX +  lenY * lenY) <= 1) {
            return true;
        }
        lenX = this.topLeft.x - this.bottomLeft.x;
        lenY = this.topLeft.y - this.bottomLeft.y;
        if (Math.sqrt(lenX * lenX +  lenY * lenY) <= 1) {
            return true;
        }
        lenX = this.topRight.x - this.bottomRight.x;
        lenY = this.topRight.y - this.bottomRight.y;
        if ( Math.sqrt(lenX * lenX +  lenY * lenY) <= 1) {
            return true;
        }
        lenX = this.topLeft.x - this.bottomRight.x;
        lenY = this.topLeft.y - this.bottomRight.y;
        if ( Math.sqrt(lenX * lenX +  lenY * lenY) <= 1){
            return true;
        }
        lenX = this.topRight.x - this.bottomLeft.x;
        lenY = this.topRight.y - this.bottomLeft.y;
        if ( Math.sqrt(lenX * lenX +  lenY * lenY) <= 1) {
            return true;
        }
        return false;
    }
    // Get the determinant of given 3 points
    private _getDeterminant(p0: any, p1: any, p2: any) {
        return p0.x * p1.y + p1.x * p2.y + p2.x * p0.y - p0.y * p1.x - p1.y * p2.x - p2.y * p0.x;
    }
    // Return true if it is a concave polygon or if it is backfacing when the useBackFacing property is false. Otehrwise return true;
    private _hasPolyonError() {
        let det1 = this._getDeterminant(this.topLeft, this.topRight, this.bottomRight);
        let det2 = this._getDeterminant(this.bottomRight, this.bottomLeft, this.topLeft);
        if (this.useBackFacing) {
            if (det1 * det2 <= 0) {
                return true;
            }
        } else {
            if (det1 <= 0 || det2 <= 0) {
                return true;
            }
        }
        det1 = this._getDeterminant(this.topRight, this.bottomRight, this.bottomLeft);
        det2 = this._getDeterminant(this.bottomLeft, this.topLeft, this.topRight);
        if (this.useBackFacing) {
            if (det1 * det2 <= 0) {
                return true;
            }
        } else {
            if (det1 <= 0 || det2 <= 0) {
                return true;
            }
        }
        return false;
    }
    checkError() {
        if ( this._hasDistancesError()) {
            // Points are too close to each other.
            return 1;
        }
        if ( this._hasPolyonError()) {
            // Concave or backfacing if the useBackFacing property is false
            return 2;
        }
        // if(this._hasDistancesError.apply(this)) return 1; 
        // if(_hasPolyonError.apply(this)) return 2; 
        return 0; // no error
    }
    update() {
        let width = this.width;
        let height = this.height;

        //  get the offset from the transfrom origin of the element
        let offsetX = 0;
        let offsetY = 0;
        let offset = this.computedStyle.getPropertyValue(this._transformOriginDomStyleName);
        if (offset.indexOf('px') > -1) {
            offset = offset.split('px');
            offsetX = -parseFloat(offset[0]);
            offsetY = -parseFloat(offset[1]);
        }else if (offset.indexOf('%') > -1) {
            offset = offset.split('%');
            offsetX = -parseFloat(offset[0]) * width / 100;
            offsetY = -parseFloat(offset[1]) * height / 100;
        }

        //  magic here:
        let dst = [this.topLeft, this.topRight, this.bottomLeft, this.bottomRight];
        let arr = [0, 1, 2, 3, 4, 5, 6, 7];
        for(let i = 0; i < 4; i++) {
            this.aM[i][0] = this.aM[i + 4][3] = i & 1 ? width + offsetX : offsetX;
            this.aM[i][1] = this.aM[i + 4][4] = (i > 1 ? height + offsetY : offsetY);
            this.aM[i][6] = (i & 1 ? -offsetX - width : -offsetX) * (dst[i].x + offsetX);
            this.aM[i][7] = (i > 1 ? -offsetY - height : -offsetY) * (dst[i].x + offsetX);
            this.aM[i + 4][6] = (i & 1 ? -offsetX - width : -offsetX) * (dst[i].y + offsetY);
            this.aM[i + 4][7] = (i > 1 ? -offsetY - height : -offsetY) * (dst[i].y + offsetY);
            this.bM[i] = (dst[i].x + offsetX);
            this.bM[i + 4] = (dst[i].y + offsetY);
            this.aM[i][2] = this.aM[i + 4][5] = 1;
            this.aM[i][3] = this.aM[i][4] = this.aM[i][5] = this.aM[i + 4][0] = this.aM[i + 4][1] = this.aM[i + 4][2] = 0;
        }
        let kmax: number, sum: number;
        let row: any;
        let col: any[] = [];
        let tmp: any;
        for (let j = 0; j < 8; j++) {
            for (let i = 0; i < 8; i++) {
                col[i] = this.aM[i][j];
            }
            for (let i = 0; i < 8; i++) {
                row = this.aM[i];
                kmax = i < j ? i : j;
                sum = 0.0;
                for (let k = 0; k < kmax; k++) {
                    sum += row[k] * col[k];
                }
                row[j] = col[i] -= sum;
            }
            let p = j;
            for (let i = j + 1; i < 8; i++) {
                if (Math.abs(col[i]) > Math.abs(col[p])) {
                    p = i;
                }
            }
            if (p !== j) {
                for (let k = 0; k < 8; k++) {
                    tmp = this.aM[p][k];
                    this.aM[p][k] = this.aM[j][k];
                    this.aM[j][k] = tmp;
                }
                tmp = arr[p];
                arr[p] = arr[j];
                arr[j] = tmp;
            }
            if (this.aM[j][j] !== 0.0) {
                for (let i = j + 1; i < 8; i++) {
                    this.aM[i][j] /= this.aM[j][j];
                }
            }
        }
        for (let i = 0; i < 8; i++) {
            arr[i] = this.bM[arr[i]];
        }
        for(let k = 0; k < 8; k++) {
            for(let i = k + 1; i < 8; i++) {
                arr[i] -= arr[k] * this.aM[i][k];
            }
        }
        for (let k = 7; k > -1; k--) {
            arr[k] /= this.aM[k][k];
            for (let i = 0; i < k; i++) {
                arr[i] -= arr[k] * this.aM[i][k];
            }
        }

        let style = 'matrix3d(' + arr[0].toFixed(9) + ',' + arr[3].toFixed(9) + ', 0,' + arr[6].toFixed(9)
            + ',' + arr[1].toFixed(9) + ',' + arr[4].toFixed(9) + ', 0,' + arr[7].toFixed(9) + ',0, 0, 1, 0,' + arr[2].toFixed(9)
            + ',' + arr[5].toFixed(9) + ', 0, 1)';

        // A fix for firefox on retina display, require setting PerspectiveTransform.useDPRFix
        // to true and update the PerspectiveTransform.dpr with the window.devicePixelRatio
        if (this.useDPRFix) {
            let dpr = this.dpr;
            style = 'scale(' + dpr + ',' + dpr + ')perspective(1000px)' + style + 'translateZ('+ ((1 - dpr) * 1000) + 'px)';
        }
        // use toFixed() just in case the Number became something like 3.10000001234e-9
        return this.style[this._transformStyleName] = style;
    }
}
