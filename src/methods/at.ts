import type { LinkedListType } from "../LinkedList";
import type { LoopControlType } from "../LoopControl";

interface AtVisitor {
	index: number;
	middle: number;
	call<Item>(
		this: AtVisitor,
		context: LinkedListType<Item>,
		element: Item,
		index: number,
		loopControl: LoopControlType<Item>,
	): void;
}

interface AtVisitorConstructor {
	new (index: number, length: number): AtVisitor;
}

export function at<Item>(this: LinkedListType<Item>, index: number) {
	if (index < 0 || index > this.length - 1) {
		throw new RangeError("index out of bounds");
	}
	const visitor = new (AtVisitor as unknown as AtVisitorConstructor)(
		index,
		this.length,
	);
	return index <= visitor.middle ? this.each(visitor) : this.eachRight(visitor);
}

function AtVisitor(this: AtVisitor, index: number, length: number) {
	this.index = index;
	this.middle = (length / 2) | 0;
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
	} else if (this.index === this.middle) {
		loopControl.stop();
	}
};
