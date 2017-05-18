/**
 * Created by heavenduke on 17-4-28.
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var database1 = {
    models: {}
}, database2 = {
    models: {}
}, flagdatabase = {
    models: {}
};

var ItemCF = require('./itemcf');
var CurrentDB = require('./current_db');

mongoose.Promise = global.Promise;

var ItemCFSchema = new Schema(ItemCF.Schema, {collection: "itemcf0"});

database1.itemcf = mongoose.model('itemcf0', ItemCFSchema);

ItemCFSchema = new Schema(ItemCF.Schema, {collection: "itemcf1"});

database2.itemcf = mongoose.model('itemcf1', ItemCFSchema);

var CurrentDBSchema = new Schema(CurrentDB.Schema, {collection: "current_db"});

flagdatabase.current_db = mongoose.model('current_db', CurrentDBSchema);

module.exports = {
    loader1: database1,
    loader2: database2,
    flagdatabase: flagdatabase
};
