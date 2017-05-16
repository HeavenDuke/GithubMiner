/**
 * Created by heavenduke on 17-5-16.
 */

module.exports = function (protocol, host, path) {
    return protocol + "://" + host + path;
};