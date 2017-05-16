/**
 * Created by heavenduke on 17-5-16.
 */

var Master = function (accounts) {
    this.workers = accounts;
    if (accounts.length == 0) {
        throw new Error("At least provide one worker!");
    }
};

Master.prototype.get_worker = function (callback) {
    var remains = [], that = this, cnt = 0;
    function temp(i) {
        that.workers[i].misc.getRateLimit({}).then(function (result) {
            remains[i] = result.data.rate.remaining;
            cnt++;
            if (cnt == that.workers.length) {
                var max = 0, index = 0;
                for(var j = 0; j < that.workers.length; j++) {
                    if (remains[j] > max) {
                        max = remains[j];
                        index = j;
                    }
                }
                callback(that.workers[index]);
            }
        });
    }
    for(var i = 0; i < this.workers.length; i++) {
        temp(i);
    }
};

module.exports = Master;