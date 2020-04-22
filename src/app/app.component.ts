import { Component } from "@angular/core";
import { EPUBParserService } from "./EPUBParser/epubparser.service";
import { EPUB } from "./EPUBParser/epub";

@Component({
	selector: "app-root",
	templateUrl: "./app.component.html",
	styleUrls: ["./app.component.scss"]
})
export class AppComponent {
	public epub: EPUB;

	public constructor(private epubParser: EPUBParserService) { }

	public async fileChange(files: FileList): Promise<void> {
		this.epub = await this.epubParser.parse(files[0]);
	}
}