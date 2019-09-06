import { Component } from "@angular/core";
import { EPUBParserService } from "./EPUBParser/epubparser.service";
import { EPUB } from "./EPUBParser/epub";

@Component({
	selector: "app-root",
	templateUrl: "./app.component.html",
	styleUrls: ["./app.component.scss"]
})
export class AppComponent {
	private epub: EPUB;

	public title: string = "";
	public cover: string = "";

	public constructor(private epubParser: EPUBParserService) { }

	public async fileChange(files: FileList): Promise<void> {
		this.epub = await this.epubParser.parse(files[0]);

		this.title = this.epub.getTitle();

		const imgType = this.epub.getCoverImageType();
		const img = await this.epub.getCoverImage();
		this.cover = `data:${imgType};base64,${img}`;
	}
}