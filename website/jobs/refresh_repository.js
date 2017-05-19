/**
 * Created by heavenduke on 17-5-15.
 */

var Neo4j = require('node-neo4j');

module.exports = function (config) {
    return function () {
        var db = new Neo4j(config.database.queryString);
        db.cypherQuery("MATCH (r:Repository) SET r.updated=false", function (err, result) {
            if (err) {
                console.log(err);
            }
        });
    };
};