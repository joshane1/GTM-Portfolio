export type SiteTheme = 'cobalt' | 'midnight' | 'editorial' | 'atlas' | 'signal';

export type ThemeSearchParams = Promise<{
  theme?: string | string[];
}>;

export async function resolveSiteTheme(searchParams: ThemeSearchParams): Promise<SiteTheme | undefined> {
  const params = await searchParams;
  const value = Array.isArray(params.theme) ? params.theme[0] : params.theme;

  return value === 'cobalt' || value === 'midnight' || value === 'editorial' || value === 'atlas' || value === 'signal'
    ? value
    : undefined;
}

export function siteThemeClass(theme?: SiteTheme) {
  return theme ? `theme-${theme}` : undefined;
}

export function themedHref(href: string, theme?: SiteTheme) {
  if (!theme || href.startsWith('#') || href.startsWith('mailto:')) return href;

  const [path, hash] = href.split('#');
  const separator = path.includes('?') ? '&' : '?';
  const themedPath = `${path}${separator}theme=${theme}`;

  return hash ? `${themedPath}#${hash}` : themedPath;
}
