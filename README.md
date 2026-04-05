# 🪷 lilies

A small, dependency-free doubly **li**nked **li**st in **E**CMA**S**cript.
Published as **ESM-only** (`"type": "module"`).

## Installation

```bash
npm install lilies
```

```ts
import LinkedList from "lilies";
```

## Compatibility
⚠️ Remember to keep lilies away from cats 🐈 and cats away from lilies. These flowers are highly toxic to our fluffy friends!

## Rationale

Arrays are the default sequential structure in JavaScript. They are great when you mostly access items by index and let the engine optimize dense storage. They are a worse fit when you need **stable handles to elements** and **O(1) insertion or removal** at a known node, because `splice` and shifting elements get expensive.

This library gives you a classic doubly linked list. Each `push` / `unshift` returns a **`LinkedListNode`** node you can keep. **`remove`** only updates pointers, so repeated inserts and removals in the middle stay predictable where arrays would have to move many elements.

The API is intentionally small: a few list operations, forward and backward traversal with optional early exit, iterators, and indexed access that picks the cheaper direction.

## Common scenarios

- Collections with frequent inserts or middle removals, such as objects in a 3D scene.
- Removal by node without having to keep the index or do a lookup by value when removing.
- Queues that are appended to from both ends or needing pending task cancellation with cheap cleanup.

If you mostly need **random access by index** or **fast bulk iteration** over compact storage, prefer **`Array`** (or **`TypedArray`**). If you mostly need **O(1) structural change** at a known link, use **`LinkedList`**.

## API

### `new LinkedList<Value>()`

Constructs an empty list.

### List structure

- **`first` / `last`** — `LinkedListNode<Value> | null`; **`length`** — number of nodes.
- **`LinkedListNode<Value>`** — `{ value, prev, next }`.

### Mutations

- **`push(item)`** — append; returns the new **`LinkedListNode`**.
- **`unshift(item)`** — prepend; returns the new **`LinkedListNode`**.
- **`remove(node)`** — detach that node (must belong to this list).

### Traversal

- **`forEach(visitor, context?)`** — head to tail.  
- **`forEachRight(visitor, context?)`** — tail to head.

**`visitor`** may be:

1. A **function** invoked as `visitor.call(context, element, index, loopControl)`. If you pass **`context`**, it becomes `this` inside the function.  
2. A **visitor** object with **`call(context, element, index, loopControl)`** — see **Visitors** below.

**`loopControl`** is a **`LoopControl`** for the current pass:

- **`break()`** — end traversal early.

If you need to extract a value from a traversal, use a closure variable or store it on a visitor object.

### Iterators

- **`[Symbol.iterator]()`** — yields values head to tail. Enables `for...of`, spread, and destructuring:

```ts
for (const value of list) { ... }
const arr = [...list];
```

- **`valuesRight()`** — yields values tail to head.
- **`nodes()`** — yields **`LinkedListNode`** references head to tail.
- **`nodesRight()`** — yields **`LinkedListNode`** references tail to head.

⚠️ Keep iterators away from performance-sensitive code, as they are known to be significantly slower than function callbacks (this comes from the overhead of the generator protocol itself rather than this library). For tight loops, see the section about **Visitor**.

### Indexed access

- **`at(index)`** — returns the **`value`** at **`index`**, or **`undefined`** if out of range. Negative indices count back from the end (`-1` is the last element). Walks from the nearer end for efficiency. Follows [**`Array.prototype.at`**](https://tc39.es/ecma262/#sec-array.prototype.at) semantics.


## Performance insights

**Indexed access:** Arrays are usually **orders of magnitude faster**. If your code mostly does "get me item at `i`", **use an array**.

**Scanning the whole collection:** Arrays are usually **a bit faster**, but not by a dramatic amount. **Do not choose this library for scan speed alone.**

**Removing by handle:** `LinkedList` is usually **much faster** when you already have the node you want to remove. **Frequent removals at known positions are the main reason to use this library.**

**Appending:** Usually **close enough that it should not drive the decision**. Choose based on access and removal patterns instead.

**Visitor vs function:** A **visitor object** can be around **2-3x faster** than a closure in tight traversal code. **Only care about this in hot paths or very large lists.**

## Visitors and why they matter here

A **visitor** (in this package) is an object that implements **`call(context, element, index, loopControl)`**. It plays the same role as a callback function, but it is also a natural place to keep traversal state such as sums, counters, flags, or collected values.

**Why use it:**

- **Natural place for state** — Counters, accumulators, and configuration live on the visitor itself. That makes it a good fit for reductions and other stateful passes.
- **Often faster than a closure** — In hot traversal code, using a visitor can be around **2-3x faster** than using a closure with a closure already **~2.5x** faster than an ES Iterator.
- **Can be reused** — If you want, the same visitor instance can be used across multiple traversals (via e.g. a pool), which can be beneficial for extremely performance-sensitive code like a 3D game engine.

Of course plain function callbacks remain fully supported and are usually clearer for one-off traversals. When you are optimizing a very **hot loop**, prefer a **visitor**.

## License

MIT
