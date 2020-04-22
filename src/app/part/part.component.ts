import { Component, Input, ElementRef, HostBinding, Output, EventEmitter } from "@angular/core";
import { SpineEntry } from "../EPUBParser/spine";
import { XMLParserService } from "../XMLParser/XMLParser.service";
import * as Path from "path";
import { BookNavigationEvent } from "./bookNavigationEvent";

@Component({
	selector: "app-part",
	templateUrl: "./part.component.html",
	styleUrls: ["./part.component.scss"]
})
export class PartComponent {
	private static pageStyles: string = `svg, img {
	max-width: 100vw;
	max-height: 100vh;
}`;

	private _entry: SpineEntry;
	@Input("entry")
	public set entry(value: SpineEntry) {
		if (value != null && value !== this._entry) {
			this._entry = value;
			this.updateDisplayedFile();
		}
	}
	public get entry(): SpineEntry {
		return this._entry;
	}

	private get columnWidth(): number {
		return this.hostElement.nativeElement.offsetWidth;
	}
	private readonly columnGap: number = 40;
	@HostBinding("style.columnWidth")
	public get styleColumnWidth(): string {
		return `${this.columnWidth}px`;
	}
	@HostBinding("style.columnGap")
	public get styleColumnGap(): string {
		return `${this.columnGap}px`;
	}

	private _currentPage: number = 0;
	public get currentPage(): number {
		return this._currentPage;
	}
	public get pageCount(): number {
		if (this.shadowRoot != null && this.shadowRoot.children.length > 0) {
			return Math.floor((this.shadowRoot.children[0].getBoundingClientRect().width + this.columnGap) / (this.columnWidth + this.columnGap));
		}
		else {
			return 0;
		}
	}

	@HostBinding("attr.data-file")
	public fileName: string;

	@Output()
	public navigation: EventEmitter<BookNavigationEvent> = new EventEmitter<BookNavigationEvent>();

	private shadowRoot: ShadowRoot;

	public constructor(public hostElement: ElementRef<HTMLElement>, private xmlParser: XMLParserService) {
		this.shadowRoot = this.hostElement.nativeElement.attachShadow({ mode: "open" });
	}

	private async updateDisplayedFile(): Promise<void> {
		this.fileName = this.entry.source.name;

		this.shadowRoot.innerHTML = "";
		this.shadowRoot.append(await this.entry.getHTMLElement(this.xmlParser.parseHTML.bind(this.xmlParser), PartComponent.pageStyles));
		this.shadowRoot.querySelectorAll("a").forEach(x => x.addEventListener("click", this.linkClick.bind(this), true));
	}

	private linkClick(e: MouseEvent): void {
		if (e.currentTarget instanceof HTMLAnchorElement) {
			const link = e.currentTarget.getAttribute("href");

			if (/^\w*?:/.test(link)) {
				return; // Outside link
			}
			else {
				const [relativeFile, hash] = link.split("#");
				const file = Path.join(Path.dirname(this.fileName), relativeFile);

				this.navigation.emit({ file, hash });

				e.preventDefault();
			}
		}
	}

	public bookNavigation(e: BookNavigationEvent): void {
		const targetElement = this.shadowRoot.getElementById(e.hash);
		if (targetElement != null) {
			const targetRect = targetElement.getBoundingClientRect();
			const partRect = this.shadowRoot.children[0].getBoundingClientRect();
			const targetMiddle = (targetRect.left - partRect.left) + targetRect.width / 2;
			this.setPage(targetMiddle / partRect.width);
		}
		else {
			this.setPage(0.00);
		}
	}

	public setPage(percentage: number): void {
		this.movePage(Math.floor(this.pageCount * percentage) - this.currentPage);
	}

	public movePage(steps: number): boolean {
		const pageBefore = this.currentPage;

		this._currentPage = Math.max(0, Math.min(this.currentPage + steps, this.pageCount - 1));
		
		if (this.currentPage !== pageBefore) {
			this.hostElement.nativeElement.scrollLeft = (this.columnWidth + this.columnGap) * this.currentPage;
			return true;
		}
		else {
			return false;
		}
	}
}