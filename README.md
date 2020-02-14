# lightspeed-amazon-sync

A Node.js app to sync inventory counts between Lightspeed Retail and an Amazon merchant account

Set up the following environment variables:

```
LIGHTSPEED_ID
LIGHTSPEED_SECRET
LIGHTSPEED_REFRESH_TOKEN
MWS_ACCESS_KEY_ID
MWS_SECRET_ACCESS_KEY
MWS_AUTH_TOKEN
MWS_SELLER_ID
```

If you want to use the `logMailer.js` script to send an e-mail with the day's logs, parsed into a color-coded HTML table, use cron to run it every day at 12:01AM or later. Also, set up the following environment variables:

```
SMTP_ADDRESS=your SMTP address (smtp.example.com)
SMTP_PORT=your SMTP port (587)
SMTP_USER=your email username (synclogs@example.com)
SMTP_PASSWORD=your email password (eXaMPLe!123%)
LOG_RECIPIENT_EMAIL=where the log is sent (johndoe@example.com)
```

This app matches items with the **Custom SKU** field in Lightspeed and your **Seller SKU** in Amazon. So, for example, if an Amazon item's Seller SKU is `ABC123`, then that item's Custom SKU in Lightspeed needs to also be `ABC123`.
