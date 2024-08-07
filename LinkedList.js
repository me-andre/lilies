import Iteration from './Iteration.js';
import { at } from './methods/at.js';

function LinkedList() {
    this.first = this.last = null;
    this.length = 0;
}

LinkedList.prototype.push = function(item) {
    item = new LinkedListItem(item);
    if (this.last) {
        this.last.next = item;
        item.prev = this.last;
    } else {
        this.first = item;
        this.last = item;
    }
    this.last = item;
    this.length++;
    return item;
};

LinkedList.prototype.unshift = function(item) {
    item = new LinkedListItem(item);
    if (this.first) {
        this.first.prev = item;
        item.next = this.first;
    } else {
        this.first = item;
        this.last = item;
    }
    this.first = item;
    this.length++;
    return item;
};

LinkedList.prototype.remove = function(item) {
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

LinkedList.prototype.each = function(iterator, context) {
    var iteration = new Iteration();
    var item = this.first;
    var index = 0;
    while (item && !iteration.broken) {
        iterator.call(context, item.value, index++, iteration);
        item = item.next;
    }
    return iteration.result;
};

LinkedList.prototype.eachRight = function(iterator, context) {
    var iteration = new Iteration();
    var item = this.last;
    var index = this.length - 1;
    while (item && !iteration.broken) {
        iterator.call(context, item.value, index--, iteration);
        item = item.prev;
    }
    return iteration.result;
};

LinkedList.prototype.at = at;

function LinkedListItem(value) {
    this.prev = this.next = null;
    this.value = value;
}

export default LinkedList;
