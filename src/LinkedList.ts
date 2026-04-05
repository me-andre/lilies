import type { Callable } from "./Callable.js";
import { at } from "./methods/at.js";

const PREV = Symbol("prev");
const NEXT = Symbol("next");
const FIRST = Symbol("first");
const LAST = Symbol("last");
const LENGTH = Symbol("length");
const BROKEN = Symbol("broken");

export class LinkedListItem<Item> {
	[PREV]: LinkedListItem<Item> | null = null;
	[NEXT]: LinkedListItem<Item> | null = null;

	constructor(public value: Item) {}

	get prev(): LinkedListItem<Item> | null {
		return this[PREV];
	}

	get next(): LinkedListItem<Item> | null {
		return this[NEXT];
	}
}

class LoopControl {
	private [BROKEN]: boolean = false;

	break() {
		this[BROKEN] = true;
	}

	isBroken(): boolean {
		return this[BROKEN];
	}
}

export default class LinkedList<Item> {
	[FIRST]: LinkedListItem<Item> | null = null;
	[LAST]: LinkedListItem<Item> | null = null;
	[LENGTH] = 0;

	get first(): LinkedListItem<Item> | null {
		return this[FIRST];
	}

	get last(): LinkedListItem<Item> | null {
		return this[LAST];
	}

	get length(): number {
		return this[LENGTH];
	}

	push(item: Item): LinkedListItem<Item> {
		const node = new LinkedListItem(item);
		if (this[LAST]) {
			this[LAST][NEXT] = node;
			node[PREV] = this[LAST];
		} else {
			this[FIRST] = node;
			this[LAST] = node;
		}
		this[LAST] = node;
		this[LENGTH]++;
		return node;
	}

	unshift(item: Item): LinkedListItem<Item> {
		const node = new LinkedListItem(item);
		if (this[FIRST]) {
			this[FIRST][PREV] = node;
			node[NEXT] = this[FIRST];
		} else {
			this[FIRST] = node;
			this[LAST] = node;
		}
		this[FIRST] = node;
		this[LENGTH]++;
		return node;
	}

	remove(item: LinkedListItem<Item>): void {
		if (item === this[LAST]) {
			this[LAST] = item[PREV];
		}
		if (item === this[FIRST]) {
			this[FIRST] = item[NEXT];
		}
		if (item[NEXT]) {
			item[NEXT][PREV] = item[PREV];
		}
		if (item[PREV]) {
			item[PREV][NEXT] = item[NEXT];
		}
		this[LENGTH]--;
		item[PREV] = item[NEXT] = null;
	}

	each<Context>(visitor: Callable<Context, Item>, context?: Context): void {
		const loopControl = new LoopControl();
		let item = this[FIRST];
		let index = 0;
		while (item && !loopControl.isBroken()) {
			visitor.call(context as Context, item.value, index++, loopControl);
			item = item[NEXT];
		}
	}

	eachRight<Context>(visitor: Callable<Context, Item>, context?: Context): void {
		const loopControl = new LoopControl();
		let item = this[LAST];
		let index = this[LENGTH] - 1;
		while (item && !loopControl.isBroken()) {
			visitor.call(context as Context, item.value, index--, loopControl);
			item = item[PREV];
		}
	}

	at(index: number): Item | undefined {
		return at.call(this, index) as Item | undefined;
	}
}
