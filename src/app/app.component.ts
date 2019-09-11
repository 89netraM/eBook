import { Component } from "@angular/core";
import { EPUBParserService } from "./EPUBParser/epubparser.service";
import { EPUB } from "./EPUBParser/epub";
import { SpineEntry } from "./EPUBParser/spine";
import { EPUBSaveService } from "./EPUBSave/epubsave.service";
import { BookId } from "./EPUBSave/BookId";

@Component({
	selector: "app-root",
	templateUrl: "./app.component.html",
	styleUrls: ["./app.component.scss"]
})
export class AppComponent {
	private epub: EPUB;

	public title: string = "";
	public spine: ReadonlyArray<SpineEntry>;

	public availableBooks: ReadonlyArray<BookId>;

	public constructor(private epubParser: EPUBParserService, private epubSaver: EPUBSaveService) {
		this.availableBooks = this.epubSaver.Books;
	}

	public async fileChange(files: FileList): Promise<void> {
		this.epub = await this.epubParser.parse(files[0]);
		this.epubSaver.saveBook(this.epub);
		this.initBook();
	}

	public async openBook(book: BookId): Promise<void> {
		this.epub = await this.epubSaver.getBook(book);
		this.initBook();
	}

	private async initBook(): Promise<void> {
		this.title = this.epub.getTitle();

		this.spine = this.epub.Spine;
	}
}