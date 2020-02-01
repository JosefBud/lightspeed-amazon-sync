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

This app matches items with the **Custom SKU** field in Lightspeed and your **Seller SKU** in Amazon. So, for example, if an Amazon item's Seller SKU is `ABC123`, then that item's Custom SKU in Lightspeed needs to also be `ABC123`.
