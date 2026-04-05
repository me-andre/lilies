import type { Callable } from "./Callable.js";
import { at } from "./methods/at.js";

const PREV = Symbol("prev");
const NEXT = Symbol("next");
const FIRST = Symbol("first");
const LAST = Symbol("last");
const LENGTH = Symbol("length");
const BROKEN = Symbol("broken");

export class LinkedListNode<Value> {
	[PREV]: LinkedListNode<Value> | null = null;
	[NEXT]: LinkedListNode<Value> | null = null;

	constructor(public value: Value) {}

	get prev(): LinkedListNode<Value> | null {
		return this[PREV];
	}

	get next(): LinkedListNode<Value> | null {
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

export default class LinkedList<Value> {
	[FIRST]: LinkedListNode<Value> | null = null;
	[LAST]: LinkedListNode<Value> | null = null;
	[LENGTH] = 0;

	get first(): LinkedListNode<Value> | null {
		return this[FIRST];
	}

	get last(): LinkedListNode<Value> | null {
		return this[LAST];
	}

	get length(): number {
		return this[LENGTH];
	}

	push(item: Value): LinkedListNode<Value> {
		const node = new LinkedListNode(item);
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

	unshift(item: Value): LinkedListNode<Value> {
		const node = new LinkedListNode(item);
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

	remove(item: LinkedListNode<Value>): void {
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

	forEach<Context>(visitor: Callable<Context, Value>, context?: Context): void {
		const loopControl = new LoopControl();
		let item = this[FIRST];
		let index = 0;
		while (item && !loopControl.isBroken()) {
			visitor.call(context as Context, item.value, index++, loopControl);
			item = item[NEXT];
		}
	}

	forEachRight<Context>(visitor: Callable<Context, Value>, context?: Context): void {
		const loopControl = new LoopControl();
		let item = this[LAST];
		let index = this[LENGTH] - 1;
		while (item && !loopControl.isBroken()) {
			visitor.call(context as Context, item.value, index--, loopControl);
			item = item[PREV];
		}
	}

	at(index: number): Value | undefined {
		return at.call(this, index) as Value | undefined;
	}

	*[Symbol.iterator](): Iterator<Value> {
		let node = this[FIRST];
		while (node) {
			yield node.value;
			node = node[NEXT];
		}
	}

	*valuesRight(): IterableIterator<Value> {
		let node = this[LAST];
		while (node) {
			yield node.value;
			node = node[PREV];
		}
	}

	*nodes(): IterableIterator<LinkedListNode<Value>> {
		let node = this[FIRST];
		while (node) {
			yield node;
			node = node[NEXT];
		}
	}

	*nodesRight(): IterableIterator<LinkedListNode<Value>> {
		let node = this[LAST];
		while (node) {
			yield node;
			node = node[PREV];
		}
	}
}
