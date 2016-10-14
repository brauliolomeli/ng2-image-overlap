import * as model from './';
export class Image {
    public url: string;
    bl: model.Point;
    br: model.Point;
    tl: model.Point;
    tr: model.Point;

    constructor(
        private obj: any
    ) {
        Object.assign(this, this.setDefaults(obj));
    }

    setDefaults(obj: any) {
        return obj;
    }
}
