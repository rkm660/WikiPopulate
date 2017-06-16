var mongoose = require('mongoose');

var ArticleSchema = new mongoose.Schema({
    title: { type: String, unique: true, index: true },
    url: {type: String},
    length: {type: Number},
    timestamp_inserted: {type: Number}
});

module.exports = mongoose.model('Article', ArticleSchema);