module.exports = function loop(promise, fn) {
    return promise.then(fn).then(function(wrapper) {
        return !wrapper.done ? loop(Promise.resolve(wrapper.value), fn): wrapper.value;
    });
}