/**
 * Created by heavenduke on 17-4-2.
 */

module.exports = function (sequelize, DataTypes) {
    return sequelize.define('repository', {
        repositoryId: {
            type: DataTypes.STRING(15),
            allowNull: false,
            primaryKey: true
        },
        name: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        owner: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        description: {
            type: DataTypes.BLOB,
            allowNull: true
        },
        stargazers_count: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        },
        watchers_count: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        },
        forks_count: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        },
        open_issues_count: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        }
    })
};