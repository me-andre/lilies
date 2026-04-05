import _ from "lodash";
import { describe, expect, it } from "vitest";
import LinkedList, { type LinkedListItem, type LinkedListType } from "./LinkedList.js";

interface TestValue {
	number: number;
}

describe("LinkedList", () => {
	const items = spawnItems(10000, (i) => ({
		number: Math.random() * i,
	}));

	function fillList<List extends { push: (item: TestValue) => LinkedListItem<TestValue> }>(
		list: List,
	): LinkedListItem<TestValue>[] {
		return items.map((item) => list.push(item));
	}

	it("can be filled in", () => {
		expect(() => {
			fillList(new LinkedList<TestValue>());
		}).not.toThrow();
	});

	it("will contain all the items", () => {
		const members: TestValue[] = [];
		const list = new LinkedList<TestValue>();
		fillList(list);
		list.each((member) => {
			members.push(member);
		});
		expect(members).toHaveLength(items.length);
	});

	it("will hold proper values", () => {
		const members: TestValue[] = [];
		const list = new LinkedList<TestValue>();
		fillList(list);
		list.each((member) => {
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
			list.eachRight = () => {
				throw "i was called";
			};
			expect(() => {
				list.at(items.length / 2 + 1);
			}).toThrow("i was called");
		});

		it("walks from the right if a negative index is resolved above the middle", () => {
			const list = new LinkedList<TestValue>();
			fillList(list);
			list.eachRight = () => {
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
});

function spawnItems<Item>(count: number, factory: (index: number) => Item) {
	const items: Item[] = [];
	for (let i = 0; i < count; i++) {
		items.push(factory(i));
	}
	return items;
}

function getMembers<Member>(list: LinkedListType<Member>) {
	const members: Member[] = [];
	list.each((member) => {
		members.push(member);
	});
	return members;
}

function randomIndex(length: number) {
	return (length / 4 + (Math.random() * length) / 2) | 0;
}
