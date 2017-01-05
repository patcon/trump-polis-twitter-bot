var express = require('express');
var fs      = require('fs');
var Swagger = require('swagger-client');
var Twitter = require('twitter');

_ = require('lodash');

var app = express();

// For @RealDonaldTrump
const TRUMP_ID='25073877';
const TWITTER_ID = process.env.TWITTER_NUM_ID || TRUMP_ID;
const POLIS_API_KEY = process.env.POLIS_API_KEY;

if (!POLIS_API_KEY) {
  throw 'ApiKeyMissingError';
}

const isStandardTweet = _.conforms({
  id_str: _.isString,
  text: _.isString,
});

function isTrumpTweet(event) {
  return event.user.id_str == TWITTER_ID;
}

var twitClient = new Twitter({
  consumer_key: process.env.TWITTER_CONSUMER_KEY,
  consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
  access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
  access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
});

var polisClient = new Swagger({
  url: 'https://patcon.github.io/polis-api-spec/swagger.json',
  success: function() {},
  authorizations: {
    api_key: new Swagger.ApiKeyAuthorization('Authorization', POLIS_API_KEY, 'header'),
  },
});

function polisDescription(callback) {
  return fs.readFileSync('description.md', 'utf8');
}

var stream = twitClient.stream('statuses/filter', {follow: TWITTER_ID});
stream.on('data', function(event) {
  if(isStandardTweet(event) && isTrumpTweet(event)) {
    var newPolisConvo = {
      topic: '"{}"'.format(event.text),
      description: polisDescription(),
    };
    polisClient.Conversations.createConversation(newPolisConvo, function(success) {
      var seedComments = require('./seedComments');
      seedComments.forEach(function (commentText) {
        var newComment = {
          conversation_id: success.obj.conversation_id,
          comment: {
            is_seed: true,
            txt: commentText
          }
        };
        polisClient.Conversations.createComment(newComment);
      });

      var newTweet = {
        status: generateTweet(event.user.screen_name, success.obj.conversation_id),
        in_reply_to_status_id: event.id_str,
      };
      twitClient.post('statuses/update', newTweet, function(error, tweet, response) {
        if(error) throw error;
        console.log('Successfully tweeted: ' + tweet.text);
      });
    }, function(error) {
      throw 'Oops!  failed with message: ' + error.statusText;
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
