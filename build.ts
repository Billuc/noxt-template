import {
  buildIslands,
  cleanDistFolder,
  copyPublicFolder,
  prerenderPages,
} from "./utils/build";

async function run() {
  await cleanDistFolder();
  await buildIslands();
  await prerenderPages();
  await copyPublicFolder();
  console.log("Build complete.");
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
