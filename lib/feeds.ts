export const DEFAULT_FEEDS = [
  { name: "Hacker News Front", url: "https://hnrss.org/frontpage", topic: "swe" },
  { name: "Martin Fowler", url: "https://martinfowler.com/feed.atom", topic: "swe" },
  { name: "Google Research", url: "https://research.google/blog/rss/", topic: "ml" },
  { name: "arXiv cs.LG", url: "https://rss.arxiv.org/rss/cs.LG", topic: "ml" },
  { name: "arXiv cs.SE", url: "https://rss.arxiv.org/rss/cs.SE", topic: "swe" },
] as const;

const ML_KEYWORDS = ["ml", "llm", "transformer", "gradient", "neural", "diffusion", "arxiv", "pytorch", "tensorflow", "embedding"];
const SWE_KEYWORDS = ["refactor", "kubernetes", "postgres", "system design", "distributed", "scaling", "ci/cd", "microservice"];

export function assignTopic(feedTopic: "swe" | "ml", title: string, summary: string): "swe" | "ml" {
  const text = `${title} ${summary}`.toLowerCase();
  const ml = ML_KEYWORDS.filter((k) => text.includes(k)).length;
  const swe = SWE_KEYWORDS.filter((k) => text.includes(k)).length;
  if (ml === swe) return feedTopic;
  return ml > swe ? "ml" : "swe";
}
