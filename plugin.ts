// Custom plugin to modify imports
import { type BunPlugin } from "bun";

export const myPlugin: BunPlugin = {
  name: "Custom Import Modifier",
  setup(build) {
    build.onLoad({ filter: /message/ }, async (args) => {
      let exports = { ...require(args.path) };
      exports["message"] = "Modified by plugin!";
      return {
        exports,
        loader: "object",
      };
    });
  },
};
