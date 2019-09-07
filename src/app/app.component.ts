import { Component } from "@angular/core";
import { EPUBParserService } from "./EPUBParser/epubparser.service";
import { EPUB } from "./EPUBParser/epub";
import { TOC } from "./EPUBParser/toc";

@Component({
	selector: "app-root",
	templateUrl: "./app.component.html",
	styleUrls: ["./app.component.scss"]
})
export class AppComponent {
	private epub: EPUB;

	public title: string = "";
	public firstToc: TOC;

	public constructor(private epubParser: EPUBParserService) { }

	public async fileChange(files: FileList): Promise<void> {
		this.epub = await this.epubParser.parse(files[0]);

		this.title = this.epub.getTitle();

		this.firstToc = this.epub.TOC.children[0];
	}
}