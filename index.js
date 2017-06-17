"use strict";
var request = require('request');
var dbConfig = require('./dbConfig.js');
var mongoose = require('mongoose');
var Article = require('./Article.js')
var cheerio = require('cheerio')

mongoose.connect(dbConfig.url);


function saveArticle(article_url) {
    return new Promise(function(resolve, reject) {
        request("https://en.wikipedia.org" + article_url, function(error, response, body) {
            if (error)
                reject(error);
            let $ = cheerio.load(body);
            let title = $("title").text();
            let newArticle = new Article();
            newArticle.title = title.substring(0, title.length - 12);
            newArticle.url = response.request.uri.href;
            newArticle.length = body.length;
            newArticle.timestamp_inserted = Date.now();
            newArticle.save(function(err) {
                if (!err)
                    resolve(newArticle);
            });
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
            let next_page;
            $('.mw-allpages-chunk').find('li > a').each(function(index, element) {
                let url = $(this).attr('href')
                articles.push(saveArticle(url));
            });
            $('.mw-allpages-nav').find('a').each(function(index, element) {
                let url = $(this);
                if (url.text().indexOf("Next page") != -1) {
                    next_page = url.attr('href');
                    console.log(next_page);
                }
            });
            resolve({ "articles": articles, "next_page": next_page });
        });
    });

}

/*
function getLatestTitle() {
    return new Promise(function(resolve, reject) {
        Article.findOne({}).sort({ "timestamp": -1 }).exec(function(err, article) {
            if (err) reject(err);
            resolve(article);
        });
    });
}*/


function run(page_url) {

    getArticlesFromPage(page_url).then(function(articlesObject) {
        articlesObject["articles"].reduce((p, f) => p.then(f), Promise.resolve().then(function() {
            run("https://en.wikipedia.org" + articlesObject["next_page"]);
        }));
    });
}

run("https://en.wikipedia.org/wiki/Special:AllPages?from=&to=&namespace=0");
