/**
 * Story languages. The language decides the caption font, size and how many words show at once.
 *  - hinglish: Hindi written in English letters ("Lakshman 14 saal soye kyun nahi?")
 *  - hindi:    Devanagari script
 *  - english:  English
 *  - other:    any other Indian language (Marathi, Gujarati, Tamil, Bengali ...); the font stack falls back per script
 */
export type Language = 'hinglish' | 'hindi' | 'english' | 'other';

const ROMAN = '"Helvetica Neue", Inter, Arial, system-ui, sans-serif';
const INDIC =
  '"Noto Sans Devanagari", "Kohinoor Devanagari", "Devanagari Sangam MN", "Nirmala UI", Mukta, ' +
  '"Kohinoor Gujarati", "Kohinoor Bangla", "Kohinoor Telugu", "Tamil Sangam MN", system-ui, sans-serif';

export type LanguageSpec = {
  label: string;
  font: string;
  captionSize: number;
  wordsPerLine: number;
  /** language code to pass to tools/timings.py (--language) */
  whisper: string | null;
  /** word used in the opening badge: "Part 3" */
  part: string;
};

export const languages: Record<Language, LanguageSpec> = {
  hinglish: {label: 'Hinglish (Roman letters)', font: ROMAN, captionSize: 76, wordsPerLine: 4, whisper: 'hi', part: 'Part'},
  english: {label: 'English', font: ROMAN, captionSize: 76, wordsPerLine: 4, whisper: 'en', part: 'Part'},
  hindi: {label: 'Hindi (Devanagari)', font: INDIC, captionSize: 68, wordsPerLine: 3, whisper: 'hi', part: 'भाग'},
  other: {label: 'Other Indian language', font: INDIC, captionSize: 64, wordsPerLine: 3, whisper: null, part: 'Part'},
};
