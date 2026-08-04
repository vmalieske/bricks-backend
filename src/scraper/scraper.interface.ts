export interface ScrapeResult {
  title: string | null;
  brand: string | null;
  productNumber: string | null;
  brickCount: number | null;
  brickFormat: string | null;
  productMeasurements: string | null;
  imageUrl: string | null;
  price: { amount: number; currency: string } | null;
  shopUrl: string;
}

export interface Scraper {
  canHandle(url: string): boolean;
  scrape(url: string): Promise<ScrapeResult>;
}
