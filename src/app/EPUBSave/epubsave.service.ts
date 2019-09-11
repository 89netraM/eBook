import { Injectable } from "@angular/core";
import { EPUB } from "../EPUBParser/epub";
import { BookId } from "./BookId";
import { EPUBParserService } from "../EPUBParser/epubparser.service";

@Injectable({
	providedIn: "root"
})
export class EPUBSaveService {
	private books: ReadonlyArray<BookId>;
	public get Books(): ReadonlyArray<BookId> {
		if (this.books == null) {
			this.books = this.getBookList();
		}

		return this.books;
	}

	public constructor(private epubParser: EPUBParserService) { }

	private getBookList(): Array<BookId> {
		return JSON.parse(localStorage.getItem("books") || "[]");
	}

	public async saveBook(epub: EPUB): Promise<void> {
		const zip = await epub.zip.generateAsync({ type: "binarystring" });

		const book: BookId = {
			id: epub.getIdentifier(),
			title: epub.getTitle(),
			author: epub.getAuthor()
		};

		localStorage.setItem(book.id, zip);
		const list = this.getBookList().filter(x => x.id !== book.id);
		list.splice(0, 0, book);
		localStorage.setItem("books", JSON.stringify(list));
	}

	public async getBook(book: BookId): Promise<EPUB> {
		const base64 = localStorage.getItem(book.id);

		if (base64 != null) {
			return await this.epubParser.parse(base64);
		}
		else {
			return null;
		}
	}
}