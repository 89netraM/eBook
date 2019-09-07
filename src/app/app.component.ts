import { Component } from "@angular/core";
import { EPUBParserService } from "./EPUBParser/epubparser.service";
import { EPUB } from "./EPUBParser/epub";
import { SpineEntry } from "./EPUBParser/spine";

@Component({
	selector: "app-root",
	templateUrl: "./app.component.html",
	styleUrls: ["./app.component.scss"]
})
export class AppComponent {
	private epub: EPUB;

	public title: string = "";
	public spine: ReadonlyArray<SpineEntry>;

	public constructor(private epubParser: EPUBParserService) { }

	public async fileChange(files: FileList): Promise<void> {
		this.epub = await this.epubParser.parse(files[0]);

		this.title = this.epub.getTitle();

		this.spine = this.epub.Spine;
	}
}