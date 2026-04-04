import { buildIslands, prerenderPages } from "./utils/build";

async function run() {
  await buildIslands();
  await prerenderPages();
  console.log("Build complete.");
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
