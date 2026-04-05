import Benchmark from "benchmark";
import LinkedList from "./dist/LinkedList.js";

const items = spawnItems(100000, (i) => ({
	number: Math.random() * i,
}));

prepareList();

global.Summarizer = class Summarizer {
	sum = 0;

	call(_context, el) {
		this.sum += el.number;
	}
};

new Benchmark.Suite()
	.add("LinkedList#forEach(Visitor)", () => {
		const summarizer = new Summarizer();
		list.forEach(summarizer);
	})
	.add("LinkedList#forEach(function)", () => {
		let _sum = 0;
		list.forEach((el) => {
			_sum += el.number;
		});
	})
	.add("LinkedList#[Symbol.iterator]", () => {
		let _sum = 0;
		for (const el of list) {
			_sum += el.number;
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

function prepareList() {
	global.list = new LinkedList();
	const links = fillList(global.list);
	global.itemsToRemoveFromList = [];
	let size = items.length;
	for (let i = 0; i < global.removeCount; i++) {
		const index = (Math.random() * size--) | 0;
		global.itemsToRemoveFromList.push(links[index]);
	}
}
