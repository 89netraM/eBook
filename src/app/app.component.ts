import { Component, ElementRef } from "@angular/core";
import { EPUBParserService } from "./EPUBParser/epubparser.service";
import { EPUB } from "./EPUBParser/epub";
import { SpineEntry } from "./EPUBParser/spine";
import { BookNavigationEvent } from "./part/bookNavigationEvent";

@Component({
	selector: "app-root",
	templateUrl: "./app.component.html",
	styleUrls: ["./app.component.scss"]
})
export class AppComponent {
	private epub: EPUB;

	public title: string = "";
	public spine: ReadonlyArray<SpineEntry>;

	public constructor(private epubParser: EPUBParserService, private host: ElementRef<HTMLElement>) { }

	public async fileChange(files: FileList): Promise<void> {
		this.epub = await this.epubParser.parse(files[0]);

		this.title = this.epub.getTitle();

		this.spine = this.epub.Spine;
	}

	public bookNavigation(e: BookNavigationEvent): void {
		const element = this.host.nativeElement.querySelector(`[data-file="${e.file}"]`);

		if (element != null) {
			element.scrollIntoView();
		}
	}
}