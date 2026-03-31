import _ from "lodash";
import { describe, expect, it } from "vitest";
import LinkedList, { LinkedListItem, LinkedListType } from "./LinkedList.js";

interface TestValue {
	number: number;
}

describe("LinkedList", function () {
	const items = spawnItems(10000, function (i) {
		return {
			number: Math.random() * i,
		};
	});

	function fillList<
		List extends { push: (item: TestValue) => LinkedListItem<TestValue> },
	>(list: List): LinkedListItem<TestValue>[] {
		return items.map(function (item) {
			return list.push(item);
		});
	}

	it("can be filled in", function () {
		expect(function () {
			fillList(new LinkedList<TestValue>());
		}).not.toThrow();
	});

	it("will contain all the items", function () {
		const members: TestValue[] = [];
		const list = new LinkedList<TestValue>();
		fillList(list);
		list.each(function (member) {
			members.push(member);
		});
		expect(members).toHaveLength(items.length);
	});

	it("will hold proper values", function () {
		const members: TestValue[] = [];
		const list = new LinkedList<TestValue>();
		fillList(list);
		list.each(function (member) {
			members.push(member);
		});
		expect(members).toEqual(items);
	});

	describe("LinkedList#push()", function () {
		it("adds an item to the tail", function () {
			const list = new LinkedList<TestValue>();
			fillList(list);
			const item = { number: 1 };
			list.push(item);
			const members = getMembers(list);
			expect(_.last(members)).toEqual(item);
		});

		it("keeps the .length up-to-date", function () {
			const list = new LinkedList<TestValue>();
			fillList(list);
			const item = { number: 1 };
			list.push(item);
			expect(list).toHaveLength(items.length + 1);
		});
	});

	describe("LinkedList#unshift()", function () {
		it("adds an item to the head", function () {
			const list = new LinkedList<TestValue>();
			fillList(list);
			const item = { number: 1 };
			list.unshift(item);
			expect(getMembers(list)[0]).toEqual(item);
		});

		it("preserves integrity", function () {
			const list = new LinkedList<TestValue>();
			fillList(list);
			const item = { number: 1 };
			list.unshift(item);
			expect(getMembers(list)).toHaveLength(items.length + 1);
		});

		it("keeps the .length up-to-date", function () {
			const list = new LinkedList<TestValue>();
			fillList(list);
			const item = { number: 1 };
			list.unshift(item);
			expect(list).toHaveLength(items.length + 1);
		});
	});

	describe("LinkedList#remove()", function () {
		describe("removing a random item from the middle", function () {
			const index = randomIndex(items.length);
			shouldRemoveAt(index);
		});

		describe("removing the 1st item", function () {
			shouldRemoveAt(0);
		});

		describe("removing the 1st item", function () {
			shouldRemoveAt(items.length - 1);
		});

		function shouldRemoveAt(index: number) {
			const list = new LinkedList<TestValue>();
			const links = fillList(list);
			list.remove(links[index]);
			const members = getMembers(list);

			it("preserves integrity", function () {
				expect(members.length).toEqual(items.length - 1);
			});

			it("removes the given item", function () {
				expect(_.difference(items, members)).toEqual([links[index].value]);
			});

			it("keeps the .length up-to-date", function () {
				expect(list).toHaveLength(items.length - 1);
			});
		}
	});

	describe("LinkedList#at()", function () {
		it("finds an element by index", function () {
			const list = new LinkedList<TestValue>();
			fillList(list);
			const index = randomIndex(items.length);
			expect(list.at(index)).toEqual(items[index]);
		});

		it("throws an error if the index is > length", function () {
			const list = new LinkedList<TestValue>();
			fillList(list);
			const index = items.length;
			expect(function () {
				list.at(index);
			}).toThrow(RangeError);
		});

		it("throws an error if the index is negative", function () {
			const list = new LinkedList<TestValue>();
			fillList(list);
			expect(function () {
				list.at(-1);
			}).toThrow(RangeError);
		});

		it("walks from the right if the index is above the middle", function () {
			const list = new LinkedList<TestValue>();
			fillList(list);
			list.eachRight = function () {
				throw "i was called";
			};
			expect(function () {
				list.at(items.length / 2 + 1);
			}).toThrow("i was called");
		});

		it("succeeds if the index is above the middle", function () {
			const list = new LinkedList<TestValue>();
			fillList(list);
			const index = items.length / 2 + 1;
			expect(list.at(index)).toEqual(items[index]);
		});

		it("finds the element exactly at the middle index", function () {
			const list = new LinkedList<TestValue>();
			fillList(list);
			const middle = (items.length / 2) | 0;
			expect(list.at(middle)).toEqual(items[middle]);
		});

		it("works ok if the list is empty", function () {
			const list = new LinkedList<TestValue>();
			expect(function () {
				list.at(0);
			}).toThrow(RangeError);
			expect(function () {
				list.at(-1);
			}).toThrow(RangeError);
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
	list.each(function (member) {
		members.push(member);
	});
	return members;
}

function randomIndex(length: number) {
	return (length / 4 + (Math.random() * length) / 2) | 0;
}
