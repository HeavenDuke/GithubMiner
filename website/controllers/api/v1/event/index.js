/**
 * Created by heavenduke on 17-4-28.
 */

exports.index = function (req, res, next) {
    var query;
    var offset = isNaN(parseInt(req.query.offset)) ? 0 : parseInt(req.query.offset);
    var pagination = 30;
    if (!req.session.user) {
        query = "MATCH (u:User)-[s:Star]->(r:Repository) "
              + "RETURN u.login as login, s.created_at as created_at, r.repository_id as repository_id, r.full_name as full_name "
              + "ORDER BY created_at DESC SKIP " + offset + " LIMIT " + pagination;
    }
    else {
        query = "MATCH (user:User {user_id: " + req.session.user.user_id + "})-[:Follow]->(u:User)-[s:Star]->(r:Repository) "
              + "RETURN u.login as login, s.created_at as created_at, r.repository_id as repository_id, r.full_name as full_name "
              + "ORDER BY created_at DESC SKIP " + offset + " LIMIT " + pagination;
    }
    global.db.cypherQuery(query, function (err, result) {
        if (err) {
            console.log(err);
            return res.json({
                message: "success",
                events: []
            });
        }
        for(var i = 0; i < result.data.length; i++) {
            result.data[i] = {
                login: result.data[i][0],
                repository_id: result.data[i][2],
                full_name: result.data[i][3],
                created_at: new Date(result.data[i][1] * 1000).format("yyyy-MM-dd hh:mm:ss")
            };
        }
        res.json({
            message: "success",
            events: result.data
        });
    });
};