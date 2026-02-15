export type ContentTopic = {
  id: string;
  label: string;
  keywords: string[];
};

export const CONTENT_TOPICS: ContentTopic[] = [
  { id: 'all', label: 'All', keywords: [] },
  { id: 'usa', label: 'USA', keywords: ['usa', 'u.s', 'united states', 'american', 'анУ', 'америк'] },
  { id: 'japan', label: 'Japan', keywords: ['japan', 'jp', 'япон'] },
  { id: 'germany', label: 'Germany', keywords: ['germany', 'deu', 'german', 'герман'] },
  { id: 'uk', label: 'UK', keywords: ['uk', 'britain', 'united kingdom'] },
  { id: 'canada', label: 'Canada', keywords: ['canada', 'ca'] },
  { id: 'australia', label: 'Australia', keywords: ['australia', 'au'] },
  { id: 'advice', label: 'Advice', keywords: ['advice', 'guide', 'tips', 'how to'] },
  { id: 'visas', label: 'Visas', keywords: ['visa', 'consulate', 'embassy', 'application'] },
];

const normalize = (value: string | undefined | null): string => (value || '').toLowerCase();

export const matchesTopic = (
  topicId: string,
  source: { title?: string | null; excerpt?: string | null; tags?: string | null }
): boolean => {
  if (topicId === 'all') return true;
  const topic = CONTENT_TOPICS.find((item) => item.id === topicId);
  if (!topic) return true;

  const combined = [source.title, source.excerpt, source.tags].map(normalize).join(' ');
  return topic.keywords.some((keyword) => combined.includes(keyword.toLowerCase()));
};

