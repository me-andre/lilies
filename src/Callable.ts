import type LoopControl from "./LoopControl.js";

export interface Callable<Context, Element> {
	call(context: Context, element: Element, index: number, loopControl: LoopControl): void;
}
