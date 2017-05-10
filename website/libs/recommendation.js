/**
 * Created by heavenduke on 17-5-10.
 */


exports.social = function (repository, offset, limit, callback) {
    var query = "MATCH (:Repository {repository_id: '" + repository.repository_id + "'})<-[]-(u:User)-[]->(r:Repository) "
              + "WHERE r.repository_id<>'" + repository.repository_id + "' "
              + "RETURN r.repository_id as repository_id, r.name as name, r.description as description,count(*) AS score ORDER BY score DESC "
              + "SKIP " + offset + " LIMIT " + limit;
    global.db.cypherQuery(query, function (err, result) {
        if (err) {
            return callback(err);
        }
        else {
            for(var i = 0; i < result.data.length; i++) {
                result.data[i] = {
                    repository_id: result.data[i][0],
                    name: result.data[i][1],
                    description: result.data[i][2]
                };
            }
            return callback(null, result.data);
        }
    });
};