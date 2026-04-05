import type { LinkedListType } from "../LinkedList.js";
import type { LoopControlType } from "../LoopControl.js";

interface AtVisitor<Item> {
	index: number;
	result: Item | undefined;
	call(
		this: AtVisitor<Item>,
		context: LinkedListType<Item>,
		element: Item,
		index: number,
		loopControl: LoopControlType,
	): void;
}

interface AtVisitorConstructor {
	new <Item>(index: number): AtVisitor<Item>;
}

/**
 * Closely matches https://tc39.es/ecma262/#sec-array.prototype.at
 */
export function at<Item>(this: LinkedListType<Item>, index: number): Item | undefined {
	const length = this.length;
	const relativeIndex = Math.trunc(index) || 0;
	const resolvedIndex = relativeIndex >= 0 ? relativeIndex : length + relativeIndex;
	if (resolvedIndex < 0 || resolvedIndex >= length) {
		return undefined;
	}
	const middle = (length / 2) | 0;
	const visitor = new (AtVisitor as unknown as AtVisitorConstructor)<Item>(resolvedIndex);
	if (resolvedIndex <= middle) {
		this.each(visitor);
	} else {
		this.eachRight(visitor);
	}
	return visitor.result;
}

function AtVisitor<Item>(this: AtVisitor<Item>, index: number) {
	this.index = index;
	this.result = undefined;
}

AtVisitor.prototype.call = function <Item>(
	this: AtVisitor<Item>,
	_context: LinkedListType<Item>,
	element: Item,
	index: number,
	loopControl: LoopControlType,
) {
	if (index === this.index) {
		this.result = element;
		loopControl.break();
	}
};
