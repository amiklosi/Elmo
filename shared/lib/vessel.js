var entries = {};

module.exports = {
    put: function(key, value) {
        entries[key] = value;
    },
    dependsOn: function(key) {
        if (entries[key] instanceof Function) {
            return entries[key]()
        }
        return entries[key];
    }
}