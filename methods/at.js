export function at(index) {
    if (index < 0 || index > this.length - 1) {
        throw new RangeError('index out of bounds');
    }
    var iterator = new AtIterator(index, this.length);
    return index <= iterator.middle ? this.each(iterator) : this.eachRight(iterator);
}

function AtIterator(index, length) {
    this.index = index;
    this.middle = length / 2 | 0;
}

AtIterator.prototype.call = function(context, element, index, iteration) {
    if (index === this.index) {
        iteration.stop(element);
    } else if (this.index === this.middle) {
        iteration.stop();
    }
};
