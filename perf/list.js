import Benchmark from 'benchmark';
import LinkedList from '../LinkedList.js';

function Contained() {
    this.number = Math.random();
}

Contained.prototype.method = function() {
    return this.number;
};

var items = spawnItems(100000, function(i) {
    return {
        number: Math.random() * i
    };
});

global.list = new LinkedList();
global.array = [];

new Benchmark.Suite()
    .add('LinkedList#push()', function() {
        fillList(list);
    })
    .add('Array#push()', function() {
        fillList(array);
    })
    .on('cycle', function(event) {
        console.log(String(event.target));
    })
    .on('error', function(event) {
        console.log(event);
    })
    .on('complete', function() {
        console.log('Fastest is ' + this.filter('fastest').map(({ name }) => name));
    })
    .run();

list = new LinkedList();
array = [];

fillList(list);
fillList(array);

new Benchmark.Suite()
    .add('LinkedList#each()', function() {
        var sum = 0;
        list.each(function(item) {
            sum += item.number;
        });
    })
    .add('Array#forEach()', function() {
        var sum = 0;
        array.forEach(function(item) {
            sum += item.number;
        });
    })
    .on('cycle', function(event) {
        console.log(String(event.target));
    })
    .on('error', function(event) {
        console.log(event);
    })
    .on('complete', function() {
        console.log('Fastest is ' + this.filter('fastest').map('name'));
    })
    .run();

global.randomIndex = function(length) {
    return Math.random() * length | 0;
};

list = new LinkedList();
array = [];

fillList(list);
fillList(array);

new Benchmark.Suite()
    .add('LinkedList#at()', function() {
        var sum = 0;
        for (var i = 0; i < 100; i++) {
            sum += list.at(randomIndex(list.length));
        }
    })
    .add('Array#[]', function() {
        var sum = 0;
        for (var i = 0; i < 100; i++) {
            sum += array[randomIndex(array.length)];
        }
    })
    .on('cycle', function(event) {
        console.log(String(event.target));
    })
    .on('error', function(event) {
        console.log(event);
    })
    .on('complete', function() {
        console.log('Fastest is ' + this.filter('fastest').map('name'));
    })
    .run();

var removeCount = items.length / 2;

prepareListRemove();
prepareArrayRemove();

new Benchmark.Suite()
    .add('LinkedList#remove()', function() {
        for (var i = 0; i < global.itemsToRemoveFromList.length; i++) {
            global.list.remove(global.itemsToRemoveFromList[i]);
        }
    }, {
        onCycle: prepareListRemove
    })
    .add('Array#splice()', function() {
        for (var i = 0; i < global.itemsToRemoveFromArray.length; i++) {
            array.splice(global.itemsToRemoveFromArray[i], 1);
        }
    }, {
        onCycle: prepareArrayRemove
    })
    .on('cycle', function(event) {
        console.log(String(event.target));
    })
    .on('error', function(event) {
        console.log(event);
    })
    .on('complete', function() {
        console.log('Fastest is ' + this.filter('fastest').map('name'));
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
    return items.map(function(item) {
        return list.push(item)
    });
}

function prepareListRemove() {
    list = new LinkedList();
    var links = fillList(list);
    global.itemsToRemoveFromList = pickItemsToRemove(list.length, removeCount);
    itemsToRemoveFromList = itemsToRemoveFromList.map(function(index) {
        return links[index];
    });
}

function prepareArrayRemove() {
    array = [];
    fillList(array);
    global.itemsToRemoveFromArray = pickItemsToRemove(array.length, removeCount);
}

function pickItemsToRemove(length, removeCount) {
    var itemIndexes = [];
    for (var i = 0; i < removeCount; i++) {
        var index = Math.random() * length-- | 0;
        itemIndexes.push(index);
    }
    return itemIndexes;
}
