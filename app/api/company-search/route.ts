import { NextRequest, NextResponse } from 'next/server';

type CompanyMatch = {
  title: string;
  url: string;
  source: string;
  companyHint: string;
};

type SearchBody = {
  role?: string;
  recruiterRequirements?: string;
  strengths?: string[];
  missingKeywords?: string[];
};

function stripHtml(input: string) {
  return input
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizeDuckDuckGoUrl(href: string): string {
  if (!href) return href;

  if (href.startsWith('//')) {
    return `https:${href}`;
  }

  if (href.startsWith('/l/?') || href.includes('duckduckgo.com/l/?')) {
    try {
      const full = href.startsWith('http') ? href : `https://duckduckgo.com${href}`;
      const url = new URL(full);
      const uddg = url.searchParams.get('uddg');
      if (uddg) return decodeURIComponent(uddg);
    } catch {
      return href;
    }
  }

  return href;
}

function inferCompanyHint(targetUrl: string, title: string): string {
  try {
    const host = new URL(targetUrl).hostname.replace(/^www\./, '');
    const parts = host.split('.');
    const root = parts.length >= 2 ? parts[parts.length - 2] : host;
    return root.charAt(0).toUpperCase() + root.slice(1);
  } catch {
    const fromTitle = title.split(/[-|·•]/)[0]?.trim();
    return fromTitle || 'Unknown';
  }
}

function isCareerLikeResult(title: string, url: string): boolean {
  const text = `${title} ${url}`.toLowerCase();

  const positiveSignals = [
    'career',
    'careers',
    'job',
    'jobs',
    'hiring',
    'join us',
    'open position',
    'vacancy',
    'recruit',
    '/careers',
    '/jobs',
    'greenhouse.io',
    'lever.co',
    'workdayjobs',
  ];

  const negativeSignals = [
    'linkedin.com/pulse',
    'youtube.com',
    'facebook.com',
    'wikipedia.org',
    '/blog',
    '/news',
    '/docs',
  ];

  const hasPositive = positiveSignals.some((signal) => text.includes(signal));
  const hasNegative = negativeSignals.some((signal) => text.includes(signal));

  return hasPositive && !hasNegative;
}

function dedupeResults(items: CompanyMatch[]): CompanyMatch[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    const key = `${item.source}-${item.url}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function extractFromPattern(html: string, regex: RegExp): CompanyMatch[] {
  const matches: CompanyMatch[] = [];

  for (const match of html.matchAll(regex)) {
    const href = normalizeDuckDuckGoUrl(match[1]);
    const title = stripHtml(match[2]);

    if (!href || !title) continue;
    if (!href.startsWith('http')) continue;

    const source = (() => {
      try {
        return new URL(href).hostname.replace(/^www\./, '');
      } catch {
        return 'web';
      }
    })();

    matches.push({
      title,
      url: href,
      source,
      companyHint: inferCompanyHint(href, title),
    });
  }

  return matches;
}

function extractResults(html: string, limit = 10): CompanyMatch[] {
  const htmlResults = extractFromPattern(
    html,
    /<a[^>]*class="result__a"[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g
  );

  const liteResults = extractFromPattern(
    html,
    /<a[^>]*class="result-link"[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g
  );

  const deduped = dedupeResults([...htmlResults, ...liteResults]);
  const careerLike = deduped.filter((item) => isCareerLikeResult(item.title, item.url));
  const prioritized = careerLike.length > 0 ? careerLike : deduped;

  return prioritized.slice(0, limit);
}

function buildQuery(body: SearchBody): string {
  const role = body.role?.trim() || 'software engineer';
  const req = body.recruiterRequirements?.trim();
  const strengths = (body.strengths || []).slice(0, 3).join(' ');

  const requirementHint = req
    ? req
        .split(/[\n,.;]/)
        .map((s) => s.trim())
        .filter(Boolean)
        .slice(0, 4)
        .join(' ')
    : '';

  return `${role} hiring careers ${strengths} ${requirementHint}`.replace(/\s+/g, ' ').trim();
}

async function fetchDuckDuckGoPage(query: string): Promise<{ html: string; endpoint: string } | null> {
  const endpoints = [
    `https://duckduckgo.com/html/?q=${encodeURIComponent(query)}`,
    `https://lite.duckduckgo.com/lite/?q=${encodeURIComponent(query)}`,
  ];

  for (const endpoint of endpoints) {
    try {
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'User-Agent':
            'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
          Accept: 'text/html,application/xhtml+xml',
          'Accept-Language': 'en-US,en;q=0.9',
          Referer: 'https://duckduckgo.com/',
        },
        redirect: 'follow',
        cache: 'no-store',
      });

      if (!response.ok) {
        continue;
      }

      const html = await response.text();
      const hasResultMarkers =
        html.includes('result__a') || html.includes('result-link') || html.includes('duckduckgo');

      if (hasResultMarkers) {
        return { html, endpoint };
      }
    } catch {
      // try next endpoint
    }
  }

  return null;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as SearchBody;

    if (!body.role || !body.role.trim()) {
      return NextResponse.json({ error: 'Missing target role for search.' }, { status: 400 });
    }

    const query = buildQuery(body);
    const searchPage = await fetchDuckDuckGoPage(query);

    if (!searchPage) {
      return NextResponse.json(
        {
          error:
            'DuckDuckGo is blocking this server right now. Please retry in 1-2 minutes or provide your DuckDuckGo repo so I can switch to your working adapter.',
        },
        { status: 502 }
      );
    }

    const results = extractResults(searchPage.html, 10);

    return NextResponse.json({
      query,
      endpointUsed: searchPage.endpoint,
      results,
    });
  } catch (error) {
    console.error('Company search error:', error);
    return NextResponse.json({ error: 'Failed to search matching companies.' }, { status: 500 });
  }
}
