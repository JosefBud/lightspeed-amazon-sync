const OneSignal = require('onesignal-node');
const client = new OneSignal.Client(
  process.env.ONESIGNAL_APP_ID,
  process.env.ONESIGNAL_KEY
);

const pushNotification = itemName => {
  const notification = {
    contents: {
      en: itemName
    },
    headings: {
      en: 'LAST ONE SOLD! Please take it off the wall'
    },
    included_segments: ['Subscribed Users']
  };

  client.createNotification(notification).catch(err => console.error(err));
};

module.exports = pushNotification;
