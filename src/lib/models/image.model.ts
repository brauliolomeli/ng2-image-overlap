import * as model from './';
export class Image {
    public url: string;
    public width: number;
    public height: number;
    public polygon: model.Polygon;

    constructor(
        url: string,
        polygon: model.Polygon,
        width?: number,
        height?: number
    ) {
        this.url = url;
        this.polygon = polygon;
        this.width = width;
        this.height = height;
    }

    setDefaults(obj: any) {
        return obj;
    }
}
