module.exports.create = function () {
    var value = undefined;
    return {
        get:function () {
            return value;
        },
        set:function (new_value) {
            value = new_value;
        }
    }
}