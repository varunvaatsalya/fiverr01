function processMedicineRequests( retailStock, requestedMedicine) {
  const result = [];

  for (const request of requestedMedicine) {
    const { medicineId, isTablets, quantity } = request;

    const stock = retailStock.find((rs) => rs.medicineId === medicineId);
    
    if (!stock || stock.stocks.length === 0) {
      result.push({ medicineId, status: "No stock available" });
      continue;
    }

    let remainingQuantity = isTablets
      ? { strips: quantity.strips, tablets: quantity.tablets }
      : { strips: quantity.normalQuantity, tablets: 0 };

    let updatedStocks = [...stock.stocks].sort(
      (a, b) => new Date(a.expiryDate) - new Date(b.expiryDate)
    );

    const allocatedQuantities = []; // Track allocation per batch

    for (const batch of updatedStocks) {
      const { packetSize, quantity: stockQuantity } = batch;

      let stripsNeeded = remainingQuantity.strips;
      let tabletsNeeded = remainingQuantity.tablets;

      let stripsAllocated = 0;
      let tabletsAllocated = 0;

      if (stripsNeeded > 0) {
        if (stockQuantity.totalStrips >= stripsNeeded) {
          stripsAllocated = stripsNeeded;
          stockQuantity.totalStrips -= stripsNeeded;
          stripsNeeded = 0;
        } else {
          stripsAllocated = stockQuantity.totalStrips;
          stripsNeeded -= stockQuantity.totalStrips;
          stockQuantity.totalStrips = 0;
        }
      }

      if (isTablets && tabletsNeeded > 0) {
        const availableTablets =
          stockQuantity.totalStrips * packetSize.tabletsPerStrip +
          stockQuantity.tablets;

        if (availableTablets >= tabletsNeeded) {
          tabletsAllocated = tabletsNeeded;

          // Deduct tablets directly from stock
          if (stockQuantity.tablets >= tabletsNeeded) {
            stockQuantity.tablets -= tabletsNeeded;
          } else {
            // Calculate strips and remaining tablets needed
            const extraTabletsNeeded = tabletsNeeded - stockQuantity.tablets;
            stockQuantity.tablets = 0;

            const extraStripsNeeded = Math.ceil(
              extraTabletsNeeded / packetSize.tabletsPerStrip
            );

            stockQuantity.totalStrips -= extraStripsNeeded;
            stockQuantity.tablets =
              extraStripsNeeded * packetSize.tabletsPerStrip -
              extraTabletsNeeded;
          }
          tabletsNeeded = 0;
        } else {
          // Use all available tablets
          tabletsAllocated = availableTablets;
          tabletsNeeded -= availableTablets;
          stockQuantity.totalStrips = 0;
          stockQuantity.tablets = 0;
        }
      }

      remainingQuantity.strips = stripsNeeded;
      remainingQuantity.tablets = tabletsNeeded;

      // Update boxes and extras for this stock
      stockQuantity.boxes = Math.floor(
        stockQuantity.totalStrips / packetSize.strips
      );
      stockQuantity.extra = stockQuantity.totalStrips % packetSize.strips;

      // Record allocation
      allocatedQuantities.push({
        batchName: batch.batchName,
        stripsAllocated,
        tabletsAllocated,
      });

      if (remainingQuantity.strips <= 0 && remainingQuantity.tablets <= 0) {
        break;
      }
    }

    if (remainingQuantity.strips > 0 || remainingQuantity.tablets > 0) {
      result.push({
        medicineId,
        status: "Partially fulfilled or insufficient stock",
        remainingQuantity,
        allocatedQuantities,
      });
    } else {
      result.push({
        medicineId,
        status: "Request fulfilled",
        allocatedQuantities,
      });
    }

    // console.log(`Medicine ID: ${medicineId}`);
    // console.log("Allocated Quantities:", allocatedQuantities);
  }

  return JSON.stringify({
    updatedRetailStock: retailStock,
    requestResults: result,
  });
}

const medicines1 = [
  { id: 1, name: "ghdv", isTablets: true },
  { id: 2, name: "ewgh", isTablets: false },
  { id: 3, name: "hjrbthj", isTablets: false },
  { id: 4, name: "jhrfu", isTablets: true },
];

