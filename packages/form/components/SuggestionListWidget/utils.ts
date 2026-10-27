const COMPARISON_KEYWORDS = ['equal', 'greater', 'less'];
const COMPARISON_REGEX_PATTERN = COMPARISON_KEYWORDS.join('|');

export const SUGGESTION_REGEX = new RegExp(
  `(?<=\\bAND\\b|\\bOR\\b|\\bNOT\\b(?!\\s+(?:${COMPARISON_REGEX_PATTERN})\\b)|\\(|\\))\\s+|\\s+(?=\\bAND\\b|\\bOR\\b|\\bNOT\\b(?!\\s+(?:${COMPARISON_REGEX_PATTERN})\\b)|\\(|\\))`,
  'i',
);

export const getMatchingSuggestion = (
  word: string,
  suggestions: any[],
  options?: { inputKey: string; outputKey: string },
): any => {
  if (options) {
    const { inputKey, outputKey } = options;

    const matchingSuggestion = suggestions.find((suggestion) => {
      return (
        suggestion[inputKey] && (suggestion[inputKey] as string).toLowerCase() == word.toLowerCase()
      );
    });

    return matchingSuggestion ? matchingSuggestion[outputKey] : word;
  }

  return word;
};

export const transformValue = (value: string, suggestions: Array<any>, options) => {
  return value
    ?.split(SUGGESTION_REGEX)
    .map((word) => getMatchingSuggestion(word, suggestions, options))
    .join(' ');
};
