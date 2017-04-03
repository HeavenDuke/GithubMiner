/**
 * Created by heavenduke on 17-4-2.
 */

module.exports = function (sequelize, DataTypes) {
    return sequelize.define('user', {
        userId: {
            type: DataTypes.STRING(15),
            allowNull: false,
            primaryKey: true
        },
        login: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        avatar: {
            type: DataTypes.BLOB,
            allowNull: false,
            validate: {
                isUrl: true
            }
        },
        name: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        company: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        blog: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        location: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        email: {
            type: DataTypes.STRING(255),
            allowNull: true,
            // validate: {
            //     isEmail: true
            // }
        },
        followers_count: {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 0
        },
        followees_count: {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 0
        },
        starred_count: {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 0
        }
    })
};