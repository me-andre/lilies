import Benchmark from "benchmark";
import LinkedList from "./dist/LinkedList.js";

const items = spawnItems(100000, (i) => ({
	number: Math.random() * i,
}));

global.list = new LinkedList();
global.array = [];

new Benchmark.Suite()
	.add("LinkedList#push()", () => {
		fillList(list);
	})
	.add("Array#push()", () => {
		fillList(array);
	})
	.on("cycle", (event) => {
		console.log(String(event.target));
	})
	.on("error", (event) => {
		console.log(event);
	})
	.on("complete", function () {
		console.log(`Fastest is ${this.filter("fastest").map(({ name }) => name)}`);
	})
	.run();

list = new LinkedList();
array = [];

fillList(list);
fillList(array);

new Benchmark.Suite()
	.add("LinkedList#each()", () => {
		let _sum = 0;
		list.each((item) => {
			_sum += item.number;
		});
	})
	.add("Array#forEach()", () => {
		let _sum = 0;
		array.forEach((item) => {
			_sum += item.number;
		});
	})
	.on("cycle", (event) => {
		console.log(String(event.target));
	})
	.on("error", (event) => {
		console.log(event);
	})
	.on("complete", function () {
		console.log(`Fastest is ${this.filter("fastest").map("name")}`);
	})
	.run();

global.randomIndex = (length) => (Math.random() * length) | 0;

list = new LinkedList();
array = [];

fillList(list);
fillList(array);

new Benchmark.Suite()
	.add("LinkedList#at()", () => {
		let _sum = 0;
		for (let i = 0; i < 100; i++) {
			_sum += list.at(randomIndex(list.length));
		}
	})
	.add("Array#[]", () => {
		let _sum = 0;
		for (let i = 0; i < 100; i++) {
			_sum += array[randomIndex(array.length)];
		}
	})
	.on("cycle", (event) => {
		console.log(String(event.target));
	})
	.on("error", (event) => {
		console.log(event);
	})
	.on("complete", function () {
		console.log(`Fastest is ${this.filter("fastest").map("name")}`);
	})
	.run();

const removeCount = items.length / 2;

prepareListRemove();
prepareArrayRemove();

new Benchmark.Suite()
	.add(
		"LinkedList#remove()",
		() => {
			for (let i = 0; i < global.itemsToRemoveFromList.length; i++) {
				global.list.remove(global.itemsToRemoveFromList[i]);
			}
		},
		{
			onCycle: prepareListRemove,
		},
	)
	.add(
		"Array#splice()",
		() => {
			for (let i = 0; i < global.itemsToRemoveFromArray.length; i++) {
				array.splice(global.itemsToRemoveFromArray[i], 1);
			}
		},
		{
			onCycle: prepareArrayRemove,
		},
	)
	.on("cycle", (event) => {
		console.log(String(event.target));
	})
	.on("error", (event) => {
		console.log(event);
	})
	.on("complete", function () {
		console.log(`Fastest is ${this.filter("fastest").map("name")}`);
	})
	.run();

function spawnItems(count, factory) {
	const items = [];
	for (let i = 0; i < count; i++) {
		items.push(factory(i));
	}
	return items;
}

function fillList(list) {
	return items.map((item) => list.push(item));
}

function prepareListRemove() {
	list = new LinkedList();
	const links = fillList(list);
	global.itemsToRemoveFromList = pickItemsToRemove(list.length, removeCount);
	itemsToRemoveFromList = itemsToRemoveFromList.map((index) => links[index]);
}

function prepareArrayRemove() {
	array = [];
	fillList(array);
	global.itemsToRemoveFromArray = pickItemsToRemove(array.length, removeCount);
}

function pickItemsToRemove(length, removeCount) {
	const itemIndexes = [];
	for (let i = 0; i < removeCount; i++) {
		const index = (Math.random() * length--) | 0;
		itemIndexes.push(index);
	}
	return itemIndexes;
}
