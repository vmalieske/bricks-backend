import type { Scraper, ScrapeResult } from './scraper.interface';
import { BlueBrixxScraper } from './bluebrixx.scraper';

export class ScraperService {
  #scrapers: Scraper[] = [new BlueBrixxScraper()];

  canHandle(url: string): boolean {
    return this.#scrapers.some((scraper) => scraper.canHandle(url));
  }

  async scrape(url: string): Promise<ScrapeResult> {
    const scraper = this.#scrapers.find((scraper) => scraper.canHandle(url));
    if (!scraper) throw new Error(`No scraper found for URL: ${url}`);
    return scraper.scrape(url);
  }
}

export const scraperService = new ScraperService();
