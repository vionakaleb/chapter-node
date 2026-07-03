// import type { BookStatus, TrackedBook } from "../types";

// const STATUS_WEIGHT: Record<BookStatus, number> = {
//   READING: 1.0, // strongest signal — current taste
//   READ: 0.6, // revealed preference but older
//   TO_READ: 0.3, // aspirational, weaker
//   DNF: -0.5, // negative signal: penalize similar books
// };

// type Profile = {
//   subjects: Map<string, number>;
//   authors: Map<string, number>;
//   ownedWorkKeys: Set<string>;
// };

// export function buildProfile(books: TrackedBook[]): Profile {
//   const subjects = new Map<string, number>();
//   const authors = new Map<string, number>();
//   const ownedWorkKeys = new Set<string>();

//   for (const b of books) {
//     const w = STATUS_WEIGHT[b.status] ?? 0;
//     if (b.workKey) ownedWorkKeys.add(b.workKey);

//     for (const s of b.subjects ?? []) {
//       const key = s.toLowerCase().trim();
//       subjects.set(key, (subjects.get(key) ?? 0) + w);
//     }
//     const a = b.author.toLowerCase().trim();
//     authors.set(a, (authors.get(a) ?? 0) + w * 0.5); // author signal weaker than subject
//   }

//   return { subjects, authors, ownedWorkKeys };
// }

// export async function fetchCandidates(profile: Profile): Promise<RawBook[]> {
//   const topSubjects = [...profile.subjects.entries()]
//     .sort(([, a], [, b]) => b - a)
//     .slice(0, 5)
//     .map(([s]) => s);

//   const queries = topSubjects.map((s) =>
//     fetch(
//       `https://openlibrary.org/search.json?subject=${encodeURIComponent(s)}&limit=20&fields=key,title,author_name,subject,first_publish_year,cover_i,ratings_average`,
//       { headers: { "User-Agent": "ChapterNode/0.1 (you@example.com)" } },
//     ).then((r) => r.json()),
//   );

//   const results = await Promise.all(queries);
//   const pool = results.flatMap((r) => r.docs ?? []);

//   // dedupe by work key
//   const seen = new Set<string>();
//   return pool.filter((b) => {
//     if (seen.has(b.key)) return false;
//     seen.add(b.key);
//     return true;
//   });
// }

// export function scoreBook(book: RawBook, profile: Profile): number {
//   if (profile.ownedWorkKeys.has(book.key)) return -Infinity; // never recommend owned

//   const bookSubjects = new Set(
//     (book.subject ?? []).map((s: string) => s.toLowerCase().trim()),
//   );

//   // Subject overlap, weighted by user's affinity to each subject
//   let subjectScore = 0;
//   for (const s of bookSubjects) {
//     subjectScore += profile.subjects.get(s) ?? 0;
//   }
//   // Normalize by book's subject count to avoid rewarding spammy-tagged books
//   subjectScore /= Math.sqrt(bookSubjects.size || 1);

//   // Author bonus
//   const authorScore = (book.author_name ?? [])
//     .map((a: string) => profile.authors.get(a.toLowerCase().trim()) ?? 0)
//     .reduce((a: number, b: number) => a + b, 0);

//   // Small popularity nudge (avoids recommending obscure 2-rating books)
//   const popularityBoost = Math.log1p(book.ratings_average ?? 0) * 0.3;

//   return subjectScore + authorScore + popularityBoost;
// }

// function buildReason(
//   book: RawBook,
//   profile: Profile,
//   library: TrackedBook[],
// ): string {
//   const sharedSubjects = (book.subject ?? [])
//     .map((s: string) => s.toLowerCase().trim())
//     .filter((s: string) => profile.subjects.has(s));

//   if (sharedSubjects.length === 0) {
//     return `Matches authors you've read.`;
//   }

//   // Find which of the user's books contributed the most to this match
//   const topSubject = sharedSubjects[0];
//   const sourceBook = library.find((b) =>
//     b.subjects?.some((s) => s.toLowerCase().trim() === topSubject),
//   );

//   if (sourceBook) {
//     return `Because you ${
//       sourceBook.status === "READING" ? "are reading" : "read"
//     } "${sourceBook.title}", you might enjoy this take on ${topSubject}.`;
//   }
//   return `Shares themes with books in your library: ${sharedSubjects.slice(0, 2).join(", ")}.`;
// }
