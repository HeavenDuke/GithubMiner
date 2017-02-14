/**
 * Created by heavenduke on 17-2-14.
 */

/**
 *
 * @param len
 * @constructor
 */
var RepoList = function (len) {
    this.list = [];
    this.requiedLength = len;
    this.isRequiredLengthMet = function () {
        return this.list.length >= this.requiedLength;
    }
};

module.exports = RepoList;