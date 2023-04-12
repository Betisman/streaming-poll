require('dotenv').config()
const express = require('express');
const cors = require('cors');
const { App } = require('@slack/bolt');
const { battleCommand } = require('./blocks/battleCommand');
const db = require('./db')();

(async () => {

  console.log(db.toString())
  const pepe = await db.start();
  console.log(pepe)
  
  const app = express();
  
  const slackApp = new App({
    token: process.env.SLACK_BOT_TOKEN,
    signingSecret: process.env.SLACK_SIGNING_SECRET,
    socketMode: true, // add this
    appToken: process.env.SLACK_APP_TOKEN, // add this
    port: process.env.SLACK_PORT || 3001,
  });
  
  const TEAMS = {
    SMILING_DOG: { 
      name: 'Smiling Dog',
      emoji: ':smiling-dog:',
      style: 'primary',
      members: { captain: { id: 'U596QGDRN', emoji: ':betis-head:' }, padawan: { id: 'U039R686A7Q', emoji: ':andrea_calvo:' } },
    },
    DEBUGGING_DEMONS: {
      name: 'Debugging Demons',
      emoji: ':imp:',
      style: 'danger',
      members: { captain: { id: 'UKQ93Q8F5', emoji: ':ulises_hype:' }, padawan: { id: 'U02NV03PE58', emoji: ':edu_head:' } },
    }
  }
  
  const ROUND = 1;
  
  const EVENT_NAME = 'One Battle Beyond';
  
  slackApp.command('/battle', async ({ command, say, ack }) => {
    console.log('battle!!')
    await ack();
    const { user_id: userId, text, channel_id: channelId } = command;
    const blocks = battleCommand({ teams: TEAMS, round: ROUND, eventName: EVENT_NAME, userId });
    const block = {
      channel: channelId,
      user: userId,
      text: EVENT_NAME,
      ...blocks,
    }
    console.log(JSON.stringify(blocks))
    console.log('--------------------------')
    console.log(JSON.stringify(block))
    await slackApp.client.chat.postEphemeral(block);
  });

  slackApp.action({ block_id: 'vote' }, async ({ ack, body, respond }) => {
    await ack();
    console.log('vote!');
    try {
      console.log(JSON.stringify(body))
      const [action] = body?.actions;
      const userId = body.user.id;
      const value = JSON.parse(action.value);
      console.log(value)
      if (body.actions) {
        console.log(JSON.stringify(body))
        await respond(`<@${userId}>, you have just voted for ${value.teamId}`);
      }
    } catch (error) {
      console.error(error);
    }
  })
  
  slackApp.start();
})();


// const BAUMANN_USER = process.env.BAUMANN_USER || 'baumann';
// const LUCAS_USER = process.env.LUCAS_USER || 'lucas';
// const PORT = process.env.PORT || 3000;

// let results = [1, 1];
// app.use(cors());
// app.use(express.static('public'));
// app.use(express.urlencoded({ extended: true }));
// app.use(express.json());
// app.get('/', (req, res) => {
//   return res.send('CSS Battle API');
// });
// app.get('/scores', (req, res) => {
//   res.json(results);
// });

// app.post('/vote', (req, res) => {
//   console.log('--------------------', JSON.stringify(req.body))
//   if (req.body.text.includes(BAUMANN_USER)) {
//     results[0] = results[0] + 1;
//   }
//   if (req.body.text.includes(LUCAS_USER)) {
//     results[1] = results[1] + 1;
//   }
//   return res.send('Tu voto fue registrado');
// });

// app.get('/reset', (req, res) => {
//   results = [1, 1];
//   return res.json({ success: true });
// });

// slackApp.message('hello', ({ message, say }) => {
//   say(`Hello, <@{message.user}>!! It's ${new Date()}`);
// });

// app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
