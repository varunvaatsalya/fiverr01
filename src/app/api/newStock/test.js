function calculateStockValues(stock) {
  // Step 1: Parse and ensure defaults
  let quantity = parseFloat(stock.quantity) || 0;
  let offer = parseFloat(stock.offer) || 0;
  let purchasePrice = parseFloat(stock.purchasePrice) || 0;
  let discount = parseFloat(stock.discount) || 0;
  let sgst = parseFloat(stock.sgst) || 0;
  let cgst = parseFloat(stock.cgst) || 0;
  let sellingPrice = parseFloat(stock.sellingPrice) || 0;

  // Step 2: Total base amount (only quantity)
  let baseAmount = quantity * purchasePrice;

  // Step 3: Apply discount
  let discountAmount = baseAmount * (discount / 100);
  let discountedAmount = baseAmount - discountAmount;

  // Step 4: Apply GST
  let totalGSTPercent = sgst + cgst;
  let gstAmount = discountedAmount * (totalGSTPercent / 100);
  let finalTotalAmount = discountedAmount + gstAmount;

  // Step 5: Net Purchase Rate (includes offer in denominator)
  let totalUnitsReceived = quantity + offer;
  let netPurchaseRate =
    totalUnitsReceived > 0 ? finalTotalAmount / totalUnitsReceived : 0;

  // Step 6: Cost Price per unit (excluding offer)
  let costPrice = quantity > 0 ? finalTotalAmount / quantity : 0;

  // Step 7: Total Amount
  let totalAmount = costPrice * quantity;

  return {
    netPurchaseRate: netPurchaseRate.toFixed(2),
    costPrice: costPrice.toFixed(2),
    totalAmount: totalAmount.toFixed(2),
    sellingPrice: sellingPrice.toFixed(2),
  };
}

let stocks = {
  quantity: 100,
  offer: 50,
  purchasePrice: 92.95,
  discount: 0.0,
  sgst: 6.0,
  cgst: 6.0,
  sellingPrice: 130.0,
};
let data = calculateStockValues(stocks);

console.log(data, typeof data.netPurchaseRate);
// {
//   netPurchaseRate: '45.76',
//   costPrice: '64.06',
//   totalAmount: '6406.40',
//   sellingPrice: '80.00'
// }

// {
//   netPurchaseRate: '69.40',
//   costPrice: '104.10',
//   totalAmount: '10410.40',
//   sellingPrice: '130.00'
// }
