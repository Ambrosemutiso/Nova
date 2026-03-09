export function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "");
}