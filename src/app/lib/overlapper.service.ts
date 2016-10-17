import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/Rx';
import * as models from './models/';

@Injectable()
export class OverlapperService {
    private mainImage: string;
    private _mainImage: BehaviorSubject<string> = new BehaviorSubject('');
    private images: models.Image[] = [];
    private _images: BehaviorSubject<models.Image[]> = new BehaviorSubject([]);


    public get obsImages() {
        return new Observable((fn: any) => this._images.subscribe(fn));
    }
    public addImage(image: models.Image) {
        this.images.push(image);
        this.imageChanged();
    }
    public deleteLastImage() {
        this.images.pop();
        this.imageChanged();
    }
    public updatePoint(index: number, point: number, x: number, y: number) {
        this.images[index].polygon.points[point].updateCoords(x, y);
        this.imageChanged();
    }
    public imageChanged() {
        this._images.next(this.images);
    }
    public getImages(): models.Image[] {
        return this.images;
    }

    public get obsMainImage() {
        return new Observable((fn: any) => this._mainImage.subscribe(fn));
    }
    public setMainImage(url: string) {
        this.mainImage = url;
        this._mainImage.next(this.mainImage);
    }

    constructor() {
    }
}
