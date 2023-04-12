const battleCommand = ({ teams, round, eventName, userId }) => ({
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
    }
  ]
});

module.exports = { battleCommand };
