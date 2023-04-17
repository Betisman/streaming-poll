const adminBlocks = ({ pollStatus }) => ([
  {
    "type": "divider"
  },
  {
    type: 'section',
    text: {
      type: 'mrkdwn',
      text: ':warning: You are an admin:',
    },
  },
  {
    type: 'actions',
    block_id: 'admin_open_close_polls',
    elements: [
      pollStatus === 'closed' ? {
        type: 'button',
        text: {
          type: 'plain_text',
          text: 'Open polls',
          emoji: true,
        },
        style: 'primary',
        value: 'open_polls',
      } : {
        type: 'button',
        text: {
          type: 'plain_text',
          text: 'Close polls',
          emoji: true,
        },
        style: 'danger',
        value: 'close_polls',
      },
    ],
  }
]);

const battleCommand = ({ teams, round, eventName, userId, pollStatus, userType }) => ({
  "blocks": [
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": `<@${userId}> Please place your bet. Which team will win?`
      },
    },
    {
      "type": "actions",
      "block_id": "vote",
      "elements": Object.entries(teams).map(([teamId, { name, emoji, style, members: { captain, padawan } }]) => (
        {
          "type": "button",
          "text": {
            "type": "plain_text",
            "text": `${emoji} ${name} ${captain.emoji} ${padawan.emoji}`,
            emoji: true,
          },
          style,
          "value": JSON.stringify({ round, teamId, userId }),
        }))
    },
    ...(userType === 'admin' ? adminBlocks({ pollStatus }) : []),
  ]
});

module.exports = { battleCommand };
