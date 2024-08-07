import _ from 'lodash';
import { expect } from 'chai';
import LinkedList from '../LinkedList.js';

describe('LinkedList', function() {
    var items = spawnItems(10000, function(i) {
        return {
            number: Math.random() * i
        };
    });

    function fillList(list) {
        return items.map(function(item) {
            return list.push(item)
        });
    }

    it('can be filled in', function() {
        expect(function() {
            fillList(new LinkedList());
        }).not.to.throw(Error);
    });

    it('will contain all the items', function() {
        var members = [];
        var list = new LinkedList();
        fillList(list);
        list.each(function(member) {
            members.push(member);
        });
        expect(members).to.have.length(items.length);
    });

    it('will hold proper values', function() {
        var members = [];
        var list = new LinkedList();
        fillList(list);
        list.each(function(member) {
            members.push(member);
        });
        expect(members).to.be.eql(items);
    });

    describe('LinkedList#push()', function() {

        it('adds an item to the tail', function() {
            var list = new LinkedList();
            fillList(list);
            var item = {number: 1};
            list.push(item);
            var members = getMembers(list);
            expect(_.last(members)).to.be.equal(item);
        });

        it('keeps the .length up-to-date', function() {
            var list = new LinkedList();
            fillList(list);
            var item = {number: 1};
            list.push(item);
            expect(list).to.have.length(items.length + 1);
        });

    });

    describe('LinkedList#unshift()', function() {

        it('adds an item to the head', function() {
            var list = new LinkedList();
            fillList(list);
            var item = {number: 1};
            list.unshift(item);
            expect(getMembers(list)[0]).to.be.equal(item);
        });

        it('preserves integrity', function() {
            var list = new LinkedList();
            fillList(list);
            var item = {number: 1};
            list.unshift(item);
            expect(getMembers(list)).to.have.length(items.length + 1);
        });

        it('keeps the .length up-to-date', function() {
            var list = new LinkedList();
            fillList(list);
            var item = {number: 1};
            list.unshift(item);
            expect(list).to.have.length(items.length + 1);
        });

    });

    describe('LinkedList#remove()', function() {

        describe('removing a random item from the middle', function() {
            var index = randomIndex(items.length);
            shouldRemoveAt(index);
        });

        describe('removing the 1st item', function() {
            shouldRemoveAt(0);
        });

        describe('removing the 1st item', function() {
            shouldRemoveAt(items.length - 1);
        });

        function shouldRemoveAt(index) {
            var list = new LinkedList();
            var links = fillList(list);
            list.remove(links[index]);
            var members = getMembers(list);

            it('preserves integrity', function() {
                expect(members.length).to.be.eql(items.length - 1);
            });

            it('removes the given item', function() {
                expect(_.difference(items, members)).to.be.eql([links[index].value]);
            });

            it('keeps the .length up-to-date', function() {
                expect(list).to.have.length(items.length - 1);
            });
        }

    });

    describe('LinkedList#at()', function() {

        it('finds an element by index', function() {
            var list = new LinkedList();
            fillList(list);
            var index = randomIndex(items.length);
            expect(list.at(index)).to.be.equal(items[index]);
        });

        it('throws an error if the index is > length', function() {
            var list = new LinkedList();
            fillList(list);
            var index = items.length;
            expect(function() {
                list.at(index);
            }).to.throw(RangeError);
        });

        it('throws an error if the index is negative', function() {
            var list = new LinkedList();
            fillList(list);
            expect(function() {
                list.at(-1);
            }).to.throw(RangeError);
        });

        it('walks from the right if the index is above the middle', function() {
            var list = new LinkedList();
            fillList(list);
            list.eachRight = function() {
                throw 'i was called';
            };
            expect(function() {
                list.at(items.length / 2 + 1);
            }).to.throw('i was called');
        });

        it('succeeds if the index is above the middle', function() {
            var list = new LinkedList();
            fillList(list);
            var index = items.length / 2 + 1;
            expect(list.at(index)).to.be.equal(items[index]);
        });

        it('works ok if the list is empty', function() {
            var list = new LinkedList();
            expect(function() {
                list.at(0);
            }).to.throw(RangeError);
            expect(function() {
                list.at(-1);
            }).to.throw(RangeError);
        });

    });

});

function spawnItems(count, factory) {
    var items = [];
    for (var i = 0; i < count; i++) {
        items.push(factory(i));
    }
    return items;
}

function getMembers(list) {
    var members = [];
    list.each(function(member) {
        members.push(member);
    });
    return members;
}

function randomIndex(length) {
    return length / 4 + Math.random() * length / 2 | 0;
}
