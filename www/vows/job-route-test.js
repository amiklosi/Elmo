
var vows = require('vows');
var Browser = require("zombie");
var assert = require("assert");

require("../app.js");

vows.describe('The index route').addBatch({
    'when we visit /':{
        topic:function () {
            Browser.visit("http://localhost:8080/", this.callback);
        },
        'we see the homepage':function (browser) {
            assert.ok(browser);
            assert.equal(browser.text("div.hero-unit h1"), "Elmo is good for what ails you")
        }
    }
}).export(module);


