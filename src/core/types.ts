export interface ReviewStats {
  asin: string;
  allCount: number;
  verifiedCount: number;
  verifiedRating: number | null;
  positiveVerifiedCount: number;
  criticalVerifiedCount: number;
  vineCount: number;
  urls: {
    all: string;
    verified: string;
    positive: string;
    critical: string;
  };
  fetchedAt: number;
  stale?: boolean;
}

export interface ReviewAggregate {
  count: number;
  rating: number | null;
  url: string;
}

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}
