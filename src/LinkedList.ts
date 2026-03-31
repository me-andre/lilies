import Iteration, { IterationType } from "./Iteration";
import { at } from "./methods/at";
import { Callable } from "./Callable";

export interface LinkedListItem<Item> {
	prev: LinkedListItem<Item> | null;
	next: LinkedListItem<Item> | null;
	value: Item;
}

export interface LinkedListType<Item> {
	first: LinkedListItem<Item> | null;
	last: LinkedListItem<Item> | null;
	length: number;
	push(item: Item): LinkedListItem<Item>;
	unshift(item: Item): LinkedListItem<Item>;
	remove(item: LinkedListItem<Item>): void;
	each<Context>(iterator: Callable<Context, Item>, context?: Context): void;
	eachRight<Context>(
		iterator: Callable<Context, Item>,
		context?: Context,
	): void;
	at(index: number): Item | null;
}

interface LinkedListConstructor {
	new <Item>(): LinkedListType<Item>;
}

interface LinkedListItemConstructor {
	new <Item>(item: Item): LinkedListItem<Item>;
}

function LinkedList<Item>(this: LinkedListType<Item>) {
	this.first = this.last = null;
	this.length = 0;
}

LinkedList.prototype.push = function <Item>(
	this: LinkedListType<Item>,
	item: Item,
) {
	const node = new (
		LinkedListItem as unknown as LinkedListItemConstructor
	)<Item>(item);
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
};

LinkedList.prototype.unshift = function <Item>(
	this: LinkedListType<Item>,
	item: Item,
) {
	const node = new (
		LinkedListItem as unknown as LinkedListItemConstructor
	)<Item>(item);
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
};

LinkedList.prototype.remove = function <Item>(
	this: LinkedListType<Item>,
	item: LinkedListItem<Item>,
) {
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
};

LinkedList.prototype.each = function <Item, Context>(
	this: LinkedListType<Item>,
	iterator: (
		this: Context,
		item: Item,
		index: number,
		iteration: IterationType<Item>,
	) => void,
	context: Context,
) {
	const iteration = new Iteration<Item>();
	let item = this.first;
	let index = 0;
	while (item && !iteration.broken) {
		iterator.call(context, item.value, index++, iteration);
		item = item.next;
	}
	return iteration.result;
};

LinkedList.prototype.eachRight = function <Item, Context>(
	this: LinkedListType<Item>,
	iterator: (
		this: Context,
		item: Item,
		index: number,
		iteration: IterationType<Item>,
	) => void,
	context: Context,
) {
	const iteration = new Iteration<Item>();
	let item = this.last;
	let index = this.length - 1;
	while (item && !iteration.broken) {
		iterator.call(context, item.value, index--, iteration);
		item = item.prev;
	}
	return iteration.result;
};

LinkedList.prototype.at = at;

function LinkedListItem<Item>(this: LinkedListItem<Item>, value: Item) {
	this.prev = this.next = null;
	this.value = value;
}

export default LinkedList as unknown as LinkedListConstructor;
