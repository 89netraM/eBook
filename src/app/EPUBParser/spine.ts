import * as JSZip from "jszip";
import * as Path from "path";
import * as mime from "mime-types";
import { querySelectLinks, getLinkAttribute } from "./resourceLinks";

export class SpineEntry {
	public readonly source: JSZip.JSZipObject;

	private readonly resourceGetter: (path: string) => JSZip.JSZipObject;

	public constructor(source: JSZip.JSZipObject, resourceGetter: (path: string) => JSZip.JSZipObject) {
		this.source = source;
		this.resourceGetter = resourceGetter;
	}

	private async getResource(name: string): Promise<string> {
		const path = Path.join(Path.dirname(this.source.name), name);
		const file = this.resourceGetter(path);
		const mimeType = mime.lookup(path);

		/** The resource in base64 */
		let data: string;
		if (mimeType === "text/css") {
			data = await this.getStylesheet(file);
		}
		else {
			data = await file.async("base64");
		}

		return `data:${mimeType};base64,${data}`;
	}

	private async getStylesheet(file: JSZip.JSZipObject): Promise<string> {
		let text = await file.async("text");

		// TODO: What happens if a URL ends with an escaped backslash? "url('http://åsberg.net/troll\\')".
		const regexp = /(url\()(["'])(.*?[^\\])\2(\))/g;

		for (let result = regexp.exec(text); result != null; result = regexp.exec(text)) {
			if (this.isLinkLocalResource(result[3])) {
				const resource = await this.getResource(result[3]);
				text = text.substring(0, result.index) +                       // Before the match.
					result[1] + result[2] + resource + result[2] + result[4] + // The match, with the link replaced.
					text.substring(result.index + result[0].length, text.length); // After the match.
			}
		}

		return btoa(text);
	}

	public async getHTMLElement(xHtmlParser: (xHtml: string) => Document): Promise<HTMLElement>;
	public async getHTMLElement(xHtmlParser: (xHtml: string) => Document, pageStylesheet: string): Promise<HTMLElement>;
	public async getHTMLElement(xHtmlParser: (xHtml: string) => Document, pageStylesheet?: string): Promise<HTMLElement> {
		const fileText = await this.source.async("text");
		const tempDoc = xHtmlParser(fileText);

		const elements = querySelectLinks(tempDoc);

		const promises = new Array<Promise<void>>();
		// tslint:disable-next-line: prefer-for-of
		for (let i = 0; i < elements.length; i++) {
			promises.push(this.replaceLink(elements[i]));
		}
		await Promise.all(promises);

		if (pageStylesheet != null) {
			const style = tempDoc.createElement("style");
			style.innerHTML = pageStylesheet;
			tempDoc.head.appendChild(style);
		}

		return tempDoc.documentElement;
	}

	private async replaceLink(element: Element): Promise<void> {
		const attribute = getLinkAttribute(element);
		const link = element.getAttribute(attribute);

		if (this.isLinkLocalResource(link)) {
			element.setAttribute(
				attribute,
				await this.getResource(link)
			);
		}
	}

	private isLinkLocalResource(link: string): boolean {
		return !/(^\w*?:)|#/.test(link);
	}
}