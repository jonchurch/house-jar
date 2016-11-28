
const Botkit = require('botkit')

var controller = Botkit.slackbot({
  json_file_store: './db_slackbutton_slashcommand/',
}).configureSlackApp({
    clientId: process.env.clientId,
    clientSecret: process.env.clientSecret,
    scopes: ['commands'],
  });

  controller.setupWebserver(process.env.PORT || 3000,function(err,webserver) {

  controller.createWebhookEndpoints(controller.webserver);

  controller.createOauthEndpoints(controller.webserver,function(err,req,res) {
    if (err) {
      res.status(500).send('ERROR: ' + err);
    } else {
      res.send('Success!');
    }
  });
});

let jarTotal = 0

controller.on('slash_command', function (bot, message) {
  // Validate Slack verify token
  if (message.token !== process.env.verifyToken) {
    return bot.res.send(401, 'Unauthorized')
  }

  switch (message.command) {
    case '/jar':
    const help = '/jar 5 in - adds 5 dollars to jar\n/jar 5 out - subtracts 5 dollars from jar \n/jar set 25 - sets jar total to 25 dollars'
      const arr = message.text.replace(/\$/g,'').trim().split(' ');
      if (!isNaN(+arr[0])) {
        if (arr[1] === 'in') {
          jarTotal += +arr[0]
          bot.replyPrivate(message, 'Success! Put ' + arr[0] + ' ' + arr[1] + ' the jar\nThe jar now has $' + jarTotal)
        } else if (arr[1] === 'out') {
          jarTotal -= +arr[0]
          bot.replyPrivate(message, 'Success! Took ' + arr[0] + ' ' + arr[1] + ' of the jar\nThe jar now has $' + jarTotal)
        }
      } else if (arr[0] === 'set') {
        if (!isNaN(+arr[1])) {
          jarTotal = +arr[1]
          bot.replyPrivate(message, 'Success! Jar total set to $' + arr[1])
        }
        else {
          bot.replyPrivate(message, help)
        }
      }
      break
    default:
      bot.replyPrivate(message, "Sorry, I'm not sure what that command is")
  }
})
