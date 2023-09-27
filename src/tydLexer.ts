import type { TydToken } from "./types/tydToken";
import { ITydLexer } from "./types/tydLexer";
import { TydTokenType } from "./types/tydTokenType";
import LexerError from "./lexerError";

/**
 * TODO: Lex verticle strings
 */

const EOF = "EOF";
const RECORD_REGEX = /[a-zA-Z0-9_]/;
const SPECIAL_STARTING_CHARS = ["-", "*", "\\"];

const escapeCharacter = (string: string): string => {
  switch (string) {
  case "#":
  case ";":
  case "{":
  case "}":
  case "[":
  case "]":
  case '"':
    return string;
  case "n":
    return "\n";
  case "r":
    return "\r";
  case "t":
    return "\t";
  case "\\":
    return "\\";
  default:
    throw new LexerError(`Unexpected escape character ${string}`);
  }
};

export default class TydLexer implements ITydLexer {
  #contents: string;

  #previousColumnNumber: number;
  #characterIndex: number;
  #parsingLineNumber: number;
  #parsingColumnNumber: number;

  constructor(contents: string) {
    this.#contents = contents;

    this.#previousColumnNumber = 0;
    this.#characterIndex = 0;
    this.#parsingLineNumber = 0;
    this.#parsingColumnNumber = 0;
  }

  #readUntil(predicate: (character: string) => boolean): string {
    let nextCharacter = this.#stepForward();
    let result = "";
    let escaped = false;

    while (nextCharacter !== EOF) {
      if (!(predicate(nextCharacter) || escaped)) {
        this.#rewind();
        break;
      }

      if (escaped) {
        result += escapeCharacter(nextCharacter);
        escaped = false;
        nextCharacter = this.#stepForward();
      } else if (nextCharacter === "\\") {
        nextCharacter = this.#stepForward();
        escaped = true;
      } else {
        result += nextCharacter;
        nextCharacter = this.#stepForward();
      }
    }

    return result;
  }

  #rewind(): void {
    this.#characterIndex--;
    this.#parsingColumnNumber--;

    if (this.#contents[this.#characterIndex] === "\n") {
      this.#parsingLineNumber--;
      this.#parsingColumnNumber = this.#previousColumnNumber;
    }
  }

  #stepForward(): string {
    if (this.#characterIndex >= this.#contents.length) {
      return EOF;
    }

    const nextCharacter = this.#contents[this.#characterIndex];

    this.#previousColumnNumber = this.#parsingColumnNumber;
    this.#characterIndex++;
    this.#parsingColumnNumber++;

    if (nextCharacter === "\n") {
      this.#parsingLineNumber++;
      this.#parsingColumnNumber = 0;
    }

    return nextCharacter;
  }

  #createToken(type: TydTokenType, value: string): TydToken {
    return {
      type,
      value,
      lineNumber: this.#parsingLineNumber,
      columnNumber: this.#parsingColumnNumber,
    };
  }

  #skipWhitespace(): void {
    this.#readUntil((character) => character === " " || character === "\t");
  }

  #createRecordToken(startingCharacter: string): TydToken {
    const value =
      startingCharacter +
      this.#readUntil((character) => {
        return RECORD_REGEX.test(character) || character === ".";
      });

    // check if is solely a number (optional decimal point)
    if (/^-?\d+.?\d*?$/.test(value)) {
      return this.#createToken(TydTokenType.Number, value);
    } else if (value === "null") {
      return this.#createToken(TydTokenType.Null, value);
    } else if (value.startsWith("*")) {
      return this.#createToken(TydTokenType.AttributeIdentifier, value);
    }

    return this.#createToken(TydTokenType.Identifier, value);
  }

  getNextToken(): TydToken {
    const nextCharacter = this.#stepForward();

    switch (nextCharacter) {
    case EOF:
      return this.#createToken(TydTokenType.EOF, "");
    case "{":
      return this.#createToken(TydTokenType.OpenBrace, nextCharacter);
    case "}":
      return this.#createToken(TydTokenType.CloseBrace, nextCharacter);
    case "[":
      return this.#createToken(TydTokenType.OpenSquareBracket, nextCharacter);
    case "]":
      return this.#createToken(
        TydTokenType.CloseSquareBracket,
        nextCharacter,
      );
    case ";":
      return this.#createToken(
        TydTokenType.StatementTerminator,
        nextCharacter,
      );
    case "#":
      const value =
          "#" +
          this.#readUntil(
            (character) => character !== "\n" && character !== ";",
          );

      return this.#createToken(TydTokenType.Comment, value);
    case '"':
      const stringValue = this.#readUntil((character) => character !== '"');

      return this.#createToken(TydTokenType.String, stringValue);
    case " ":
    case "\t":
    case "\n":
      this.#skipWhitespace();
      return this.getNextToken();
    default:
      if (
        RECORD_REGEX.test(nextCharacter) ||
          SPECIAL_STARTING_CHARS.includes(nextCharacter)
      ) {
        return this.#createRecordToken(nextCharacter);
      }

      throw new LexerError(
        `Unexpected character '${nextCharacter}' at line ${
          this.#parsingLineNumber
        }, column ${this.#parsingColumnNumber}`,
      );
    }
  }

  *getTokens(): Generator<TydToken> {
    while (this.hasMoreTokens) {
      yield this.getNextToken();
    }
  }

  get hasMoreTokens(): boolean {
    return this.#characterIndex < this.#contents.length;
  }
}
