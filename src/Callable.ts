import type { LoopControlType } from "./LoopControl.js";

export type Callable<Context, Element> =
	| {
			call(
				context: Context,
				element: Element,
				index: number,
				loopControl: LoopControlType<Element>,
			): void;
	  }
	| ((
			this: Context,
			element: Element,
			index: number,
			loopControl: LoopControlType<Element>,
	  ) => void);
