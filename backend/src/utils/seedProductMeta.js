import mongoose from "mongoose";
import { connectDatabase } from "../config/database.js";
import Product from "../models/Item.js";

const skuFromIndex = (index) => `GC-PROD-${String(index + 1).padStart(3, "0")}`;

const priceFromIndex = (index) => Number((149.99 + index * 35).toFixed(2));

const run = async () => {
  await connectDatabase();

  const products = await Product.find().sort({ createdAt: 1 });
  const usedSku = new Set();
  let updatedCount = 0;

  for (let index = 0; index < products.length; index += 1) {
    const product = products[index];
    const existingSku = String(product.sku || "").trim().toUpperCase();
    let nextSku = existingSku || skuFromIndex(index);
    let suffix = 1;

    while (usedSku.has(nextSku)) {
      nextSku = `${skuFromIndex(index)}-${suffix}`;
      suffix += 1;
    }
    usedSku.add(nextSku);

    const hasValidPrice = typeof product.price === "number" && Number.isFinite(product.price) && product.price > 0;
    const nextPrice = hasValidPrice ? product.price : priceFromIndex(index);

    const shouldUpdate = product.sku !== nextSku || product.price !== nextPrice;

    if (shouldUpdate) {
      product.sku = nextSku;
      product.price = nextPrice;
      await product.save();
      updatedCount += 1;
    }
  }

  console.log(`Products updated with dummy SKU/price: ${updatedCount}/${products.length}`);
  await mongoose.disconnect();
};

run().catch(async (error) => {
  console.error("Failed to seed product meta:", error.message);
  await mongoose.disconnect();
  process.exit(1);
});

