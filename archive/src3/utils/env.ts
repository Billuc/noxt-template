export function isDev() {
  return Bun.env.CONTEXT === "dev";
}

export function isBuilding() {
  return Bun.env.CONTEXT === "building";
}

export function isProduction() {
  return Bun.env.CONTEXT === "production";
}
