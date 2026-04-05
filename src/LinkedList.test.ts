import _ from "lodash";
import { describe, expect, it } from "vitest";
import LinkedList, { type LinkedListNode } from "./LinkedList.js";

interface TestValue {
	number: number;
}

describe("LinkedList", () => {
	const items = spawnItems(10000, (i) => ({
		number: Math.random() * i,
	}));

	function fillList<List extends { push: (item: TestValue) => LinkedListNode<TestValue> }>(
		list: List,
	): LinkedListNode<TestValue>[] {
		return items.map((item) => list.push(item));
	}

	it("can be filled in", () => {
		expect(() => {
			fillList(new LinkedList<TestValue>());
		}).not.toThrow();
	});

	describe("LinkedList.from()", () => {
		it("creates a list from an array", () => {
			const list = LinkedList.from([1, 2, 3]);
			expect([...list]).toEqual([1, 2, 3]);
			expect(list.length).toBe(3);
		});

		it("creates a list from another list", () => {
			const original = LinkedList.from([1, 2, 3]);
			const copy = LinkedList.from(original);
			expect([...copy]).toEqual([1, 2, 3]);
			copy.push(4);
			expect([...original]).toEqual([1, 2, 3]);
		});

		it("creates a list from a generator", () => {
			function* gen() {
				yield 10;
				yield 20;
			}
			const list = LinkedList.from(gen());
			expect([...list]).toEqual([10, 20]);
		});

		it("returns an empty list from an empty iterable", () => {
			const list = LinkedList.from([]);
			expect([...list]).toEqual([]);
			expect(list.length).toBe(0);
		});

		it("creates a single-node list", () => {
			const list = LinkedList.from([42]);
			expect([...list]).toEqual([42]);
			expect([...list.valuesRight()]).toEqual([42]);
			expect(list.length).toBe(1);
		});
	});

	it("will contain all the items", () => {
		const members: TestValue[] = [];
		const list = new LinkedList<TestValue>();
		fillList(list);
		list.forEach((member) => {
			members.push(member);
		});
		expect(members).toHaveLength(items.length);
	});

	it("will hold proper values", () => {
		const members: TestValue[] = [];
		const list = new LinkedList<TestValue>();
		fillList(list);
		list.forEach((member) => {
			members.push(member);
		});
		expect(members).toEqual(items);
	});

	describe("LinkedList#push()", () => {
		it("adds an item to the tail", () => {
			const list = new LinkedList<TestValue>();
			fillList(list);
			const item = { number: 1 };
			list.push(item);
			const members = getMembers(list);
			expect(_.last(members)).toEqual(item);
		});

		it("keeps the .length up-to-date", () => {
			const list = new LinkedList<TestValue>();
			fillList(list);
			const item = { number: 1 };
			list.push(item);
			expect(list).toHaveLength(items.length + 1);
		});
	});

	describe("LinkedList#unshift()", () => {
		it("adds an item to the head", () => {
			const list = new LinkedList<TestValue>();
			fillList(list);
			const item = { number: 1 };
			list.unshift(item);
			expect(getMembers(list)[0]).toEqual(item);
		});

		it("preserves integrity", () => {
			const list = new LinkedList<TestValue>();
			fillList(list);
			const item = { number: 1 };
			list.unshift(item);
			expect(getMembers(list)).toHaveLength(items.length + 1);
		});

		it("keeps the .length up-to-date", () => {
			const list = new LinkedList<TestValue>();
			fillList(list);
			const item = { number: 1 };
			list.unshift(item);
			expect(list).toHaveLength(items.length + 1);
		});
	});

	describe("LinkedList#remove()", () => {
		describe("removing a random item from the middle", () => {
			const index = randomIndex(items.length);
			shouldRemoveAt(index);
		});

		describe("removing the 1st item", () => {
			shouldRemoveAt(0);
		});

		describe("removing the 1st item", () => {
			shouldRemoveAt(items.length - 1);
		});

		function shouldRemoveAt(index: number) {
			const list = new LinkedList<TestValue>();
			const links = fillList(list);
			list.remove(links[index]);
			const members = getMembers(list);

			it("preserves integrity", () => {
				expect(members.length).toEqual(items.length - 1);
			});

			it("removes the given item", () => {
				expect(_.difference(items, members)).toEqual([links[index].value]);
			});

			it("keeps the .length up-to-date", () => {
				expect(list).toHaveLength(items.length - 1);
			});
		}
	});

	describe("LinkedList#at()", () => {
		it("finds an element by index", () => {
			const list = new LinkedList<TestValue>();
			fillList(list);
			const index = randomIndex(items.length);
			expect(list.at(index)).toEqual(items[index]);
		});

		it("returns undefined if the index is >= length", () => {
			const list = new LinkedList<TestValue>();
			fillList(list);
			expect(list.at(items.length)).toBeUndefined();
			expect(list.at(items.length + 100)).toBeUndefined();
		});

		it("supports negative indices counting from the end", () => {
			const list = new LinkedList<TestValue>();
			fillList(list);
			expect(list.at(-1)).toEqual(items[items.length - 1]);
			expect(list.at(-2)).toEqual(items[items.length - 2]);
		});

		it("returns undefined for negative indices beyond the start", () => {
			const list = new LinkedList<TestValue>();
			fillList(list);
			expect(list.at(-items.length - 1)).toBeUndefined();
		});

		it("walks from the right if the index is above the middle", () => {
			const list = new LinkedList<TestValue>();
			fillList(list);
			list.forEachRight = () => {
				throw "i was called";
			};
			expect(() => {
				list.at(items.length / 2 + 1);
			}).toThrow("i was called");
		});

		it("walks from the right if a negative index is resolved above the middle", () => {
			const list = new LinkedList<TestValue>();
			fillList(list);
			list.forEachRight = () => {
				throw "i was called";
			};
			expect(() => {
				list.at(-(items.length / 2) + 1);
			}).toThrow("i was called");
		});

		it("succeeds if the resolved index is above the middle", () => {
			const list = new LinkedList<TestValue>();
			fillList(list);
			const index = items.length / 2 + 1;
			expect(list.at(index)).toEqual(items[index]);
		});

		it("finds the element exactly at the middle index", () => {
			const list = new LinkedList<TestValue>();
			fillList(list);
			const middle = (items.length / 2) | 0;
			expect(list.at(middle)).toEqual(items[middle]);
		});

		it("returns undefined for an empty list", () => {
			const list = new LinkedList<TestValue>();
			expect(list.at(0)).toBeUndefined();
			expect(list.at(-1)).toBeUndefined();
		});

		it("truncates non-integer indices", () => {
			const list = new LinkedList<TestValue>();
			fillList(list);
			expect(list.at(1.9)).toEqual(items[1]);
			expect(list.at(-1.9)).toEqual(items[items.length - 1]);
		});
	});

	describe("Symbol.iterator", () => {
		it("yields all values in order", () => {
			const list = new LinkedList<TestValue>();
			fillList(list);
			expect([...list]).toEqual(items);
		});

		it("yields nothing for an empty list", () => {
			const list = new LinkedList<TestValue>();
			expect([...list]).toEqual([]);
		});
	});

	describe("valuesRight()", () => {
		it("yields all values in reverse", () => {
			const list = new LinkedList<TestValue>();
			fillList(list);
			expect([...list.valuesRight()]).toEqual([...items].reverse());
		});

		it("yields nothing for an empty list", () => {
			const list = new LinkedList<TestValue>();
			expect([...list.valuesRight()]).toEqual([]);
		});
	});

	describe("nodes()", () => {
		it("yields all nodes in order", () => {
			const list = new LinkedList<TestValue>();
			const links = fillList(list);
			const nodes = [...list.nodes()];
			expect(nodes).toHaveLength(items.length);
			expect(nodes.map((n) => n.value)).toEqual(items);
			expect(nodes[0]).toBe(links[0]);
		});
	});

	describe("nodesRight()", () => {
		it("yields all nodes in reverse", () => {
			const list = new LinkedList<TestValue>();
			const links = fillList(list);
			const nodes = [...list.nodesRight()];
			expect(nodes).toHaveLength(items.length);
			expect(nodes.map((n) => n.value)).toEqual([...items].reverse());
			expect(nodes[0]).toBe(links[links.length - 1]);
		});
	});

	describe("insertBefore()", () => {
		it("inserts a value before a middle node", () => {
			const list = new LinkedList<number>();
			list.push(1);
			const n2 = list.push(2);
			list.push(3);
			list.insertBefore(n2, 99);
			expect([...list]).toEqual([1, 99, 2, 3]);
		});

		it("inserts a value before the first node", () => {
			const list = new LinkedList<number>();
			const n1 = list.push(1);
			list.push(2);
			list.insertBefore(n1, 99);
			expect([...list]).toEqual([99, 1, 2]);
			expect(list.first?.value).toBe(99);
		});

		it("returns the new node", () => {
			const list = new LinkedList<number>();
			const n1 = list.push(1);
			const inserted = list.insertBefore(n1, 42);
			expect(inserted.value).toBe(42);
			expect(inserted.next).toBe(n1);
		});

		it("updates length", () => {
			const list = new LinkedList<number>();
			const n1 = list.push(1);
			list.insertBefore(n1, 99);
			expect(list.length).toBe(2);
		});

		it("inserts a list before a middle node", () => {
			const a = new LinkedList<number>();
			a.push(1);
			const n2 = a.push(2);
			a.push(3);
			const b = new LinkedList<number>();
			b.push(10);
			b.push(20);
			a.insertBefore(n2, b);
			expect([...a]).toEqual([1, 10, 20, 2, 3]);
			expect(a.length).toBe(5);
		});

		it("inserts a list before the first node", () => {
			const a = new LinkedList<number>();
			const n1 = a.push(1);
			a.push(2);
			const b = new LinkedList<number>();
			b.push(10);
			b.push(20);
			a.insertBefore(n1, b);
			expect([...a]).toEqual([10, 20, 1, 2]);
			expect(a.first?.value).toBe(10);
			expect(a.length).toBe(4);
		});

		it("does nothing when inserting an empty list before a node", () => {
			const a = new LinkedList<number>();
			const n1 = a.push(1);
			const empty = new LinkedList<number>();
			a.insertBefore(n1, empty);
			expect([...a]).toEqual([1]);
			expect(a.length).toBe(1);
		});

		it("inserts a value into a single-node list", () => {
			const list = new LinkedList<number>();
			const n1 = list.push(1);
			list.insertBefore(n1, 99);
			expect([...list]).toEqual([99, 1]);
			expect([...list.valuesRight()]).toEqual([1, 99]);
			expect(list.length).toBe(2);
		});

		it("inserts a single-node list into a single-node list", () => {
			const a = new LinkedList<number>();
			const n1 = a.push(1);
			const b = new LinkedList<number>();
			b.push(10);
			a.insertBefore(n1, b);
			expect([...a]).toEqual([10, 1]);
			expect([...b]).toEqual([10]);
			expect([...a.valuesRight()]).toEqual([1, 10]);
			expect(a.length).toBe(2);
		});
	});

	describe("insertAfter()", () => {
		it("inserts a value after a middle node", () => {
			const list = new LinkedList<number>();
			list.push(1);
			const n2 = list.push(2);
			list.push(3);
			list.insertAfter(n2, 99);
			expect([...list]).toEqual([1, 2, 99, 3]);
		});

		it("inserts a value after the last node", () => {
			const list = new LinkedList<number>();
			list.push(1);
			const n2 = list.push(2);
			list.insertAfter(n2, 99);
			expect([...list]).toEqual([1, 2, 99]);
			expect(list.last?.value).toBe(99);
		});

		it("returns the new node", () => {
			const list = new LinkedList<number>();
			const n1 = list.push(1);
			const inserted = list.insertAfter(n1, 42);
			expect(inserted.value).toBe(42);
			expect(inserted.prev).toBe(n1);
		});

		it("updates length", () => {
			const list = new LinkedList<number>();
			const n1 = list.push(1);
			list.insertAfter(n1, 99);
			expect(list.length).toBe(2);
		});

		it("inserts a list after a middle node", () => {
			const a = new LinkedList<number>();
			a.push(1);
			const n2 = a.push(2);
			a.push(3);
			const b = new LinkedList<number>();
			b.push(10);
			b.push(20);
			a.insertAfter(n2, b);
			expect([...a]).toEqual([1, 2, 10, 20, 3]);
			expect(a.length).toBe(5);
		});

		it("inserts a list after the last node", () => {
			const a = new LinkedList<number>();
			a.push(1);
			const n2 = a.push(2);
			const b = new LinkedList<number>();
			b.push(10);
			b.push(20);
			a.insertAfter(n2, b);
			expect([...a]).toEqual([1, 2, 10, 20]);
			expect(a.last?.value).toBe(20);
			expect(a.length).toBe(4);
		});

		it("does nothing when inserting an empty list after a node", () => {
			const a = new LinkedList<number>();
			const n1 = a.push(1);
			const empty = new LinkedList<number>();
			a.insertAfter(n1, empty);
			expect([...a]).toEqual([1]);
			expect(a.length).toBe(1);
		});

		it("inserts a value into a single-node list", () => {
			const list = new LinkedList<number>();
			const n1 = list.push(1);
			list.insertAfter(n1, 99);
			expect([...list]).toEqual([1, 99]);
			expect([...list.valuesRight()]).toEqual([99, 1]);
			expect(list.length).toBe(2);
		});

		it("inserts a single-node list into a single-node list", () => {
			const a = new LinkedList<number>();
			const n1 = a.push(1);
			const b = new LinkedList<number>();
			b.push(10);
			a.insertAfter(n1, b);
			expect([...a]).toEqual([1, 10]);
			expect([...b]).toEqual([10]);
			expect([...a.valuesRight()]).toEqual([10, 1]);
			expect(a.length).toBe(2);
		});
	});

	describe("sublist iteration", () => {
		function makeSublist() {
			const a = new LinkedList<number>();
			a.push(1);
			const n2 = a.push(2);
			a.push(3);
			const b = new LinkedList<number>();
			b.push(10);
			b.push(20);
			a.insertAfter(n2, b);
			return { a, b };
		}

		it("parent iterates all nodes including inserted ones", () => {
			const { a } = makeSublist();
			expect([...a]).toEqual([1, 2, 10, 20, 3]);
		});

		it("child [Symbol.iterator] is bounded by its own FIRST/LAST", () => {
			const { b } = makeSublist();
			expect([...b]).toEqual([10, 20]);
		});

		it("child valuesRight() is bounded", () => {
			const { b } = makeSublist();
			expect([...b.valuesRight()]).toEqual([20, 10]);
		});

		it("child nodes() is bounded", () => {
			const { b } = makeSublist();
			expect([...b.nodes()].map((n) => n.value)).toEqual([10, 20]);
		});

		it("child nodesRight() is bounded", () => {
			const { b } = makeSublist();
			expect([...b.nodesRight()].map((n) => n.value)).toEqual([20, 10]);
		});

		it("child forEach is bounded", () => {
			const { b } = makeSublist();
			const values: number[] = [];
			b.forEach((v) => {
				values.push(v);
			});
			expect(values).toEqual([10, 20]);
		});

		it("child forEachRight is bounded", () => {
			const { b } = makeSublist();
			const values: number[] = [];
			b.forEachRight((v) => {
				values.push(v);
			});
			expect(values).toEqual([20, 10]);
		});

		it("child at() is bounded", () => {
			const { b } = makeSublist();
			expect(b.at(0)).toBe(10);
			expect(b.at(1)).toBe(20);
			expect(b.at(2)).toBeUndefined();
		});

		it("child length remains accurate", () => {
			const { b } = makeSublist();
			expect(b.length).toBe(2);
		});

		it("works when inserting before the first node", () => {
			const a = new LinkedList<number>();
			const n1 = a.push(1);
			a.push(2);
			const b = new LinkedList<number>();
			b.push(10);
			b.push(20);
			a.insertBefore(n1, b);
			expect([...a]).toEqual([10, 20, 1, 2]);
			expect([...b]).toEqual([10, 20]);
			expect([...b.valuesRight()]).toEqual([20, 10]);
		});

		it("works when inserting after the last node", () => {
			const a = new LinkedList<number>();
			a.push(1);
			const n2 = a.push(2);
			const b = new LinkedList<number>();
			b.push(10);
			b.push(20);
			a.insertAfter(n2, b);
			expect([...a]).toEqual([1, 2, 10, 20]);
			expect([...b]).toEqual([10, 20]);
			expect([...b.valuesRight()]).toEqual([20, 10]);
		});
	});

	describe("slice()", () => {
		it("copies a span from the middle", () => {
			const list = new LinkedList<number>();
			list.push(1);
			const n2 = list.push(2);
			const n3 = list.push(3);
			list.push(4);
			const sliced = list.slice(n2, n3);
			expect([...sliced]).toEqual([2, 3]);
			expect([...sliced.valuesRight()]).toEqual([3, 2]);
			expect([...list]).toEqual([1, 2, 3, 4]);
		});

		it("copies the full list", () => {
			const list = new LinkedList<number>();
			const n1 = list.push(1);
			list.push(2);
			const n3 = list.push(3);
			const sliced = list.slice(n1, n3);
			expect([...sliced]).toEqual([1, 2, 3]);
		});

		it("copies a single node", () => {
			const list = new LinkedList<number>();
			list.push(1);
			const n2 = list.push(2);
			list.push(3);
			const sliced = list.slice(n2, n2);
			expect([...sliced]).toEqual([2]);
		});

		it("produces an independent list", () => {
			const list = new LinkedList<number>();
			const n1 = list.push(1);
			const n2 = list.push(2);
			const sliced = list.slice(n1, n2);
			sliced.push(99);
			expect([...list]).toEqual([1, 2]);
			expect([...sliced]).toEqual([1, 2, 99]);
		});
	});

	describe("removeSlice()", () => {
		it("removes a span from the middle", () => {
			const list = new LinkedList<number>();
			list.push(1);
			const n2 = list.push(2);
			const n3 = list.push(3);
			list.push(4);
			list.removeSlice(n2, n3);
			expect([...list]).toEqual([1, 4]);
			expect(list.length).toBe(2);
		});

		it("removes from the head", () => {
			const list = new LinkedList<number>();
			const n1 = list.push(1);
			const n2 = list.push(2);
			list.push(3);
			list.removeSlice(n1, n2);
			expect([...list]).toEqual([3]);
			expect([...list.valuesRight()]).toEqual([3]);
			expect(list.first?.value).toBe(3);
			expect(list.length).toBe(1);
		});

		it("removes from the tail", () => {
			const list = new LinkedList<number>();
			list.push(1);
			const n2 = list.push(2);
			const n3 = list.push(3);
			list.removeSlice(n2, n3);
			expect([...list]).toEqual([1]);
			expect([...list.valuesRight()]).toEqual([1]);
			expect(list.last?.value).toBe(1);
			expect(list.length).toBe(1);
		});

		it("removes the entire list", () => {
			const list = new LinkedList<number>();
			const n1 = list.push(1);
			list.push(2);
			const n3 = list.push(3);
			list.removeSlice(n1, n3);
			expect([...list]).toEqual([]);
			expect(list.first).toBeNull();
			expect(list.last).toBeNull();
			expect(list.length).toBe(0);
		});

		it("nulls out removed nodes", () => {
			const list = new LinkedList<number>();
			list.push(1);
			const n2 = list.push(2);
			const n3 = list.push(3);
			list.push(4);
			list.removeSlice(n2, n3);
			expect(n2.prev).toBeNull();
			expect(n2.next).toBeNull();
			expect(n3.prev).toBeNull();
			expect(n3.next).toBeNull();
		});
	});

	describe("LinkedList.concat()", () => {
		it("concatenates multiple lists into a new one", () => {
			const a = new LinkedList<number>();
			a.push(1);
			a.push(2);
			const b = new LinkedList<number>();
			b.push(3);
			b.push(4);
			const c = new LinkedList<number>();
			c.push(5);
			const result = LinkedList.concat(a, b, c);
			expect([...result]).toEqual([1, 2, 3, 4, 5]);
			expect(result.length).toBe(5);
		});

		it("skips empty lists", () => {
			const a = new LinkedList<number>();
			a.push(1);
			const empty = new LinkedList<number>();
			const b = new LinkedList<number>();
			b.push(2);
			const result = LinkedList.concat(a, empty, b);
			expect([...result]).toEqual([1, 2]);
			expect(result.length).toBe(2);
		});

		it("returns an empty list when all arguments are empty", () => {
			const result = LinkedList.concat(new LinkedList<number>(), new LinkedList<number>());
			expect([...result]).toEqual([]);
			expect(result.length).toBe(0);
		});

		it("source lists still iterate their own spans", () => {
			const a = new LinkedList<number>();
			a.push(1);
			const b = new LinkedList<number>();
			b.push(2);
			b.push(3);
			const c = new LinkedList<number>();
			c.push(4);
			const result = LinkedList.concat(a, b, c);
			expect([...result]).toEqual([1, 2, 3, 4]);
			expect([...a]).toEqual([1]);
			expect([...b]).toEqual([2, 3]);
			expect([...b.valuesRight()]).toEqual([3, 2]);
			expect([...c]).toEqual([4]);
		});

		it("concats single-node lists", () => {
			const a = new LinkedList<number>();
			a.push(1);
			const b = new LinkedList<number>();
			b.push(2);
			const result = LinkedList.concat(a, b);
			expect([...result]).toEqual([1, 2]);
			expect([...result.valuesRight()]).toEqual([2, 1]);
			expect([...a]).toEqual([1]);
			expect([...b]).toEqual([2]);
			expect(result.length).toBe(2);
		});

		it("concats a mix of empty and single-node lists", () => {
			const a = new LinkedList<number>();
			const b = new LinkedList<number>();
			b.push(1);
			const c = new LinkedList<number>();
			const result = LinkedList.concat(a, b, c);
			expect([...result]).toEqual([1]);
			expect([...result.valuesRight()]).toEqual([1]);
			expect(result.length).toBe(1);
		});
	});
});

function spawnItems<Item>(count: number, factory: (index: number) => Item) {
	const items: Item[] = [];
	for (let i = 0; i < count; i++) {
		items.push(factory(i));
	}
	return items;
}

function getMembers<Member>(list: LinkedList<Member>) {
	const members: Member[] = [];
	list.forEach((member) => {
		members.push(member);
	});
	return members;
}

function randomIndex(length: number) {
	return (length / 4 + (Math.random() * length) / 2) | 0;
}
