import * as model from './';
export class Image {
    public url: string;
    public polygon: model.Polygon;

    constructor(
        url: string,
        polygon: model.Polygon
    ) {
        this.url = url;
        this.polygon = polygon;
    }

    setDefaults(obj: any) {
        return obj;
    }
}
