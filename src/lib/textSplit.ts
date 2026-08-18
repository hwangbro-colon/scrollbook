// Splits a sentence into short phrase fragments so each reel/완독모드 page
// shows roughly `target`(~15) characters and never more than `max`(~20).
// Breaks only at word (어절) boundaries — never mid-word — so a highlighted
// vocab word is never split across two pages.
export function splitIntoPhrases(sentence: string, target = 15, max = 20): string[] {
  const words = sentence.split(/\s+/).filter(Boolean);
  if (words.length === 0) return [];

  const phrases: string[] = [];
  let current = "";
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (current && candidate.length > max) {
      phrases.push(current);
      current = word;
    } else {
      current = candidate;
    }
    if (current.length >= target) {
      phrases.push(current);
      current = "";
    }
  }
  if (current) phrases.push(current);
  return phrases;
}
