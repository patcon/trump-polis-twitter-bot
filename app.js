var Twitter = require('twitter');

const TWEET_TEMPLATE = "@RealDonaldTrump Hey all, this might be a better way to discuss our differences on this tweet: https://pol.is/{} Beep-boop. I'm a bot."

String.prototype.format = function () {
  var i = 0, args = arguments;
  return this.replace(/{}/g, function () {
    return typeof args[i] != 'undefined' ? args[i++] : '';
  });
};

function generateTweet(conversationId) {
  return TWEET_TEMPLATE.format(conversationId);
}

function makeFakeId() {
  var text = '';
  var possible = 'abcdefghijklmnopqrstuvwxyz0123456789';

  for ( var i=0; i<10; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }

  return text;
}

console.log(generateTweet(makeFakeId()));
