import "dotenv/config";

import { drizzle } from "drizzle-orm/node-postgres";
import { seed } from "drizzle-seed";
import { price } from "./src/schema/shop/price";
import { product, productCategory } from "./src/schema/shop/product";

async function main() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    throw new Error("DATABASE_URL is not set");
  }
  const db = drizzle(dbUrl);
  // await seed(db, user);

  // await seed(db, product);
  // await seed(db, productCategory);

  await seed(db, { price, product }).refine((f) => ({
    product: {
      count: 20,
      with: {
        price: 3,
      },
    },
    price: {
      columns: {
        currency: f.valuesFromArray({
          values: ["USD", "CNY"],
        }),
        interval: f.valuesFromArray({
          values: [
            "P1M", // 1 month
            "P3M", // 3 months
            "P6M", // 6 months
            "P1Y", // 1 year
            "P1D", // 1 day
            "P7D", // 1 week
            "P30D", // 30 days
            "P90D", // 90 days
            "P180D", // 180 days
            "P365D", // 365 days
          ],
        }),
      },
    },
  }));
}

main();
