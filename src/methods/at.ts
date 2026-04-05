import type LinkedList from "../LinkedList.js";
import type LoopControl from "../LoopControl.js";

/**
 * Closely matches https://tc39.es/ecma262/#sec-array.prototype.at
 */
export function at<Item>(this: LinkedList<Item>, index: number): Item | undefined {
	const length = this.length;
	const relativeIndex = Math.trunc(index) || 0;
	const resolvedIndex = relativeIndex >= 0 ? relativeIndex : length + relativeIndex;
	if (resolvedIndex < 0 || resolvedIndex >= length) {
		return undefined;
	}
	const middle = (length / 2) | 0;
	const visitor = new AtVisitor<Item>(resolvedIndex);
	if (resolvedIndex <= middle) {
		this.each(visitor);
	} else {
		this.eachRight(visitor);
	}
	return visitor.result;
}

class AtVisitor<Item> {
	readonly index: number;
	result: Item | undefined = undefined;

	constructor(index: number) {
		this.index = index;
	}

	call(_context: LinkedList<Item>, element: Item, index: number, loopControl: LoopControl) {
		if (index === this.index) {
			this.result = element;
			loopControl.break();
		}
	}
}
