interface IterationConstructor {
    new<Result>(): IterationType<Result>;
}

export interface IterationType<Result> {
    broken: boolean;
    result?: Result;
    stop(result?: Result): void;
}

function Iteration<Result>(this: IterationType<Result>) {
    this.broken = false;
    this.result = void 0;
}

Iteration.prototype.stop = function<Result>(this: IterationType<Result>, result: Result) {
    this.broken = true;
    this.result = result;
};

export default Iteration as unknown as IterationConstructor;
