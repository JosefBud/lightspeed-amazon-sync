const cleanFullInventory = (inventory) => {
  return new Promise((resolve, reject) => {
    let prunedInventory = {};
    for (let i = 0; i < inventory.length; i++) {
      //console.log(inventory[i]);
      const { systemSku } = inventory[i];
      let itemID = systemSku.slice(8);
      if (itemID[0] === '0') {
        if (itemID[1] === '0') {
          itemID = itemID.slice(2);
        } else {
          itemID = itemID.slice(1);
        }
      }
      prunedInventory[itemID] = {
        qty: parseInt(inventory[i].ItemShops.ItemShop[0].sellable),
        price: parseFloat(inventory[i].Prices.ItemPrice[0].amount),
      };
    }
    resolve(prunedInventory);
  });
};

module.exports = cleanFullInventory;
