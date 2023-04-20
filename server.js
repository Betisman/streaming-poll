require('dotenv').config()
const express = require('express');
const cors = require('cors');
const { App } = require('@slack/bolt');
const { battleCommand } = require('./blocks/battleCommand');
const { votedMessage } = require('./blocks/votedMessage');
const { getChart } = require('./chart');
const db = require('./db')();

(async () => {
  const pg = await db.start();

  const EVENT_READABLE_ID = 'one-battle-beyond';
  const POST_MESSAGE_CHANNEL = process.env.POST_MESSAGE_CHANNEL;

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
      emoji: ':dagger:',
      style: 'primary',
      members: { captain: { id: 'U596QGDRN', emoji: ':betis-head:' }, padawan: { id: 'U039R686A7Q', emoji: ':andrea_calvo:' } },
      color: COLORS.green,
    },
    DEBUGGING_DEMONS: {
      name: 'Debugging Demons',
      emoji: ':shield:',
      style: 'danger',
      members: { captain: { id: 'UKQ93Q8F5', emoji: ':ulises_hype:' }, padawan: { id: 'U02NV03PE58', emoji: ':edu_head:' } },
      color: COLORS.red,
    }
  }

  const ROUND = 1;

  const EVENT_NAME = 'One Battle Beyond';

  const getScores = async () => {
    // const { rows } = await pg.formattedQuery('get_scores');
    const { rows } = await pg.formattedQuery('get_last_vote_scores');
    console.log(rows)
    const result = rows.reduce((acc, row) => console.log(row.voted_for) || ({ ...acc, labels: [...acc.labels, row.voted_for], data: [...acc.data, row.votes], colors: [...acc.colors, TEAMS[row.voted_for].color] }), { labels: [], data: [], colors: [] });
    console.log(result)
    return result;
  }

  slackApp.command('/battle', async ({ command, say, ack }) => {
    console.log('battle!!')
    await ack();
    const { user_id: userId, text, channel_id: channelId } = command;
    const { rows } = await pg.formattedQuery('select_user', { slackId: userId });

    let userType;
    if (rows.length) {
      ([{ user_type: userType }] = rows);
    }

    const { rows: [{ poll_status: pollStatus }] } = await pg.formattedQuery('select_settings', { readableId: EVENT_READABLE_ID });
    const blocks = battleCommand({ teams: TEAMS, round: ROUND, eventName: EVENT_NAME, userId, pollStatus, userType });
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

        const { rows: [{ poll_status: pollStatus }] } = await pg.formattedQuery('select_settings', { readableId: EVENT_READABLE_ID });

        const { rows } = await pg.formattedQuery('select_last_vote_by_user', { voter: userId });
        const votedFor = rows.length && rows[0].voted_for;

        if (pollStatus === 'closed') {
          const scores = await getScores();
          const chart = getChart({ ...scores, eventName: EVENT_NAME });
          await respond({ blocks: votedMessage({ pollStatus, userId, teamId: votedFor, eventName: EVENT_NAME, chart, TEAMS }) });
          return;
        }

        await pg.formattedQuery('insert_vote', { userId, teamId });
        const scores = await getScores();
        const chart = getChart({ ...scores, eventName: EVENT_NAME });
        await respond({ blocks: votedMessage({ pollStatus, userId, teamId, eventName: EVENT_NAME, chart }) });
        console.log(!!rows.length, votedFor.teamId, votedFor === teamId)
        const message = !rows.length ? `:mailbox: <@${userId}> has voted for ${TEAMS[teamId].emoji} \`${TEAMS[teamId].name}\`` :
          {
            true: `:repeat: <@${userId}> has re-voted for ${TEAMS[teamId].emoji} \`${TEAMS[teamId].name}\``,
            false: `:sirens: <@${userId}> has changed their vote ${TEAMS[votedFor].emoji} \`${TEAMS[votedFor].name}\` ${TEAMS[votedFor].members.captain.emoji} ${TEAMS[votedFor].members.padawan.emoji} :arrow_right: ${TEAMS[teamId].emoji} \`${TEAMS[teamId].name}\` ${TEAMS[teamId].members.captain.emoji} ${TEAMS[teamId].members.padawan.emoji}`,
          }[votedFor === teamId];
        await slackApp.client.chat.postMessage({ channel: POST_MESSAGE_CHANNEL, text: message });
      }
    } catch (error) {
      console.error(error);
    }
  })

  slackApp.action({ block_id: 'admin_open_close_polls' }, async ({ ack, body, respond }) => {
    await ack();
    try {
      console.log(JSON.stringify(body))
      const [action] = body?.actions;
      if (body.actions) {
        const userId = body.user.id;
        const { value } = action;

        const query = value === 'open_polls' ? 'open_poll' : 'close_poll';
        await pg.formattedQuery(query, { readableId: EVENT_READABLE_ID });

        const event = value === 'open_polls' ? 'opened' : 'closed';
        const emoji = {
          open_polls: ':heart_diamond:',
          close_polls: ':party_kirby:',
        }[value];
        const message = `${emoji} <@${userId}> have just ${event} the polls!`
        await respond(message);
        await slackApp.client.chat.postMessage({ channel: POST_MESSAGE_CHANNEL, text: message });
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
    const result = await getScores();
    res.json(result);
  });

  app.post('/dracarys', async (req, res) => {
    await pg.query('truncate_vote');
    console.warn(`Dracarys executed!!`)
    res.json({ message: 'Dracarys executed!!' });
  });

  app.get('/polls_status', async (req, res) => {
    const { rows: [{ poll_status: pollStatus }] } = await pg.formattedQuery('select_settings', { readableId: EVENT_READABLE_ID });
    res.json({ pollStatus });
  });

  app.post('/close_polls', async (req, res) => {
    const { rowCount } = await pg.formattedQuery('close_poll', { readableId: EVENT_READABLE_ID });
    console.log(rowCount)
    const message = rowCount ? `Poll ${EVENT_READABLE_ID} closed!!` : `Poll ${EVENT_READABLE_ID} was already closed!!`;
    console.log(message);
    res.json({ message });
  });

  app.post('/open_polls', async (req, res) => {
    const { rowCount } = await pg.formattedQuery('open_poll', { readableId: EVENT_READABLE_ID });
    console.log(rowCount)
    const message = rowCount ? `Poll ${EVENT_READABLE_ID} open!!` : `Poll ${EVENT_READABLE_ID} was already open!!`;
    console.log(message);
    res.json({ message });
  });

  app.listen(process.env.API_PORT, () => console.log(`API listening on port ${process.env.API_PORT}`));


})();
