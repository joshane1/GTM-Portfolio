import { redirect } from 'next/navigation';
import { resolveSiteTheme, themedHref, type ThemeSearchParams } from '../site-theme';

type PageProps = { searchParams: ThemeSearchParams };

export default async function LegacySolutionsPage({ searchParams }: PageProps) {
  const theme = await resolveSiteTheme(searchParams);
  redirect(themedHref('/work', theme));
}
