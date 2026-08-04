import * as cheerio from 'cheerio';
import type { Scraper, ScrapeResult } from './scraper.interface';

export class BlueBrixxScraper implements Scraper {
  canHandle(url: string): boolean {
    return url.includes('bluebrixx.com');
  }

  async scrape(url: string): Promise<ScrapeResult> {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept-Language': 'de-DE,de;q=0.9',
      },
    });

    const html = await response.text();
    const $cheerio = cheerio.load(html);

    const title =
      $cheerio('meta[property="og:title"]')
        .attr('content')
        ?.replace(' online kaufen | BlueBrixx', '')
        .trim() ?? null;

    const imageUrl = $cheerio('meta[property="og:image"]').attr('content') ?? null;
    const brand = $cheerio('meta[property="product:brand"]').attr('content') ?? null;
    const priceAmount = $cheerio('meta[property="product:price:amount"]').attr('content');
    const priceCurrency =
      $cheerio('meta[property="product:price:currency"]').attr('content') ?? 'EUR';

    const formatText = $cheerio(
      '.esbb-pdp-main-attribute-element-text span.text-decoration-underline',
    )
      .first()
      .text()
      .trim()
      .toLowerCase();
    const formatMap: Record<string, string> = {
      standard: 'standard',
      diamond: 'diamond',
      mini: 'mini',
      special: 'special',
    };
    const brickFormat = formatMap[formatText] ?? null;

    const brickCountText = $cheerio('*')
      .filter((_, element) => {
        return $cheerio(element).text().includes('Teileanzahl');
      })
      .first()
      .text();
    const brickCountMatch = brickCountText.match(/(\d+)\s*Teileanzahl/);
    const brickCount = brickCountMatch ? parseInt(brickCountMatch[1]!) : null;

    const measurementsText = $cheerio('*')
      .filter((_, element) => {
        return /\d+x\d+x\d+\s*mm/.test($cheerio(element).text());
      })
      .first()
      .text();
    const measurementsMatch = measurementsText.match(/(\d+x\d+x\d+\s*mm)/);
    const measurements = measurementsMatch ? (measurementsMatch[1] ?? null) : null;

    const productNumberText = $cheerio('*')
      .filter((_, element) => {
        return $cheerio(element).text().includes('Produktnummer:');
      })
      .first()
      .text();
    const productNumberMatch = productNumberText.match(/Produktnummer:\s*(\d+)/);
    const productNumber = productNumberMatch ? (productNumberMatch[1] ?? null) : null;

    return {
      title,
      brand,
      productNumber,
      brickCount,
      brickFormat,
      productMeasurements: measurements,
      imageUrl,
      price: priceAmount
        ? {
            amount: parseFloat(priceAmount),
            currency: priceCurrency,
          }
        : null,
      shopUrl: url,
    };
  }
}
