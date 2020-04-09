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

	@HostBinding("style.columnWidth")
	public get columnWidth(): string {
		return this.hostElement.nativeElement.offsetWidth + "px";
	}

	@HostBinding("attr.data-file")
	public fileName: string;

	@Output()
	public navigation: EventEmitter<BookNavigationEvent> = new EventEmitter<BookNavigationEvent>();

	private shadowRoot: ShadowRoot;

	public constructor(private hostElement: ElementRef<HTMLElement>, private xmlParser: XMLParserService) {
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
}