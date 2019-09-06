import { XMLParserService } from "../XMLParser/XMLParser.service";
import * as JSZip from "jszip";
import * as Path from "path";

export class EPUB {
	private xmlParser: XMLParserService;
	private zip: JSZip;

	private rootDir: string;
	private root: Document;

	public constructor(xmlParser: XMLParserService, zip: JSZip) {
		this.xmlParser = xmlParser;
		this.zip = zip;
	}

	public async init(): Promise<void> {
		const metaSrc = await this.zip.files["META-INF/container.xml"].async("text");
		const meta = this.xmlParser.parse(metaSrc);

		const rootPath = meta.evaluate(
			"//o:rootfiles/o:rootfile[1]/@full-path",
			meta.documentElement,
			p => {
				switch (p) {
					case "o": return "urn:oasis:names:tc:opendocument:xmlns:container";
					default: return null;
				}
			},
			XPathResult.STRING_TYPE,
			null
		).stringValue;
		this.rootDir = Path.dirname(rootPath);
		const rootSrc = await this.zip.files[rootPath].async("text");
		this.root = this.xmlParser.parse(rootSrc);
	}

	private readXML(document: Document, xPath: string, resultType: number): XPathResult {
		const nsResolver = (p: string) => {
			switch (p) {
				case "p": return "http://www.idpf.org/2007/opf";
				case "dc": return "http://purl.org/dc/elements/1.1/";
				case "opf": return "http://www.idpf.org/2007/opf";
				default: return null;
			}
		};

		return document.evaluate(xPath, document.documentElement, nsResolver, resultType, null);
	}
	private readRoot(xPath: string, resultType: number): XPathResult {
		return this.readXML(this.root, xPath, resultType);
	}

	private getFileInRoot(path: string): JSZip.JSZipObject {
		return this.zip.files[Path.join(this.rootDir, path)];
	}

	public getTitle(): string {
		return this.readRoot("//p:metadata/dc:title/text()", XPathResult.STRING_TYPE).stringValue;
	}
	public getAuthor(): string {
		return this.readRoot("//p:metadata/dc:creator/text()", XPathResult.STRING_TYPE).stringValue;
	}
	public getDate(): Date {
		const date = this.readRoot("//p:metadata/dc:date/text()", XPathResult.STRING_TYPE).stringValue;
		if (date != null && date.length > 0) {
			return new Date(date);
		}
		else {
			return null;
		}
	}
	public getPublisher(): string {
		return this.readRoot("//p:metadata/dc:publisher/text()", XPathResult.STRING_TYPE).stringValue;
	}
	public getLanguage(): string {
		return this.readRoot("//p:metadata/dc:language/text()", XPathResult.STRING_TYPE).stringValue;
	}
	public getRights(): string {
		return this.readRoot("//p:metadata/dc:rights/text()", XPathResult.STRING_TYPE).stringValue;
	}

	private getCoverID(): string {
		return this.readRoot("//p:metadata/p:meta[@name=\"cover\"]/@content", XPathResult.STRING_TYPE).stringValue;
	}
	/**
	 * @returns The cover image in Bas64 or null.
	 */
	public async getCoverImage(): Promise<string> {
		const coverID = this.getCoverID();

		if (coverID != null && coverID.length > 0) {
			const coverPath = this.readRoot(`//p:manifest/*[@id="${coverID}"]/@href`, XPathResult.STRING_TYPE).stringValue;

			if (coverPath != null && coverPath.length > 0) {
				return await this.getFileInRoot(coverPath).async("base64");
			}
		}

		return null;
	}
	public getCoverImageType(): string {
		const coverID = this.getCoverID();

		if (coverID != null && coverID.length > 0) {
			return this.readRoot(`//p:manifest/*[@id="${coverID}"]/@media-type`, XPathResult.STRING_TYPE).stringValue;
		}
		else {
			return null;
		}
	}
}