const attributes = [
	"src",
	"href",
	"xlink\:href"
];

export const getLinkAttribute: (elem: Element) => string = (elem) => {
	for (const attribute of attributes) {
		if (elem.hasAttribute(attribute)) {
			return attribute;
		}
	}

	return null;
};

export const querySelectLinks: (node: ParentNode) => Array<Element> = (node) => {
	const allElements = node.querySelectorAll("*");
	const matchingElements = new Array<Element>();

	// tslint:disable-next-line: prefer-for-of
	for (let i = 0; i < allElements.length; i++) {
		const element = allElements[i];
		if (getLinkAttribute(element) != null) {
			matchingElements.push(element);
		}
	}

	return matchingElements;
};