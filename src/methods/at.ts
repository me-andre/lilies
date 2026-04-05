import type { LinkedListType } from "../LinkedList.js";
import type { LoopControlType } from "../LoopControl.js";

interface AtVisitor {
	index: number;
	call<Item>(
		this: AtVisitor,
		context: LinkedListType<Item>,
		element: Item,
		index: number,
		loopControl: LoopControlType<Item>,
	): void;
}

interface AtVisitorConstructor {
	new (index: number): AtVisitor;
}

/**
 * Closely matches https://tc39.es/ecma262/#sec-array.prototype.at
 */
export function at<Item>(this: LinkedListType<Item>, index: number): Item | undefined {
	const length = this.length;
	const relativeIndex = Math.trunc(index) || 0;
	const resolvedIndex = relativeIndex >= 0 ? relativeIndex : length + relativeIndex;
	if (resolvedIndex < 0 || resolvedIndex >= length) return undefined;
	const middle = (length / 2) | 0;
	const visitor = new (AtVisitor as unknown as AtVisitorConstructor)(resolvedIndex);
	return (resolvedIndex <= middle ? this.each(visitor) : this.eachRight(visitor)) as
		| Item
		| undefined;
}

function AtVisitor(this: AtVisitor, index: number) {
	this.index = index;
}

AtVisitor.prototype.call = function <Item>(
	this: AtVisitor,
	context: LinkedListType<Item>,
	element: Item,
	index: number,
	loopControl: LoopControlType<Item>,
) {
	if (index === this.index) {
		loopControl.stop(element);
	}
};
