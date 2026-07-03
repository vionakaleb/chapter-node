const BASE_URL =
  import.meta.env.VITE_RECOMMENDER_URL ?? "http://localhost:3001";

export interface EnrichedBook {
  workKey: string;
  subjects: string[];
  coverUrl?: string;
  averageRating?: number;
}

export interface Recommendation {
  workKey: string;
  title: string;
  authors: string[];
  subjects: string[];
  coverUrl?: string;
  score: number;
  reason: string;
}

export async function lookupBook(
  title: string,
  author: string,
): Promise<EnrichedBook | null> {
  const res = await fetch(`${BASE_URL}/api/books/lookup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, author }),
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Lookup failed: ${res.status}`);
  const data = await res.json();
  return data.book;
}

export async function fetchRecommendations(
  library: {
    id: string;
    title: string;
    author: string;
    status: string;
    subjects?: string[];
    workKey?: string;
  }[],
  limit = 10,
): Promise<Recommendation[]> {
  const res = await fetch(`${BASE_URL}/api/recommendations`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ library, limit }),
  });
  if (!res.ok) throw new Error(`Recommendations failed: ${res.status}`);
  const data = await res.json();
  return data.recommendations;
}
