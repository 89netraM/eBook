import * as JSZip from "jszip";
import * as Path from "path";
import * as mime from "mime-types";

export class SpineEntry {
	public readonly source: JSZip.JSZipObject;

	private readonly resourceGetter: (path: string) => JSZip.JSZipObject;

	public constructor(source: JSZip.JSZipObject, resourceGetter: (path: string) => JSZip.JSZipObject) {
		this.source = source;
		this.resourceGetter = resourceGetter;
	}

	public async getResource(name: string): Promise<string> {
		const path = Path.join(Path.dirname(this.source.name), name);
		const file = this.resourceGetter(path);
		const data = await file.async("base64");
		const mimeType = mime.lookup(path);
		return `data:${mimeType};base64,${data}`;
	}
}