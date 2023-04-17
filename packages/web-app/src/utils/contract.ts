import {assert} from 'console';

export interface BlockNatspec {
  [tag: string]: string | Record<string, string>;
}
export interface Natspec {
  [key: string]: BlockNatspec;
}

export function extractNatspec(sourceCode: string): Natspec {
  const multilineNatspecPattern =
    /\/\*\*\s*\n(?:\s*\*(?:\s*@(\w+)(?:\s+([^*\n]+))?)?\s*\n)+\s*\*\//g;
  const singleLineNatspecPattern = /\/\/\/\s*@(\w+)(?:\s+([^/\n]+))?\s*\n/g;
  const contractFunctionPattern =
    /\s*(contract|function|error|event|constructor)\s+([A-Za-z0-9_]+)/;
  const natspecTags: Natspec = {};

  const isInComment = (sourceCodeBefore: string) => {
    const prevNewlinePos = sourceCodeBefore.lastIndexOf('\n');
    const prevLineComment = sourceCodeBefore.lastIndexOf('///');
    const prevBodyCommentStart = sourceCodeBefore.lastIndexOf('/*');
    const prevBodyCommentEnd = sourceCodeBefore.lastIndexOf('*/');
    const isInLineComment = prevLineComment > prevNewlinePos;
    const isInBodyComment = prevBodyCommentEnd < prevBodyCommentStart;
    console.log(
      `inLine ${isInLineComment} inBody ${isInBodyComment} text:${sourceCodeBefore}`
    );
    return isInLineComment || isInBodyComment;
  };

  const processNatspecComment = (
    natspecComment: string,
    sourceCodeAfterComment: string
  ) => {
    let contractFunctionMatch = contractFunctionPattern.exec(
      sourceCodeAfterComment
    );

    // rematch if the contract/function match was in a comment
    for (;;) {
      if (!contractFunctionMatch) {
        return;
      }

      const keywordPos = contractFunctionMatch[0].indexOf(
        contractFunctionMatch[1]
      );

      if (
        !isInComment(
          sourceCodeAfterComment.slice(
            0,
            contractFunctionMatch.index + keywordPos
          )
        )
      ) {
        break;
      }

      sourceCodeAfterComment = sourceCodeAfterComment.slice(
        contractFunctionMatch.index + contractFunctionMatch[0].length
      );
      contractFunctionMatch = contractFunctionPattern.exec(
        sourceCodeAfterComment
      );
    }

    if (!contractFunctionMatch) {
      return;
    }

    const contractFunctionName = contractFunctionMatch[2];
    if (!natspecTags[contractFunctionName]) {
      natspecTags[contractFunctionName] = {};
    }

    const tagPattern = /(?:\*|\s*\/\/\/)?\s*@(\w+)(?:\s+([^*\n]+))?\s*\n/g;
    let tagMatch: RegExpExecArray | null;

    while ((tagMatch = tagPattern.exec(natspecComment)) !== null) {
      const tagName = tagMatch[1];
      let tagValue = (tagMatch[2] || '').trim();
      if (tagName === 'param') {
        const tagParam = tagValue.split(' ')[0];
        tagValue = tagValue.substring(tagParam.length + 1).trim();

        const existingParam = natspecTags[contractFunctionName][tagName];
        if (existingParam) {
          if (typeof existingParam === 'object') {
            existingParam[tagParam] = tagValue;
          }
        } else {
          natspecTags[contractFunctionName][tagName] = {[tagParam]: tagValue};
        }
      } else {
        natspecTags[contractFunctionName][tagName] = tagValue;
      }
    }
  };

  let natspecMatch: RegExpExecArray | null;

  while ((natspecMatch = multilineNatspecPattern.exec(sourceCode)) !== null) {
    const natspecComment = natspecMatch[0];
    const sourceCodeAfterComment = sourceCode.slice(
      natspecMatch.index + natspecComment.length
    );
    processNatspecComment(natspecComment, sourceCodeAfterComment);
  }

  while ((natspecMatch = singleLineNatspecPattern.exec(sourceCode)) !== null) {
    const natspecComment = natspecMatch[0];
    const sourceCodeAfterComment = sourceCode.slice(
      natspecMatch.index + natspecComment.length
    );
    processNatspecComment(natspecComment, sourceCodeAfterComment);
  }

  return natspecTags;
}

export interface NatspecDetails {
  keyword: string;
  name: string;
  tags: {
    [tag: string]: string | Record<string, string>;
  };
}

function concatNatspecDetails(det0: NatspecDetails, det1: NatspecDetails) {
  return {
    keyword: det0.keyword || det1.keyword,
    name: det0.name || det1.name,
    tags: Object.assign({}, det0.tags, det1.tags),
  };
}

function scanWord(source: string, pos: number): [number, string] {
  const nextSpaceIdx = source.indexOf(' ', pos);
  return [nextSpaceIdx, source.substring(pos, nextSpaceIdx)];
}

