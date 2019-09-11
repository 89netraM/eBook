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
			id: this.generateGUID(),
			title: epub.getTitle(),
			author: epub.getAuthor()
		};

		localStorage.setItem(book.id, zip);
		const list = this.getBookList().filter(x => x.id !== book.id);
		list.splice(0, 0, book);
		localStorage.setItem("books", JSON.stringify(list));
	}

	// tslint:disable: no-bitwise
	private generateGUID(): string {
		return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, c => {
			const r = Math.random() * 16 | 0;
			const v = c === "x" ? r : (r & 0x3 | 0x8);
			return v.toString(16);
		});
	}
	// tslint:enable: no-bitwise

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