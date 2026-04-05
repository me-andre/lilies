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

	private isFirst(node: LinkedListNode<Value>): boolean {
		return node === this[FIRST];
	}

	private isLast(node: LinkedListNode<Value>): boolean {
		return node === this[LAST];
	}

	static from<V>(iterable: Iterable<V>): LinkedList<V> {
		const list = new LinkedList<V>();
		for (const value of iterable) {
			list.push(value);
		}
		return list;
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
		if (this.isLast(item)) {
			this[LAST] = item[PREV];
		}
		if (this.isFirst(item)) {
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
			item = this.isLast(item) ? null : item[NEXT];
		}
	}

	forEachRight<Context>(visitor: Callable<Context, Value>, context?: Context): void {
		const loopControl = new LoopControl();
		let item = this[LAST];
		let index = this[LENGTH] - 1;
		while (item && !loopControl.isBroken()) {
			visitor.call(context as Context, item.value, index--, loopControl);
			item = this.isFirst(item) ? null : item[PREV];
		}
	}

	at(index: number): Value | undefined {
		return at.call(this, index) as Value | undefined;
	}

	*[Symbol.iterator](): Iterator<Value> {
		let node = this[FIRST];
		while (node) {
			yield node.value;
			node = this.isLast(node) ? null : node[NEXT];
		}
	}

	*valuesRight(): IterableIterator<Value> {
		let node = this[LAST];
		while (node) {
			yield node.value;
			node = this.isFirst(node) ? null : node[PREV];
		}
	}

	*nodes(): IterableIterator<LinkedListNode<Value>> {
		let node = this[FIRST];
		while (node) {
			yield node;
			node = this.isLast(node) ? null : node[NEXT];
		}
	}

	*nodesRight(): IterableIterator<LinkedListNode<Value>> {
		let node = this[LAST];
		while (node) {
			yield node;
			node = this.isFirst(node) ? null : node[PREV];
		}
	}

	insertBefore(node: LinkedListNode<Value>, value: Value): LinkedListNode<Value>;
	insertBefore(node: LinkedListNode<Value>, list: LinkedList<Value>): void;
	insertBefore(
		node: LinkedListNode<Value>,
		valueOrList: Value | LinkedList<Value>,
	): LinkedListNode<Value> | undefined {
		if (valueOrList instanceof LinkedList) {
			const list = valueOrList;
			if (!list[FIRST] || !list[LAST]) {
				return;
			}
			const spliceFirst = list[FIRST];
			const spliceLast = list[LAST];

			spliceFirst[PREV] = node[PREV];
			spliceLast[NEXT] = node;

			if (node[PREV]) {
				node[PREV][NEXT] = spliceFirst;
			}
			node[PREV] = spliceLast;

			if (this.isFirst(node)) {
				this[FIRST] = spliceFirst;
			}
			this[LENGTH] += list[LENGTH];
		} else {
			const newNode = new LinkedListNode(valueOrList);
			newNode[NEXT] = node;
			newNode[PREV] = node[PREV];

			if (node[PREV]) {
				node[PREV][NEXT] = newNode;
			}
			node[PREV] = newNode;

			if (this.isFirst(node)) {
				this[FIRST] = newNode;
			}
			this[LENGTH]++;
			return newNode;
		}
	}

	insertAfter(node: LinkedListNode<Value>, value: Value): LinkedListNode<Value>;
	insertAfter(node: LinkedListNode<Value>, list: LinkedList<Value>): void;
	insertAfter(
		node: LinkedListNode<Value>,
		valueOrList: Value | LinkedList<Value>,
	): LinkedListNode<Value> | undefined {
		if (valueOrList instanceof LinkedList) {
			const list = valueOrList;
			if (!list[FIRST] || !list[LAST]) {
				return;
			}
			const spliceFirst = list[FIRST];
			const spliceLast = list[LAST];

			spliceLast[NEXT] = node[NEXT];
			spliceFirst[PREV] = node;

			if (node[NEXT]) {
				node[NEXT][PREV] = spliceLast;
			}
			node[NEXT] = spliceFirst;

			if (this.isLast(node)) {
				this[LAST] = spliceLast;
			}
			this[LENGTH] += list[LENGTH];
		} else {
			const newNode = new LinkedListNode(valueOrList);
			newNode[PREV] = node;
			newNode[NEXT] = node[NEXT];

			if (node[NEXT]) {
				node[NEXT][PREV] = newNode;
			}
			node[NEXT] = newNode;

			if (this.isLast(node)) {
				this[LAST] = newNode;
			}
			this[LENGTH]++;
			return newNode;
		}
	}

	slice(startNode: LinkedListNode<Value>, endNode: LinkedListNode<Value>): LinkedList<Value> {
		const result = new LinkedList<Value>();
		let node: LinkedListNode<Value> | null = startNode;
		while (node) {
			result.push(node.value);
			node = node === endNode ? null : node[NEXT];
		}
		return result;
	}

	removeSlice(startNode: LinkedListNode<Value>, endNode: LinkedListNode<Value>): void {
		const prevNode = startNode[PREV];
		const nextNode = endNode[NEXT];

		if (prevNode) {
			prevNode[NEXT] = nextNode;
		}
		if (nextNode) {
			nextNode[PREV] = prevNode;
		}

		if (this.isFirst(startNode)) {
			this[FIRST] = nextNode;
		}
		if (this.isLast(endNode)) {
			this[LAST] = prevNode;
		}

		let count = 0;
		let node: LinkedListNode<Value> | null = startNode;
		while (node) {
			const next: LinkedListNode<Value> | null = node === endNode ? null : node[NEXT];
			node[PREV] = null;
			node[NEXT] = null;
			count++;
			node = next;
		}
		this[LENGTH] -= count;
	}

	static concat<V>(...lists: LinkedList<V>[]): LinkedList<V> {
		const result = new LinkedList<V>();
		for (const list of lists) {
			if (!list[FIRST] || !list[LAST]) {
				continue;
			}
			const spliceFirst = list[FIRST];
			const spliceLast = list[LAST];

			if (result[LAST]) {
				result[LAST][NEXT] = spliceFirst;
				spliceFirst[PREV] = result[LAST];
			} else {
				result[FIRST] = spliceFirst;
			}
			result[LAST] = spliceLast;
			result[LENGTH] += list[LENGTH];
		}
		return result;
	}
}
