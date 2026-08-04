import Elysia from 'elysia';
import { scraperService } from '../scraper/scraper.service';

export const scrapeRoutes = new Elysia({ prefix: '/scrape' }).post(
  '/product',
  async ({ body, status }) => {
    const { url } = body as { url: string };

    if (!url) {
      return status(400, { message: 'URL is required' });
    }

    if (!scraperService.canHandle(url)) {
      return status(400, { message: 'No scraper available for this URL' });
    }

    try {
      return await scraperService.scrape(url);
    } catch (err) {
      return status(500, { message: 'Error while scraping the page' });
    }
  },
);
