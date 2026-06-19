const rawBase = import.meta.env.BASE_URL || '/';
const base = rawBase.endsWith('/') ? rawBase : `${rawBase}/`;

export function withBase(path = '/'): string {
  if (/^(?:[a-z]+:)?\/\//i.test(path) || path.startsWith('#')) {
    return path;
  }

  const normalizedPath = path.replace(/^\/+/, '');
  return `${base}${normalizedPath}`;
}
