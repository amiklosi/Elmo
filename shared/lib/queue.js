module.exports.Queue = function Queue() {
    var queue = [];

    var callNext = function() {
        var func = queue.pop()
        func();
    }

    this.enqueue = function(func) {
        queue.unshift(func);
    }
    this.next = function() {
        if (queue.length > 0) {
            callNext();
        }
    }

}