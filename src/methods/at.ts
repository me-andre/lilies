import type LinkedList from "../LinkedList.js";
import type { LoopControl } from "../LoopControl.js";

/**
 * Closely matches https://tc39.es/ecma262/#sec-array.prototype.at
 */
export function at<Value>(this: LinkedList<Value>, index: number): Value | undefined {
	const length = this.length;
	const relativeIndex = Math.trunc(index) || 0;
	const resolvedIndex = relativeIndex >= 0 ? relativeIndex : length + relativeIndex;
	if (resolvedIndex < 0 || resolvedIndex >= length) {
		return undefined;
	}
	const middle = (length / 2) | 0;
	const visitor = new AtVisitor<Value>(resolvedIndex);
	if (resolvedIndex <= middle) {
		this.forEach(visitor);
	} else {
		this.forEachRight(visitor);
	}
	return visitor.result;
}

class AtVisitor<Value> {
	readonly index: number;
	result: Value | undefined = undefined;

	constructor(index: number) {
		this.index = index;
	}

	call(_context: LinkedList<Value>, element: Value, index: number, loopControl: LoopControl) {
		if (index === this.index) {
			this.result = element;
			loopControl.break();
		}
	}
}
