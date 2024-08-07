function Iteration() {
    this.broken = false;
    this.result = void 0;
}

Iteration.prototype.stop = function(result) {
    this.broken = true;
    this.result = result;
};

export default Iteration;
