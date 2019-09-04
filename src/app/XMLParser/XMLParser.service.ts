import { Injectable } from "@angular/core";

@Injectable({
	providedIn: "root"
})
export class XMLParserService {
	private parser: DOMParser = new DOMParser();

	public parse(xmlSrc: string): Document {
		return this.parser.parseFromString(xmlSrc, "text/xml");
	}
}