/**
 * Created by heavenduke on 17-5-19.
 */

var process = require('child_process');

module.exports = function (config) {

    return function () {
        var date = new Date();
        console.log(date);
        process.exec('cd ../miner && python update.py'
            + ' ' + config.database.queryString
            + ' ' + config.database.username
            + ' ' + config.database.password
            , function (err, stdout, stderr) {
                if (err) {
                    console.log(err);
                }
                else {
                    console.log(stdout);
                }
            });
    };
};