const retailStock1 = [
  {
    medicineId: 1,
    stocks: [
      {
        batchName: "batchA",
        expiryDate: new Date("2025-12-01"),
        packetSize: { strips: 12, tabletsPerStrip: 20 },
        quantity: { boxes: 1, extra: 3, totalStrips: 15, tablets: 10 },
        purchasePrice: 50,
        sellingPrice: 70,
      },
      {
        batchName: "batchB",
        expiryDate: new Date("2026-03-01"),
        packetSize: { strips: 12, tabletsPerStrip: 20 },
        quantity: { boxes: 1, extra: 6, totalStrips: 18, tablets: 0 },
        purchasePrice: 50,
        sellingPrice: 70,
      },
    ],
  },
  {
    medicineId: 3,
    stocks: [
      {
        batchName: "batchA",
        expiryDate: new Date("2025-01-01"),
        packetSize: { strips: 6, tabletsPerStrip: 1 },
        quantity: { boxes: 3, extra: 3, totalStrips: 21, tablets: 0 },
        purchasePrice: 60,
        sellingPrice: 90,
      },
      {
        batchName: "batchB",
        expiryDate: new Date("2025-02-01"),
        packetSize: { strips: 6, tabletsPerStrip: 1 },
        quantity: { boxes: 1, extra: 5, totalStrips: 11, tablets: 0 },
        purchasePrice: 65,
        sellingPrice: 95,
      },
    ],
  },
];

// Requested medicines
const requestedMedicine1 = [
  {
    medicineId: 1,
    isTablets: true,
    quantity: { strips: 17, tablets: 15, normalQuantity: 0 },
  },
  {
    medicineId: 4,
    isTablets: true,
    quantity: { strips: 17, tablets: 15, normalQuantity: 0 },
  },
  {
    medicineId: 3,
    isTablets: false,
    quantity: { strips: 0, tablets: 0, normalQuantity: 10 },
  },
];

console.log(
  processMedicineRequests(medicines1, retailStock1, requestedMedicine1)
);

let result2 = {
  updatedRetailStock: [
    {
      medicineId: 1,
      stocks: [
        {
          batchName: "batchA",
          expiryDate: "2025-12-01T00:00:00.000Z",
          packetSize: { strips: 12, tabletsPerStrip: 20 },
          quantity: { boxes: 0, extra: 0, totalStrips: 0, tablets: 0 },
          purchasePrice: 50,
          sellingPrice: 70,
        },
        {
          batchName: "batchB",
          expiryDate: "2026-03-01T00:00:00.000Z",
          packetSize: { strips: 12, tabletsPerStrip: 20 },
          quantity: { boxes: 1, extra: 3, totalStrips: 15, tablets: 15 },
          purchasePrice: 50,
          sellingPrice: 70,
        },
      ],
    },
    {
      medicineId: 3,
      stocks: [
        {
          batchName: "batchA",
          expiryDate: "2025-01-01T00:00:00.000Z",
          packetSize: { strips: 6, tabletsPerStrip: 1 },
          quantity: { boxes: 1, extra: 5, totalStrips: 11, tablets: 0 },
          purchasePrice: 60,
          sellingPrice: 90,
        },
        {
          batchName: "batchB",
          expiryDate: "2025-02-01T00:00:00.000Z",
          packetSize: { strips: 6, tabletsPerStrip: 1 },
          quantity: { boxes: 1, extra: 5, totalStrips: 11, tablets: 0 },
          purchasePrice: 65,
          sellingPrice: 95,
        },
      ],
    },
  ],
  requestResults: [
    {
      medicineId: 1,
      status: "Request fulfilled",
      allocatedQuantities: [
        { batchName: "batchA", stripsAllocated: 15, tabletsAllocated: 10 },
        { batchName: "batchB", stripsAllocated: 2, tabletsAllocated: 5 },
      ],
    },
    {
      medicineId: 3,
      status: "Request fulfilled",
      allocatedQuantities: [
        { batchName: "batchA", stripsAllocated: 10, tabletsAllocated: 0 },
      ],
    },
  ],
};
