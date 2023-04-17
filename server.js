require('dotenv').config()
const express = require('express');
const cors = require('cors');
const { App } = require('@slack/bolt');
const { battleCommand } = require('./blocks/battleCommand');
const db = require('./db')();

(async () => {
  const pg = await db.start();

  const slackApp = new App({
    token: process.env.SLACK_BOT_TOKEN,
    signingSecret: process.env.SLACK_SIGNING_SECRET,
    socketMode: true, // add this
    appToken: process.env.SLACK_APP_TOKEN, // add this
    port: process.env.SLACK_PORT || 3001,
  });

  const COLORS = {
    green: 'rgb(75, 192, 192)',
    red: 'rgb(255, 99, 132)',
    yellow: 'rgb(255, 205, 86)',
    blue: 'rgb(54, 162, 235)',
  }

  const TEAMS = {
    SMILING_DOG: {
      name: 'Smiling Dog',
      emoji: ':smiling-dog:',
      style: 'primary',
      members: { captain: { id: 'U596QGDRN', emoji: ':betis-head:' }, padawan: { id: 'U039R686A7Q', emoji: ':andrea_calvo:' } },
      color: COLORS.green,
    },
    DEBUGGING_DEMONS: {
      name: 'Debugging Demons',
      emoji: ':imp:',
      style: 'danger',
      members: { captain: { id: 'UKQ93Q8F5', emoji: ':ulises_hype:' }, padawan: { id: 'U02NV03PE58', emoji: ':edu_head:' } },
      color: COLORS.red,
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
      if (body.actions) {
        const userId = body.user.id;
        const value = JSON.parse(action.value);
        const { teamId } = value;

        await pg.formattedQuery('insert_vote', { userId, teamId });
        console.log(JSON.stringify(body))
        await respond(`<@${userId}>, you have just voted for ${teamId}`);
      }
    } catch (error) {
      console.error(error);
    }
  })

  slackApp.start();

  const app = express();

  app.use(cors());
  app.use(express.static('public'));
  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());
  app.get('/', (req, res) => {
    return res.send(`${EVENT_NAME} API`);
  });

  app.get('/scores', async (req, res) => {
    // const { rows } = await pg.formattedQuery('get_scores');
    const { rows } = await pg.formattedQuery('get_last_vote_scores');
    console.log(rows)
    const result = rows.reduce((acc, row) => console.log(row.votedfor) || ({ ...acc, labels: [...acc.labels, row.votedfor], data: [...acc.data, row.votes], colors: [...acc.colors, TEAMS[row.votedfor].color]}), { labels: [], data: [], colors: [] });
    res.json(result);
  });

  app.post('/dracarys', async (req, res) => {
    await pg.query('truncate_vote');
    console.warn(`Dracarys executed!!`)
    res.json({ message: 'Dracarys executed!!' });
  });

  app.listen(process.env.API_PORT, () => console.log(`API listening on port ${process.env.API_PORT}`));


})();
