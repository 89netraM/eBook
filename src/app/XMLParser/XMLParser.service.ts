import { Injectable } from "@angular/core";

@Injectable({
	providedIn: "root"
})
export class XMLParserService {
	private parser: DOMParser = new DOMParser();

	private parse(src: string, type: SupportedType): Document {
		return this.parser.parseFromString(src, type);
	}

	public parseXML(xmlSrc: string): Document {
		return this.parse(xmlSrc, "text/xml");
	}

	public parseHTML(htmlSrc: string): Document {
		return this.parse(htmlSrc, "application/xhtml+xml");
	}
}