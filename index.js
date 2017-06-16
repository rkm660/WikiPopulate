var request = require('request');
var dbConfig = require('./dbConfig.js');
var mongoose = require('mongoose');
var Article = require('./Article.js')
var cheerio = require('cheerio')

mongoose.connect(dbConfig.url);


function getArticle(article_url) {
    return new Promise(function(resolve, reject) {
        request("https://en.wikipedia.org" + article_url, function(error, response, body) {
            if (error)
                reject(error);
            let $ = cheerio.load(body);
            let object = {};
            let title = $("title").text();
            object["url"] = response.request.uri.href;
            object["title"] = title.substring(0, title.length - 12);
            object["length"] = body.length;
            object["timestamp_inserted"] = Date.now();
            resolve(object);
        });
    });
}

function getArticlesFromPage(page_url) {
    return new Promise(function(resolve, reject) {
        request(page_url, function(error, response, body) {
            if (error)
                reject(err);
            let $ = cheerio.load(body);
            let articles = [];
            $('.mw-allpages-chunk').find('li > a').each(function(index, element) {
                let url = $(this).attr('href')
                articles.push(getArticle(url));
            });
            resolve(articles);
        });
    });

}

function getLatestTitle() {
    return new Promise(function(resolve, reject) {
        Article.findOne({}).sort({"timestamp": -1}).exec(function(err, article) {
            if (err) reject(err);
            resolve(article);
        });
    });


}

function saveArticle(url) {

}


function run() {

    getArticlesFromPage("https://en.wikipedia.org/wiki/Special:AllPages?from=&to=&namespace=0").then(function(articlePromises) {

        Promise.all(articlePromises)
            .then(function(articles) {
                articles.forEach(function(item) {
                    console.log(item);
                });
            })
            .catch(function(err) {
                // Will catch failure of first failed promise
                console.log("Failed:", err);
            });
    });
}

run();
