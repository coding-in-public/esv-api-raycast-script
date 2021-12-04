#!/usr/bin/env node

// Required parameters:
// @raycast.schemaVersion 1
// @raycast.title ESV Passage
// @raycast.mode silent

// Optional parameters:
// @raycast.icon assets/esv--light.png
// @raycast.iconDark assets/esv--dark.png
// @raycast.packageName esv
// @raycast.argument1 { "type": "text", "placeholder": "Enter a Bible reference", "percentEncoded": true }
// @raycast.argument2 { "type": "text", "placeholder": "none (default), some, or all styling", "optional": true }

// Documentation:
// @raycast.description Call ESV API to copy text to your system clipboard
// @raycast.author Chris
// @raycast.authorURL @cpenned on Twitter

import dotenv from 'dotenv';
import fetch from 'node-fetch';
import clipboard from 'clipboardy';

// Load environment variables from .env file
const result = dotenv.config();
if (result.error) {
  throw result.error;
}
// Get user inputs for passages and styling
const passage = process.argv[2];
const style = process.argv[3].toLowerCase() || 'none';

// Show optional parameters from ESV API at https://api.esv.org/docs/passage-text/
const nonDefaultStyling = {
  references: '&include-passage-references=false',
  verseNumbers: '&include-verse-numbers=false',
  firstVerseNumbers: '&include-first-verse-numbers=false',
  footnotes: '&include-footnotes=false',
  footnoteBody: '&include-footnote-body=false',
  headings: '&include-headings=false',
  shortCopyright: '&include-short-copyright=false',
  copyright: '&include-copyright=true',
  selahs: '&include-selahs=false',
  passageLines: '&include-passage-horizontal-lines=true',
  headingLines: '&include-heading-horizontal-lines=true',
  indentPoetry: '&indent-poetry=false',
  indentPoetryLines: '&indent-poetry-lines=0',
  indentDoxology: '&indent-psalm-doxology=0',
  indentDeclares: '&indent-declares=0',
  indentParagraphs: '&indent-paragraphs=0',
};

// Define selections for personal style groupings
const styleGroups = {
  none: `${nonDefaultStyling.references}${nonDefaultStyling.verseNumbers}${nonDefaultStyling.firstVerseNumbers}${nonDefaultStyling.footnotes}${nonDefaultStyling.footnoteBody}${nonDefaultStyling.shortCopyright}${nonDefaultStyling.headings}${nonDefaultStyling.indentPoetry}${nonDefaultStyling.indentPoetryLines}${nonDefaultStyling.indentDoxology}${nonDefaultStyling.indentDeclares}${nonDefaultStyling.indentParagraphs}`,
  some: `${nonDefaultStyling.footnotes}${nonDefaultStyling.footnoteBody}${nonDefaultStyling.shortCopyright}${nonDefaultStyling.headings}${nonDefaultStyling.indentPoetry}`,
  all: '', // default styling from ESV API
};

// Fetch passage from ESV API with user inputs, copy to clipboard, and notify user
fetch(`https://api.esv.org/v3/passage/text/?q=${passage}${styleGroups[style]}`, {
  method: 'GET',
  headers: {
    Authorization: `${process.env.API_TOKEN}`,
  },
})
  .then((response) => {
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.json();
  })
  .then((data) => {
    clipboard.writeSync(data.passages[0].trim());
    console.log(`The passage is on your clipboard!`);
  })
  .catch((error) => {
    console.error('There has been a problem with your fetch operation:', error);
  });
