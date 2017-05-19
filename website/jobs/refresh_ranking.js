/**
 * Created by heavenduke on 17-5-19.
 */

var process = require('child_process');

module.exports = function (config) {

    return function () {
        var date = new Date();
        console.log(date);
        process.exec('cd ../miner && python rank.py'
            + ' ' + config.database.queryString
            + ' ' + config.database.username
            + ' ' + config.database.password
            + ' ' + date.format('yyyy')
            + ' ' + date.format('MM')
            + ' ' + date.format('dd')
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