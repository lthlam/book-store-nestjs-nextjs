export function removeAccents(text: string): string {
  if (!text) return '';
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .toLowerCase();
}

/**
 * Converts a string to a URL-friendly slug.
 * Specifically handles Vietnamese characters and removes special symbols.
 */
export function toSlug(text: string): string {
  if (!text) return '';

  let slug = removeAccents(text);

  // Replace special characters and spaces with hyphens
  slug = slug
    .replace(/[^a-z0-9\s-]/g, '') // Remove non-alphanumeric except spaces and hyphens
    .trim()
    .replace(/\s+/g, '-')       // Replace spaces with hyphens
    .replace(/-+/g, '-');       // Remove consecutive hyphens

  return slug;
}
