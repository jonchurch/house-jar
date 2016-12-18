require('dotenv').config()


const Botkit = require('botkit')

var controller = Botkit.slackbot({
  interactive_replies: true,
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

      var outgoing = {
        text: 'Hello!',
        attachments: [
            {
                title: 'Do you want to proceed?',
                callback_id: '123',
                attachment_type: 'default',
                actions: [
                    {
                        "name":"yes",
                        "text": "Yes",
                        "value": "yes",
                        "type": "button",
                    },
                    {
                        "name":"no",
                        "text": "No",
                        "value": "no",
                        "type": "button",
                    }
                ]
            }
        ]
      }

      bot.replyPrivate(message, outgoing);
      break



    case '/oldjar':
      const help = '/jar 5 in - adds 5 dollars to jar\n/jar 5 out - subtracts 5 dollars from jar \n/jar set 25 - sets jar total to 25 dollars'
      const arr = message.text.replace(/\+/g,'').trim().split(' ');
      if (arr.length < 2 && !isNaN(+arr[0]) && arr[0] !== '') {
        const successText = (+arr[0] >= 0) ? 'Put $' + arr[0] + ' in the jar' : 'Took $' + arr[0].replace(/\-/g,'') + ' out of the jar'
        jarTotal += parseInt(arr[0])
        bot.replyPrivate(message, 'Success! ' + successText + '\nThe jar now has $' + jarTotal)

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
