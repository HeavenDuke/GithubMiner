/**
 * Created by heavenduke on 17-5-17.
 */

var CronJob = require('cron').CronJob;
var jobs = require('./jobs');

new CronJob(" * * * * *", function () {
    jobs.RefreshRepositoryUpdateStatusJob();
}, function () {
    jobs.UpdateNewRepositoryRankingJob();
});