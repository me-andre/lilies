interface LoopControlConstructor {
	new <Result>(): LoopControlType<Result>;
}

export interface LoopControlType<Result> {
	broken: boolean;
	result?: Result;
	stop(result?: Result): void;
}

function LoopControl<Result>(this: LoopControlType<Result>) {
	this.broken = false;
	this.result = void 0;
}

LoopControl.prototype.stop = function <Result>(
	this: LoopControlType<Result>,
	result: Result,
) {
	this.broken = true;
	this.result = result;
};

export default LoopControl as unknown as LoopControlConstructor;
