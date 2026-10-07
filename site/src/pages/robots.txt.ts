import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { KURUM } from '../lib/site';

export const GET: APIRoute = () =>
  new Response(
    (env as Record<string, unknown>).STAGING_ORTAMI === '1' ? 'User-agent: *\nDisallow: /\n' : `User-agent: *
Allow: /
Disallow: /api/
Disallow: /yonetim/
Disallow: /g/

Sitemap: ${KURUM.site}/sitemap.xml
`,
    { headers: { 'Content-Type': 'text/plain; charset=utf-8' } }
  );
