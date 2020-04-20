import { Component, Input, HostListener, ViewChildren, QueryList } from "@angular/core";
import { EPUB } from "../EPUBParser/epub";
import { SpineEntry } from "../EPUBParser/spine";
import { BookNavigationEvent } from "../part/bookNavigationEvent";
import { PartComponent } from '../part/part.component';

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
	@ViewChildren("parts")
	public parts: QueryList<PartComponent>;
	private currentPart: number = 0;

	public get pageCount(): number {
		return this.parts.reduce((s, x) => s + x.pageCount, 0);
	}

	public constructor() { }

	public bookNavigation(e: BookNavigationEvent): void {
		const partsArray = this.parts.toArray();
		const index = partsArray.findIndex(x => x.fileName === e.file);

		if (index >= 0) {
			partsArray[index].hostElement.nativeElement.scrollIntoView();
			this.currentPart = index;
		}
		let found = false;
		for (const part of this.parts.toArray()) {
			if (!found) {
				if (part.fileName === e.file) {
					part.hostElement.nativeElement.scrollIntoView();
					part.bookNavigation(e);
					
					found = true;
				}
				else {
					part.setPage(1.00);
				}
			}
			else {
				part.setPage(0.00);
			}
		}
	}

	@HostListener("window:keydown", ["$event"])
	public onKeydown(e: KeyboardEvent): void {
		if (e.key === "ArrowLeft") {
			this.movePage(-1);
		}
		else if (e.key === "ArrowRight") {
			this.movePage(1);
		}
	}
	@HostListener("window:wheel", ["$event"])
	public onScroll(e: WheelEvent): void {
		if (Math.abs(e.deltaY) > 0) {
			this.movePage(Math.abs(e.deltaY) / e.deltaY);
		}
	}

	//#region Drag
	private dragLocked: boolean = false;
	private dragStartX: number;

	@HostListener("window:touchstart", ["$event"])
	public dragStart(e: TouchEvent | MouseEvent): void {
		if (e.target instanceof Node && e.target.nodeName === "APP-PART") {
			this.dragStartX = this.dragUnify(e).clientX;
			this.dragLocked = true;
		}
	}

	@HostListener("window:touchend", ["$event"])
	@HostListener("window:touchcancel", ["$event"])
	public dragEnd(e: TouchEvent | MouseEvent): void {
		if (this.dragLocked) {
			const deltaX = this.dragUnify(e).clientX - this.dragStartX;
			if (Math.abs(deltaX) > 25) {
				this.movePage(-Math.abs(deltaX) / deltaX);
			}

			this.dragLocked = false;
		}
	}

	private dragUnify(e: TouchEvent | MouseEvent): MouseEvent | Touch {
		if (e instanceof TouchEvent) {
			return e.changedTouches[0];
		}
		else if (e instanceof MouseEvent) {
			return e;
		}
		else {
			return null;
		}
	}
	//#endregion Drag

	public setPage(percentage: number): void {
		let pages = Math.floor(this.pageCount * percentage);
		for (const part of this.parts.toArray()) {
			if (pages >= 0) {
				if (part.pageCount < pages) {
					part.hostElement.nativeElement.scrollIntoView();
					part.setPage(pages / part.pageCount);
				}
				else {
					part.setPage(1.00);
				}
				pages -= part.pageCount;
			}
			else {
				part.setPage(0.00);
			}
		}
	}

	private movePage(steps: number): void {
		let element = this.parts.toArray()[this.currentPart];
		if (element != null && !element.movePage(steps)) {
			this.currentPart = Math.max(0, Math.min(this.currentPart + steps, this.parts != null ? this.parts.length - 1 : 0));

			element = this.parts.toArray()[this.currentPart];
			if (element != null) {
				element.hostElement.nativeElement.scrollIntoView();
			}
		}
	}
}