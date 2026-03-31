# 🪷 lilies

A small, dependency-free **doubly linked list** for JavaScript and TypeScript.
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

This library gives you a classic doubly linked list. Each `push` / `unshift` returns a **`LinkedListItem`** node you can keep. **`remove`** only updates pointers, so repeated inserts and removals in the middle stay predictable where arrays would have to move many elements.

The API is intentionally small: a few list operations, forward and backward traversal with optional early exit, and indexed access that picks the cheaper direction.

## Common scenarios

- Collections with frequent inserts or middle removals, such as objects in a 3D scene.
- Removal by node without having to keep the index or do a lookup by value when removing.
- Queues that are appended to from both ends or needing pending task cancellation with cheap cleanup.

If you mostly need **random access by index** or **fast bulk iteration** over compact storage, prefer **`Array`** (or **`TypedArray`**). If you mostly need **O(1) structural change** at a known link, use **`LinkedList`**.

## API

### `new LinkedList<Item>()`

Constructs an empty list of **`LinkedListType<Item>`**.

### List structure

- **`first` / `last`** — `LinkedListItem<Item> | null`; **`length`** — number of nodes.
- **`LinkedListItem<Item>`** — `{ value, prev, next }`.

### Mutations

- **`push(item)`** — append; returns the new **`LinkedListItem`**.
- **`unshift(item)`** — prepend; returns the new **`LinkedListItem`**.
- **`remove(item)`** — detach that node (must belong to this list).

### Traversal

- **`each(visitor, context?)`** — head to tail.  
- **`eachRight(visitor, context?)`** — tail to head.

**`visitor`** may be:

1. A **function** invoked as `visitor.call(context, element, index, loopControl)`. If you pass **`context`**, it becomes `this` inside the function.  
2. A **visitor** object with **`call(context, element, index, loopControl)`** — see **Visitors** below.

**`loopControl`** is a **`LoopControlType`** for the current pass:

- **`stop(result?)`** — end traversal early; optional **`result`** is returned from **`each` / `eachRight`**.
- **`broken`** / **`result`** — reflect whether the loop stopped and any value passed to **`stop`**.

The traversal methods return the optional **`result`** from **`stop`**, or **`undefined`** if the walk reaches the end.

### Indexed access

- **`at(index)`** — returns the **`value`** at **`index`**. It walks from the nearer end.  
  Throws **`RangeError`** if **`index`** is out of range (including an empty list).

Types for **`LinkedListItem`**, **`LinkedListType`**, and **`LoopControlType`** are shipped in the generated **`.d.ts`** files alongside the implementation.

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
- **Often faster than a closure** — In hot traversal code, using a visitor can be around **2-3x faster** than using a closure.
- **Can be reused** — If you want, the same visitor instance can be used across multiple traversals, which can be beneficial for extremely performance-sensitive code like a 3D game engine.

Of course plain function callbacks remain fully supported and are usually clearer for one-off traversals. When you are optimizing a very **hot loop**, prefer a **visitor**.

## License

MIT
