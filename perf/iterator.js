import Benchmark from "benchmark";
import LinkedList from "./dist/LinkedList.js";

function Contained() {
	this.number = Math.random();
}

Contained.prototype.method = function () {
	return this.number;
};

var items = spawnItems(100000, function (i) {
	return {
		number: Math.random() * i,
	};
});

prepareList();

global.Summarizer = function () {
	this.sum = 0;
};

Summarizer.prototype.call = function (context, el) {
	this.sum += el.number;
};

new Benchmark.Suite()
	.add("LinkedList#each(Iterator)", function () {
		var summarizer = new Summarizer();
		list.each(summarizer);
	})
	.add("LinkedList#each(function)", function () {
		var sum = 0;
		list.each(function (el) {
			sum += el.number;
		});
	})
	.on("cycle", function (event) {
		console.log(String(event.target));
	})
	.on("error", function (event) {
		console.log(event);
	})
	.on("complete", function () {
		console.log("Fastest is " + this.filter("fastest").map("name"));
	})
	.run();

function spawnItems(count, factory) {
	var items = [];
	for (var i = 0; i < count; i++) {
		items.push(factory(i));
	}
	return items;
}

function fillList(list) {
	return items.map(function (item) {
		return list.push(item);
	});
}

function prepareList() {
	global.list = new LinkedList();
	var links = fillList(global.list);
	global.itemsToRemoveFromList = [];
	var size = items.length;
	for (var i = 0; i < global.removeCount; i++) {
		var index = (Math.random() * size--) | 0;
		global.itemsToRemoveFromList.push(links[index]);
	}
}
