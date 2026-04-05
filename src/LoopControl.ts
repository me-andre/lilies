interface LoopControlConstructor {
	new (): LoopControlType;
}

export interface LoopControlType {
	broken: boolean;
	break(): void;
}

function LoopControl(this: LoopControlType) {
	this.broken = false;
}

LoopControl.prototype.break = function (this: LoopControlType) {
	this.broken = true;
};

export default LoopControl as unknown as LoopControlConstructor;
