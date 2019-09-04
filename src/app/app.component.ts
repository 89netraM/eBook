import { Component } from "@angular/core";
import * as JSZip from "jszip";
import { XMLParserService } from "./XMLParser/XMLParser.service";
import * as path from "path";

@Component({
	selector: "app-root",
	templateUrl: "./app.component.html",
	styleUrls: ["./app.component.scss"]
})
export class AppComponent {
	public title: string = "";
	public cover: string = "";

	public constructor(private xmlParser: XMLParserService) { }

	public async fileChange(files: FileList): Promise<void> {
		const file = files[0];

		const zip = await JSZip.loadAsync(file);

		const xmlSrc = await zip.files["META-INF/container.xml"].async("text");
		const xml = this.xmlParser.parse(xmlSrc);

		const rootPath = xml.querySelector("container > rootfiles > rootfile").attributes["full-path"].value;
		const rootFile = zip.files[rootPath];
		const rootSrc = await rootFile.async("text");
		const root = this.xmlParser.parse(rootSrc);

		const coverMeta = root.querySelector("metadata > meta[name=\"cover\"]");
		if (coverMeta != null) {
			const coverId = coverMeta.attributes["content"].value;

			const imgPath = path.join(path.dirname(rootFile.name), root.getElementById(coverId).attributes["href"].value);
			const imgType = root.getElementById(coverId).attributes["media-type"].value;
			const img = await zip.files[imgPath].async("base64");

			this.cover = `data:${imgType};base64,${img}`;
		}
		else {
			this.cover = "";
		}

		const titleMeta = root.evaluate("//*[name()='dc:title']", root.documentElement);
		if (titleMeta != null) {
			this.title = (titleMeta.iterateNext() as HTMLElement).innerHTML;
		}
		else {
			this.title = "No title found";
		}
	}
}