import { JSZipObject } from "jszip";
import * as Path from "path";
import * as JSZip from "jszip";
import * as mime from "mime-types";

export class TOC {
	public readonly title: string;
	public readonly source: JSZipObject;
	public readonly anchor: string;
	public readonly children: ReadonlyArray<TOC>;

	private readonly resourceGetter: (path: string) => JSZip.JSZipObject;

	public constructor(title: string, source: JSZipObject, anchor: string, children: Array<TOC>, resourceGetter: (path: string) => JSZip.JSZipObject) {
		this.title = title;
		this.source = source;
		this.anchor = anchor;
		this.children = children;
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