export function scanNatspecBlock(
  source: string,
  pos: number,
  terminator: string
): [number, NatspecDetails] {
  let match = '';
  const scanMatches = ['\n'];
  let nextPos = -1;
  let ended = false;
  if (terminator) scanMatches.push(terminator);
  const details = {
    keyword: '',
    tags: {},
  } as NatspecDetails;

  let prevPos = pos;
  [match, pos] = scanFirst(source, pos, ['@', ...scanMatches]);

  let tag = '';
  let param = '';

  while (pos >= 0 && !ended) {
    if (match === '@') {
      [pos, tag] = scanWord(source, pos);
      if (tag === 'param') {
        pos = skipWhitespace(source, pos);
        [pos, param] = scanWord(source, pos);
      }
      pos = skipWhitespace(source, pos);

      let posEnd: number;
      [match, posEnd] = scanFirst(source, pos, scanMatches);
      if (match === terminator || pos < 0) {
        ended = true;
      }

      const comment = source.substring(pos, posEnd).trim();

      if (tag === 'param') {
        if (details.tags[tag]) {
          const params = details.tags[tag] as Record<string, string>;
          params[param] = comment;
        } else {
          details.tags[tag] = {[param]: comment};
        }
      } else {
        details.tags[tag] = comment;
      }

      pos = posEnd;
    } else if (match === terminator) {
      ended = true;
    } else if (match === '\n') {
      if (tag) {
        const line = source.substring(prevPos, pos).trim();
        const currentTag = details.tags[tag];
        if (typeof currentTag === 'object') {
          currentTag[param] += '\n' + line;
        } else {
          details.tags[tag] += '\n' + line;
        }
      }
    }

    if (terminator === '') {
      [match, nextPos] = scanFirst(source, pos, ['///', '\n']);
      if (match === '\n' || nextPos < 0) {
        ended = true;
      } else {
        pos = nextPos;
      }
    }

    if (ended) break;

    prevPos = pos;
    [match, pos] = scanFirst(source, pos, ['@', ...scanMatches]);
  }

  return [pos, details];
}

export function extractNatspec2(source: string) {
  let pos = 0,
    posEnd = 0;
  let match = '';
  const natspec = {} as Record<string, NatspecDetails>;
  let natspecDetails: NatspecDetails = {
    keyword: '',
    name: '',
    tags: {},
  };
  let newDetails: NatspecDetails;

  while (pos >= 0) {
    [match, pos] = scanFirst(source, pos, [
      '/*',
      '//',
      'contract',
      'function',
      'error',
      'event',
      'constructor',
    ]);

    if (pos < 0) break;

    switch (match) {
      case '/*':
        if (source[pos] === '*') {
          [pos, newDetails] = scanNatspecBlock(source, pos + 1, '*/');
          natspecDetails = concatNatspecDetails(natspecDetails, newDetails);
        } else {
          [match, pos] = scanFirst(source, pos, ['*/']);
        }
        break;
      case '//':
        if (source[pos] === '/') {
          [pos, newDetails] = scanNatspecBlock(source, pos + 1, '');
          natspecDetails = concatNatspecDetails(natspecDetails, newDetails);
        } else {
          [match, pos] = scanFirst(source, pos, ['\n']);
        }
        break;
      default: {
        pos = skipWhitespace(source, pos);
        [, posEnd] = scanFirst(source, pos, [' ', '(']);
        if (pos < 0) break;
        natspecDetails.name = source.substring(pos, posEnd - 1);
        natspecDetails.keyword = match;
        natspec[natspecDetails.name] = natspecDetails;
        natspecDetails = {
          keyword: '',
          name: '',
          tags: {},
        };
        pos = posEnd;
        break;
      }
    }
  }

  return natspec;
}

/** Starts scanning str at start to find the first match from searches. If multiple matches complete at the
 * same position in str, it prefers the one which is listed first in searches.
 */
export const scanFirst = (
  str: string,
  start: number,
  searches: string[]
): [string, number] => {
  const matches: [number, number][] = [];
  for (let idx = start; idx < str.length; idx++) {
    for (let matchIdx = 0; matchIdx < matches.length; matchIdx++) {
      const [srchIdx, pos] = matches[matchIdx];
      if (searches[srchIdx][pos + 1] === str[idx]) {
        matches[matchIdx][1]++;
        if (pos + 2 === searches[srchIdx].length) {
          return [searches[srchIdx], idx + 1];
        }
      } else {
        matches.splice(matchIdx, 1);
        matchIdx--;
      }
    }

    for (let srchIdx = 0; srchIdx < searches.length; srchIdx++) {
      if (searches[srchIdx][0] === str[idx]) {
        matches.push([srchIdx, 0]);
        if (1 === searches[srchIdx].length) {
          return [searches[srchIdx], idx + 1];
        }
      }
    }
  }
  return ['', -1];
};

type QuoteChars = "'" | '"' | '`';

const scanCloseJsString = (str: string, start: number, quote: QuoteChars) => {
  const escaped = '\\' + quote;
  let [match, pos] = [escaped, start];
  while (match === escaped) {
    [match, pos] = scanFirst(str, pos, [escaped, quote]);
  }
  return pos;
};

export const scanCloseJsBracket = (
  str: string,
  start: number,
  brackets: string
) => {
  let [match, pos] = ['', start];
  const quotes = '\'"`';
  while (match !== brackets[1] && pos > 0) {
    [match, pos] = scanFirst(str, pos, [brackets[0], brackets[1], ...quotes]);
    if (quotes.includes(match) && pos > 0) {
      pos = scanCloseJsString(str, pos, match as QuoteChars);
    } else if (match === brackets[0]) {
      pos = scanCloseJsBracket(str, pos, brackets);
    }
  }
  return pos;
};

export const skipWhitespace = (str: string, start: number) => {
  let pos = start;
  while (' \t\n\r\v'.indexOf(str[pos]) > -1 && pos < str.length) pos++;
  return pos;
};
