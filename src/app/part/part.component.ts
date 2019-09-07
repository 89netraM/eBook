import { Component, Input, ElementRef } from "@angular/core";
import { SpineEntry } from "../EPUBParser/spine";
import { XMLParserService } from "../XMLParser/XMLParser.service";

@Component({
	selector: "app-part",
	templateUrl: "./part.component.html",
	styleUrls: ["./part.component.scss"]
})
export class PartComponent {
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

	public constructor(private hostElement: ElementRef, private xmlParser: XMLParserService) {
		this.shadowRoot = this.hostElement.nativeElement.attachShadow({ mode: "open" });
	}

	private async updateDisplayedFile(): Promise<void> {
		this.shadowRoot.innerHTML = "";
		this.shadowRoot.append(await this.entry.getHTMLElement(this.xmlParser.parseHTML.bind(this.xmlParser)));
	}
}