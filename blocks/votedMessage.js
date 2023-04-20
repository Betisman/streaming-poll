const votedMessage = ({ pollStatus, userId, teamId, eventName, chart, TEAMS }) => [
  {
    type: 'header',
    text: {
      type: 'plain_text',
      text: `${eventName} votes so far`,
      emoji: true,
    },
  },
  ...(pollStatus === 'open' ? [{
    type: 'section',
    text: {
      type: 'mrkdwn',
      text: `<@${userId}>, you have just voted for \`${teamId}\``,
    },
  }] : []),
  ...(pollStatus === 'closed' ? [{
    type: 'section',
    text: {
      type: 'mrkdwn',
      text: `:white-bear-sad: <@${userId}>, the polls are closed, your bet has not been placed!! :cry_spin:`,
    },
  },
    ...(teamId ? [{
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `Your current bet is for ${TEAMS[teamId].emoji} \`${TEAMS[teamId].name}\`: ${TEAMS[teamId].members.captain.emoji} <@${TEAMS[teamId].members.captain.id}> and ${TEAMS[teamId].members.padawan.emoji} <@${TEAMS[teamId].members.padawan.id}>`,
      },
    }] : [] ),
] : []),
  {
    type: 'image',
    title: {
      type: 'plain_text',
      text: `${eventName}`,
      emoji: true,
    },
    image_url: chart.getUrl(),
    alt_text: 'team_mood',
  },
];

module.exports = { votedMessage };