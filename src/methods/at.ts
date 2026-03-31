import type { LinkedListType } from "../LinkedList";
import type { IterationType } from "../Iteration";

interface AtIterator {
	index: number;
	middle: number;
	call<Item>(
		this: AtIterator,
		context: LinkedListType<Item>,
		element: Item,
		index: number,
		iteration: IterationType<Item>,
	): void;
}

interface AtIteratorConstructor {
	new (index: number, length: number): AtIterator;
}

export function at<Item>(this: LinkedListType<Item>, index: number) {
	if (index < 0 || index > this.length - 1) {
		throw new RangeError("index out of bounds");
	}
	const iterator = new (AtIterator as unknown as AtIteratorConstructor)(
		index,
		this.length,
	);
	return index <= iterator.middle
		? this.each(iterator)
		: this.eachRight(iterator);
}

function AtIterator(this: AtIterator, index: number, length: number) {
	this.index = index;
	this.middle = (length / 2) | 0;
}

AtIterator.prototype.call = function <Item>(
	this: AtIterator,
	context: LinkedListType<Item>,
	element: Item,
	index: number,
	iteration: IterationType<Item>,
) {
	if (index === this.index) {
		iteration.stop(element);
	} else if (this.index === this.middle) {
		iteration.stop();
	}
};
