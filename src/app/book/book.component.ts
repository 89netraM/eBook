import { Component, Input, HostListener, ViewChildren, QueryList, Output, EventEmitter } from "@angular/core";
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

	public get percentage(): number {
		if (this.parts != null && this.currentPart > 0) {
			const partsArray = this.parts.toArray();
			return ((partsArray.slice(0, this.currentPart).reduce((s, x) => s + x.pageCount, 0) + partsArray[this.currentPart].currentPage) / this.pageCount) * 100;
		}
		else {
			return 0;
		}
	}
	public set percentage(value: number) {
		this.setPage(value / 100);
	}

	@Output()
	public closeBook = new EventEmitter();

	public showControls: boolean = false;

	public constructor() { }

	public bookNavigation(e: BookNavigationEvent): void {
		let found = false;
		let index = 0;
		for (const part of this.parts.toArray()) {
			if (!found) {
				if (part.fileName === e.file) {
					part.hostElement.nativeElement.scrollIntoView();
					this.currentPart = index;
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
			index++;
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

	@HostListener("click", ["$event"])
	public onClick(e: MouseEvent): void {
		if (this.book != null) {
			const path = e.composedPath();
			// Only show/hide if the event came through an app-part element
			if (!(path[0] instanceof Node && path[0].nodeName === "A") && path.some(x => x instanceof Node && x.nodeName === "APP-PART")) {
				this.showControls = !this.showControls;
			}
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
		let i = 0;
		for (const part of this.parts.toArray()) {
			if (pages >= 0) {
				if (pages < part.pageCount) {
					part.hostElement.nativeElement.scrollIntoView();
					this.currentPart = i;
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

			i++;
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