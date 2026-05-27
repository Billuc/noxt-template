// Bun specific declaration because Bun can load files other than JS/TS.
declare module "*.css" {
  const url: string;
  export default url;
}
