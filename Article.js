var mongoose = require('mongoose');

var ArticleSchema = new mongoose.Schema({
    url: { type: String, unique: true, index: true },
    raw_title: {type: String},
    title: {type: String},
    length: {type: Number},
    timestamp_inserted: {type: Number}
});

module.exports = mongoose.model('Article', ArticleSchema);