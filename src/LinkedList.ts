import type { Callable } from "./Callable.js";
import LoopControl from "./LoopControl.js";
import { at } from "./methods/at.js";

export class LinkedListItem<Item> {
	prev: LinkedListItem<Item> | null = null;
	next: LinkedListItem<Item> | null = null;
	value: Item;

	constructor(value: Item) {
		this.value = value;
	}
}

export default class LinkedList<Item> {
	first: LinkedListItem<Item> | null = null;
	last: LinkedListItem<Item> | null = null;
	length = 0;

	push(item: Item): LinkedListItem<Item> {
		const node = new LinkedListItem(item);
		if (this.last) {
			this.last.next = node;
			node.prev = this.last;
		} else {
			this.first = node;
			this.last = node;
		}
		this.last = node;
		this.length++;
		return node;
	}

	unshift(item: Item): LinkedListItem<Item> {
		const node = new LinkedListItem(item);
		if (this.first) {
			this.first.prev = node;
			node.next = this.first;
		} else {
			this.first = node;
			this.last = node;
		}
		this.first = node;
		this.length++;
		return node;
	}

	remove(item: LinkedListItem<Item>): void {
		if (item === this.last) {
			this.last = item.prev;
		}
		if (item === this.first) {
			this.first = item.next;
		}
		if (item.next) {
			item.next.prev = item.prev;
		}
		if (item.prev) {
			item.prev.next = item.next;
		}
		this.length--;
		item.prev = item.next = null;
	}

	each<Context>(visitor: Callable<Context, Item>, context?: Context): void {
		const loopControl = new LoopControl();
		let item = this.first;
		let index = 0;
		while (item && !loopControl.broken) {
			visitor.call(context as Context, item.value, index++, loopControl);
			item = item.next;
		}
	}

	eachRight<Context>(visitor: Callable<Context, Item>, context?: Context): void {
		const loopControl = new LoopControl();
		let item = this.last;
		let index = this.length - 1;
		while (item && !loopControl.broken) {
			visitor.call(context as Context, item.value, index--, loopControl);
			item = item.prev;
		}
	}

	at(index: number): Item | undefined {
		return at.call(this, index) as Item | undefined;
	}
}
