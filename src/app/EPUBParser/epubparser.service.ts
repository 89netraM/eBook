import { Injectable } from "@angular/core";
import { XMLParserService } from "../XMLParser/XMLParser.service";
import * as JSZip from "jszip";
import { EPUB } from "./epub";

@Injectable({
	providedIn: "root"
})
export class EPUBParserService {
	public constructor(private xmlParser: XMLParserService) { }

	public async parse(file: File): Promise<EPUB> {
		const zip = await JSZip.loadAsync(file);

		const epub = new EPUB(this.xmlParser, zip);
		await epub.init();
		return epub;
	}
}