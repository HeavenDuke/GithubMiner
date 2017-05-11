/**
 * Created by heavenduke on 17-5-10.
 */

module.exports = function (query, options) {
    var result = query ? query : "";
    for(var key in options) {
        if (options[key]) {
            result += " " + key + ":" + options[key]
        }
    }
    return result;
};