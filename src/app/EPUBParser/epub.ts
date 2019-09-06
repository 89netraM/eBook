import { XMLParserService } from "../XMLParser/XMLParser.service";
import * as JSZip from "jszip";
import * as Path from "path";
import { TOC } from "./toc";

export class EPUB {
	private static readonly metaPath: string = "META-INF/container.xml";

	private xmlParser: XMLParserService;
	private zip: JSZip;

	private rootDir: string;
	private rootDoc: Document;

	private tocDir: string;
	private tocDoc: Document;
	private toc: TOC;
	public get TOC(): TOC {
		return this.toc;
	}

	public constructor(xmlParser: XMLParserService, zip: JSZip) {
		this.xmlParser = xmlParser;
		this.zip = zip;
	}

	public async init(): Promise<void> {
		if (EPUB.metaPath in this.zip.files) {
			const metaSrc = await this.zip.files[EPUB.metaPath].async("text");
			const meta = this.xmlParser.parse(metaSrc);

			const rootPath = this.readXML(meta, "//o:rootfiles/o:rootfile[1]/@full-path", XPathResult.STRING_TYPE).stringValue;

			if (rootPath != null && rootPath.length > 0) {
				this.rootDir = Path.dirname(rootPath);
				const rootSrc = await this.zip.files[rootPath].async("text");
				this.rootDoc = this.xmlParser.parse(rootSrc);

				const tocID = this.readRoot("//p:spine/@toc", XPathResult.STRING_TYPE).stringValue;

				if (tocID != null && tocID.length > 0) {
					const tocPath = this.readRoot(`//p:manifest/*[@id="${tocID}"]/@href`, XPathResult.STRING_TYPE).stringValue;

					if (tocPath != null && tocPath.length > 0) {
						this.tocDir = Path.join(this.rootDir, Path.dirname(tocPath));
						const tocSrc = await this.getFileInRoot(tocPath).async("text");
						this.tocDoc = this.xmlParser.parse(tocSrc);

						if (this.tocDoc != null) {
							const title = this.readXML(this.tocDoc, "//t:docTitle/t:text/text()", XPathResult.STRING_TYPE).stringValue;
							this.toc = new TOC(
								title,
								null,
								null,
								this.generateTOCChildren(
									this.tocDoc,
									this.readXML(this.tocDoc, "//t:navMap", XPathResult.FIRST_ORDERED_NODE_TYPE).singleNodeValue
								)
							);
						}
						else {
							throw new Error("Could not parse the TOC document");
						}
					}
					else {
						throw new Error("Could not find the TOC file");
					}
				}
				else {
					throw new Error("Could not find the TOC file's ID");
				}
			}
			else {
				throw new Error("Could not find the root file");
			}
		}
		else {
			throw new Error("Could not find the meta container");
		}
	}

	private nsResolver(p: string): string {
		switch (p) {
			case "o": return "urn:oasis:names:tc:opendocument:xmlns:container";
			case "p": return "http://www.idpf.org/2007/opf";
			case "dc": return "http://purl.org/dc/elements/1.1/";
			case "opf": return "http://www.idpf.org/2007/opf";
			case "t": return "http://www.daisy.org/z3986/2005/ncx/";
			default: return null;
		}
	}
	private readXML(document: Document, xPath: string, resultType: number): XPathResult {
		return document.evaluate(xPath, document.documentElement, this.nsResolver, resultType, null);
	}
	private readRoot(xPath: string, resultType: number): XPathResult {
		return this.readXML(this.rootDoc, xPath, resultType);
	}

	private getFileInRoot(path: string): JSZip.JSZipObject {
		return this.zip.files[Path.join(this.rootDir, path)];
	}
	private getFileInTOC(path: string): JSZip.JSZipObject {
		return this.zip.files[Path.join(this.tocDir, path)];
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

	private generateTOCChildren(doc: Document, parent: Node): Array<TOC> {
		const children = new Array<TOC>();

		const nodeIterator = doc.evaluate("./t:navPoint", parent, this.nsResolver, XPathResult.ORDERED_NODE_ITERATOR_TYPE, null);
		for (let node = nodeIterator.iterateNext(); node != null; node = nodeIterator.iterateNext()) {
			const title = doc.evaluate("./t:navLabel/t:text/text()", node, this.nsResolver, XPathResult.STRING_TYPE, null).stringValue;

			const path = doc.evaluate("./t:content/@src", node, this.nsResolver, XPathResult.STRING_TYPE, null).stringValue;
			const [filePath, anchor] = path.split("#");
			const source = this.getFileInTOC(filePath);

			children.push(
				new TOC(
					title,
					source,
					anchor,
					this.generateTOCChildren(doc, node)
				)
			);
		}

		return children;
	}
}