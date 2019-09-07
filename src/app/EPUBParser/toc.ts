export class TOC {
	public readonly title: string;
	public readonly source: string;
	public readonly anchor: string;
	public readonly children: ReadonlyArray<TOC>;

	public constructor(title: string, source: string, anchor: string, children: Array<TOC>) {
		this.title = title;
		this.source = source;
		this.anchor = anchor;
		this.children = children;
	}
}