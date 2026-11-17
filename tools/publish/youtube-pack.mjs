#!/usr/bin/env node
// Prepare the YouTube upload text for a finished story: title, description, hashtags, playlist, pinned comment, checklist.
//
//   npm run youtube -- <story-slug>      writes stories/<slug>/youtube.md
//
// Nothing is uploaded. You (or the Claude extension, with your OK) paste it into YouTube Studio.
import fs from 'node:fs';
import path from 'node:path';
import {ROOT, die} from '../shared/lib.mjs';

const slug = process.argv[2];
if (!slug) die('usage: npm run youtube -- <story-slug>');
const dir = path.join(ROOT, 'stories', slug);
const storyPath = path.join(dir, 'story.json');
if (!fs.existsSync(storyPath)) die(`stories/${slug}/story.json not found.`);
const story = JSON.parse(fs.readFileSync(storyPath, 'utf8'));

const hindi = story.language === 'hindi';
const partWord = hindi ? 'भाग' : 'Part';
const title = story.hook.length > 70 ? `${story.hook.slice(0, 67).trimEnd()}...` : story.hook;
const series = story.series ? `${story.series}${story.part ? ` · ${partWord} ${story.part}` : ''}` : '';
const langTag = {hindi: '#हिंदी', hinglish: '#Hinglish', english: '#English', other: ''}[story.language] ?? '';
const seriesTag = story.series ? `#${story.series.replace(/[^\p{L}\p{N}]+/gu, '')}` : '';
const hashtags = [seriesTag, langTag, '#Kahani', '#Shorts'].filter(Boolean).slice(0, 5).join(' ');
const videoLanguage = {hindi: 'Hindi', hinglish: 'Hindi', english: 'English', other: '(your language)'}[story.language];
const next = story.part ? story.part + 1 : null;
// Every public text is English + the story's language, so the channel reads well worldwide.
const bilingual = story.language !== 'english';

const text = `# YouTube upload pack: ${story.title}

> Generated from story.json. Edit freely. Check facts and sources before you publish.

## Title (${title.length} characters)
${title}

## Description
${bilingual ? '<The question in English> | ' : ''}${story.hook}

${bilingual ? '<English: 2 lines of the story>\n\n' : ''}<Line 1 of the story>
<Line 2 of the story>

${series ? `${series}\n` : ''}${bilingual ? '\nTranscript (English):\n<English transcript, one line per spoken line>\n\n' : ''}${hindi ? 'ट्रांसक्रिप्ट:\n<transcript>\n\n' : ''}${hindi ? 'स्रोत' : 'Sources'}: <for facts: 2 reliable sources>
${hindi ? 'संगीत' : 'Music'}: <track name, artist, where it is licensed from>

${hashtags}

## Settings
- Playlist: ${story.series ?? '<choose a series playlist>'}
- Video language: ${videoLanguage}
- Visibility: Private first, then Scheduled (same time every day)
- Audience: decide honestly: made for kids or not (a cartoon is not automatically made for kids)
- Content-label questions (altered or synthetic content, made for kids): answer accurately for this video
- Tags (optional, low impact): ${story.hook.replace(/[?।!.,]/g, '').split(/\s+/).slice(0, 4).join(', ')}

## Pinned comment
${next ? `Kal: ${partWord} ${next}. Aap kya sochte hain: <ask a question about this story>?` : '<Ask the audience a question about this reel, or tease the next one>'}

## Before you publish
- [ ] Watched on a phone, with sound and without
- [ ] The question is on screen and spoken in the first 2 seconds
- [ ] Names and places spelled right in the captions
- [ ] Facts match the sources listed in script.md (facts channel) or a well-known retelling (kahani)
- [ ] Deities (if any) shown calm and respectful
- [ ] Music is licensed; credit is in the description
- [ ] Added to the series playlist; next 5 Shorts already scheduled
`;
const out = path.join(dir, 'youtube.md');
fs.writeFileSync(out, text);
console.log(`wrote ${path.relative(ROOT, out)}`);
