/**
 * Created by heavenduke on 17-4-2.
 */

var Sequelize = require('sequelize');
var models = require('./models');
var path = require('path');

module.exports = function (database, username, password, config) {
    var sequelize = new Sequelize(database, username, password, config);
    var Repository = sequelize.import(path.join(__dirname, 'models/repository'));
    var User = sequelize.import(path.join(__dirname, 'models/user'));
    var Star = sequelize.import(path.join(__dirname, 'models/star'));

    Repository.belongsToMany(User, {through: "star", foreignKey: "repositoryId", otherKey: "userId"});
    User.belongsToMany(Repository, {through: "star", foreignKey: "userId", otherKey: "repositoryId"});

    return sequelize;
};