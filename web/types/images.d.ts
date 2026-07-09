// Static-image import types for bare `tsc` runs (CI typechecks without the
// generated next-env.d.ts, which is gitignored in this repo).
declare module "*.jpg" {
  import type { StaticImageData } from "next/image";
  const content: StaticImageData;
  export default content;
}
declare module "*.jpeg" {
  import type { StaticImageData } from "next/image";
  const content: StaticImageData;
  export default content;
}
declare module "*.png" {
  import type { StaticImageData } from "next/image";
  const content: StaticImageData;
  export default content;
}
declare module "*.webp" {
  import type { StaticImageData } from "next/image";
  const content: StaticImageData;
  export default content;
}
declare module "*.avif" {
  import type { StaticImageData } from "next/image";
  const content: StaticImageData;
  export default content;
}
