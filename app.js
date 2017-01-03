var Twitter = require('twitter');
_ = require('lodash');

// For @RealDonaldTrump
const TWITTER_ID = parseInt(process.env.TWITTER_NUM_ID);

const isStandardTweet = _.conforms({
  id_str: _.isString,
  text: _.isString,
});

function isTrumpTweet(event) {
  return event.user.id == TWITTER_ID;
}

var client = new Twitter({
  consumer_key: process.env.TWITTER_CONSUMER_KEY,
  consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
  access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
  access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
});

var stream = client.stream('statuses/filter', {follow: TWITTER_ID});
stream.on('data', function(event) {
  if(isStandardTweet(event) && isTrumpTweet(event)) {
    console.log(event.text);
  }
});

stream.on('error', function(error) {
  throw error;
});

const TWEET_TEMPLATE = "@RealDonaldTrump Hey all, this might be a better way to discuss our differences on this tweet: https://pol.is/{} Beep-boop. I'm a bot."

String.prototype.format = function () {
  var i = 0, args = arguments;
  return this.replace(/{}/g, function () {
    return typeof args[i] != 'undefined' ? args[i++] : '';
  });
}

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
