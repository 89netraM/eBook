import { Component, Input, ElementRef, AfterViewInit } from "@angular/core";
import { SpineEntry } from "../EPUBParser/spine";
import { querySelectLinks, getLinkAttribute } from "./resourceLinks";

@Component({
	selector: "app-part",
	templateUrl: "./part.component.html",
	styleUrls: ["./part.component.scss"]
})
export class PartComponent implements AfterViewInit {
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

	private shadowRoot: ShadowRoot;

	public constructor(private hostElement: ElementRef) { }

	public ngAfterViewInit(): void {
		this.shadowRoot = this.hostElement.nativeElement.attachShadow({ mode: "open" });
	}

	private async updateDisplayedFile(): Promise<void> {
		const fileText = await this.entry.source.async("text");
		const tempDoc = new DOMParser().parseFromString(fileText, "text/html");

		const elements = querySelectLinks(tempDoc);

		const promises = new Array<Promise<void>>();
		// tslint:disable-next-line: prefer-for-of
		for (let i = 0; i < elements.length; i++) {
			promises.push(
				this.replaceLink(elements[i])
			);
		}
		await Promise.all(promises);

		this.shadowRoot.innerHTML = "";
		this.shadowRoot.append(tempDoc.documentElement);
	}

	private async replaceLink(element: Element): Promise<void> {
		const attribute = getLinkAttribute(element);
		const link = element.getAttribute(attribute);

		if (!/^\w*?:/.test(link)) {
			element.setAttribute(
				attribute,
				await this.entry.getResource(link)
			);
		}
	}
}