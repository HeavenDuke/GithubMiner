/**
 * Created by heavenduke on 17-5-19.
 */

var process = require('child_process');

module.exports = function (config) {
    return function () {
        var date = new Date();
        date.setMinutes(0, 0, 0);
        date = new Date(date - 12 * 60 * 60 * 1000);
        process.exec('cd ../miner && python run.py'
            + ' ' + config.database.queryString
            + ' ' + config.database.username
            + ' ' + config.database.password
            + ' ' + date.format('yyyy')
            + ' ' + date.format('MM')
            + ' ' + date.format('dd')
            + ' ' + date.format('hh')
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