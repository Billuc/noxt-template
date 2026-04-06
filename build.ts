import {
  buildIslands,
  cleanDistFolder,
  copyPublicFolder,
  generatePages,
  generateServer,
} from "./utils/build";

async function run() {
  await cleanDistFolder();
  await buildIslands();
  const pages = await generatePages();
  await copyPublicFolder();
  await generateServer(pages);
  console.log("Build complete.");
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
