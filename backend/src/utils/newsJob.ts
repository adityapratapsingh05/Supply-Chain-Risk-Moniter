import cron from 'node-cron';
import { prisma } from '../lib/prisma';

async function fetchAndStoreNews() {
  if (!process.env.NEWSAPI_KEY) {
    console.log('[news-job] NEWSAPI_KEY not set, skipping.');
    return;
  }
  try {
    const resp = await fetch(
      `https://newsapi.org/v2/everything?q=supply%20chain%20disruption&sortBy=publishedAt&pageSize=10&apiKey=${process.env.NEWSAPI_KEY}`
    );
    const data = (await resp.json()) as {
      articles?: { title: string; description?: string; url: string; publishedAt: string }[];
    };
    for (const article of data.articles || []) {
      const exists = await prisma.riskEvent.findFirst({ where: { sourceUrl: article.url } });
      if (exists) continue;
      await prisma.riskEvent.create({
        data: {
          title: article.title,
          description: article.description || '',
          category: 'NEWS',
          severity: 'UNCLASSIFIED',
          source: 'NEWSAPI',
          sourceUrl: article.url,
          detectedAt: new Date(article.publishedAt),
        },
      });
    }
    console.log(`[news-job] Ingested ${data.articles?.length || 0} articles.`);
  } catch (err) {
    console.error('[news-job] Failed:', err);
  }
}

export function startNewsJob() {
  // Runs at minute 0 of every hour
  cron.schedule('0 * * * *', fetchAndStoreNews);
  console.log('[news-job] Scheduled hourly news ingestion.');
}
