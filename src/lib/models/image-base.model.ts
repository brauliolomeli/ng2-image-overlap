export class ImageBase {
    public url: string;
    public width: number;
    public height: number;
    constructor(
        obj: any
    ) {
        Object.assign(this, this.setDefaults(obj));
    }
    setDefaults(obj: any) {
        return obj;
    }
}