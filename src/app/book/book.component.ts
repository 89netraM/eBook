import { Component, Input, ElementRef } from "@angular/core";
import { EPUB } from "../EPUBParser/epub";
import { SpineEntry } from "../EPUBParser/spine";
import { BookNavigationEvent } from "../part/bookNavigationEvent";

@Component({
	selector: "app-book",
	templateUrl: "./book.component.html",
	styleUrls: ["./book.component.scss"]
})
export class BookComponent {
	private _book: EPUB;
	@Input("book")
	public set book(value: EPUB) {
		this._book = value;

		if (this.book != null) {
			this.spine = this.book.Spine;
		}
	}
	public get book(): EPUB {
		return this._book;
	}

	public spine: ReadonlyArray<SpineEntry>;

	public constructor(private host: ElementRef<HTMLElement>) { }

	public bookNavigation(e: BookNavigationEvent): void {
		const element = this.host.nativeElement.querySelector(`[data-file="${e.file}"]`);

		if (element != null) {
			element.scrollIntoView();
		}
	}
}