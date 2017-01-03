var express = require('express');
var Twitter = require('twitter');
_ = require('lodash');

var app = express();

// For @RealDonaldTrump
const TRUMP_ID=25073877;
const TWITTER_ID = parseInt(process.env.TWITTER_NUM_ID) || TRUMP_ID;

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
    var newTweet = {
      status: generateTweet(event.user.screen_name, makeFakeId()),
      in_reply_to_status_id: event.id_str,
    };
    client.post('statuses/update', newTweet, function(error, tweet, response) {
      if(error) throw error;
      console.log('Successfully tweeted: ' + tweet.text);
    });
  }
});

stream.on('error', function(error) {
  throw error;
});

const TWEET_TEMPLATE = "@{} Hey all, this might be a better way to discuss our differences on this tweet: https://pol.is/{} Beep-boop. I'm a bot.";

String.prototype.format = function () {
  var i = 0, args = arguments;
  return this.replace(/{}/g, function () {
    return typeof args[i] != 'undefined' ? args[i++] : '';
  });
};

function generateTweet(twitterHandle, polisConversationId) {
  return TWEET_TEMPLATE.format(twitterHandle, polisConversationId);
}

function makeFakeId() {
  var text = '';
  var possible = 'abcdefghijklmnopqrstuvwxyz0123456789';

  for ( var i=0; i<10; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }

  return text;
}

app.get('/', function(req, res) {
  res.send('trump-twitter-bot');
});

var port = process.env.PORT || 3000;
app.listen(port, function() {
  console.log('App listening on port ' + port);
});
