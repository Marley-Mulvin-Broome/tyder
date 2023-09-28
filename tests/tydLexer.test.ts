import { test, describe } from "node:test";
import assert from "node:assert";
import { TydLexer, TydToken, TydTokenType } from "../src";
import { open } from "node:fs/promises";

type TydTokenTestData = [string, string, TydToken[]][]

const hasTokens = (lexer: TydLexer, expectedTokens: TydToken[]) => {
  for (const expectedToken of expectedTokens) {
    const nextToken = lexer.getNextToken();

    assert.strictEqual(nextToken.value, expectedToken.value);
    assert.strictEqual(nextToken.type, expectedToken.type);

    // Don't compare line and column numbers
  }
};

const runLexerTestData = (data: TydTokenTestData) => {
  for (const [name, input, expectedTokens] of data) {
    test(name, () => {
      const lexer = new TydLexer(input);
    
      hasTokens(lexer, expectedTokens);
    });
  }
};

describe("Valid Cases", () => {
  describe("Isolated Strings", () => {
    const isolatedStringTests: TydTokenTestData = [
      [ "Empty String",  "", [
        {
          type: TydTokenType.EOF,
          value: '',
          lineNumber: 0,
          columnNumber: 0,
        }
      ]]
    ];

    runLexerTestData(isolatedStringTests);

    describe("Records", () => {
      const recordTestData: TydTokenTestData = [
        ["Identifier", "identifier", [
          {
            type: TydTokenType.Identifier,
            value: "identifier",
            lineNumber: 0,
            columnNumber: 0,
          }
        ]],
        ["Identifier with Number", "identifier123", [
          {
            type: TydTokenType.Identifier,
            value: "identifier123",
            lineNumber: 0,
            columnNumber: 0,
          }
        ]],
        ["Identifier with Underscore", "identifier_123", [
          {
            type: TydTokenType.Identifier,
            value: "identifier_123",
            lineNumber: 0,
            columnNumber: 0,
          }
        ]],
        ["Identifier Attribute", "*source", [
          {
            type: TydTokenType.AttributeIdentifier,
            value: "*source",
            lineNumber: 0,
            columnNumber: 0,
          }
        ]],
        ["Null Record", "null", [
          {
            type: TydTokenType.Null,
            value: "null",
            lineNumber: 0,
            columnNumber: 0,
          }
        ]]
      ];

      runLexerTestData(recordTestData);
    });
    describe("Comments", () => {
      const commentTestData: TydTokenTestData = [
        ["Comment", "# This is a comment", [
          {
            type: TydTokenType.Comment,
            value: "# This is a comment",
            lineNumber: 0,
            columnNumber: 0,
          }
        ]]
      ];

      runLexerTestData(commentTestData);
    });

    describe("Brackets & Braces", () => {
      const braceTestData: TydTokenTestData = [
        ["Open Brace", "{", [
          {
            type: TydTokenType.OpenBrace,
            value: "{",
            lineNumber: 0,
            columnNumber: 0,
          }
        ]],
        ["Close Brace", "}", [
          {
            type: TydTokenType.CloseBrace,
            value: "}",
            lineNumber: 0,
            columnNumber: 0,
          }
        ]],
        ["Open Square Bracket", "[", [
          {
            type: TydTokenType.OpenSquareBracket,
            value: "[",
            lineNumber: 0,
            columnNumber: 0,
          }
        ]],
        ["Close Square Bracket", "]", [
          {
            type: TydTokenType.CloseSquareBracket,
            value: "]",
            lineNumber: 0,
            columnNumber: 0,
          }
        ]],
      ];

      runLexerTestData(braceTestData);
    });

    describe("Statement Terminator", () => {
      const statementTerminatorTestData: TydTokenTestData = [
        ["Semi-colon", ";", [
          {
            type: TydTokenType.StatementTerminator,
            value: ";",
            lineNumber: 0,
            columnNumber: 0,
          }
        ]],
        ["Newline", "\n", [
          {
            type: TydTokenType.StatementTerminator,
            value: "\n",
            lineNumber: 0,
            columnNumber: 0,
          }
        ]]
      ];

      test("Semi-colon", () => {
        const lexer = new TydLexer(";");

        const tokens: TydToken[] = [
          {
            type: TydTokenType.StatementTerminator,
            value: ";",
            lineNumber: 0,
            columnNumber: 0,
          }
        ];

        hasTokens(lexer, tokens);
      });
    });

    describe("Whitespace", () => {
      const whitespaceTestData: TydTokenTestData = [
        ["Space", " ", [
          {
            type: TydTokenType.EOF,
            value: "",
            lineNumber: 0,
            columnNumber: 0,
          }
        ]],
        ["Tab", "\t", [
          {
            type: TydTokenType.EOF,
            value: "",
            lineNumber: 0,
            columnNumber: 0,
          }
        ]],
        ["Tab, Spaces", "\t ", [
          {
            type: TydTokenType.EOF,
            value: "",
            lineNumber: 0,
            columnNumber: 0,
          }
        ]],
      ];

      runLexerTestData(whitespaceTestData);
    });

    describe("Strings", () => {
      const stringTestData: TydTokenTestData = [
        ["Empty String", '""', [
          {
            type: TydTokenType.String,
            value: '',
            lineNumber: 0,
            columnNumber: 0,
          }
        ]],
        ["Single Character String", '"a"', [
          {
            type: TydTokenType.String,
            value: 'a',
            lineNumber: 0,
            columnNumber: 0,
          }
        ]],
        ["Multi Character String", '"abc"', [
          {
            type: TydTokenType.String,
            value: 'abc',
            lineNumber: 0,
            columnNumber: 0,
          }
        ]],
        ["Spaces", '"We like cats"', [
          {
            type: TydTokenType.String,
            value: 'We like cats',
            lineNumber: 0,
            columnNumber: 0,
          }
        ]],
        ["Backslashes", '"\\\\"', [
          {
            type: TydTokenType.String,
            value: '\\',
            lineNumber: 0,
            columnNumber: 0,
          }
        ]],
        ["Escaped Quotes", '"\\""', [
          {
            type: TydTokenType.String,
            value: '"',
            lineNumber: 0,
            columnNumber: 0,
          }
        ]],
        ["Escaped Newlines", '"\\n"', [
          {
            type: TydTokenType.String,
            value: '\n',
            lineNumber: 0,
            columnNumber: 0,
          }
        ]],
        ["Escaped Hash", '"\\#"', [
          {
            type: TydTokenType.String,
            value: '#',
            lineNumber: 0,
            columnNumber: 0,
          }
        ]],
        ["Escaped Semicolon", '"\\;"', [
          {
            type: TydTokenType.String,
            value: ';',
            lineNumber: 0,
            columnNumber: 0,
          }
        ]],
        ["Escaped Tab", '"\\t"', [
          {
            type: TydTokenType.String,
            value: '\t',
            lineNumber: 0,
            columnNumber: 0,
          }
        ]],
        ["Escaped Carriage Return", '"\\r"', [
          {
            type: TydTokenType.String,
            value: '\r',
            lineNumber: 0,
            columnNumber: 0,
          }
        ]],
        ["Escaped Close Square Bracket", '"\\]"', [
          {
            type: TydTokenType.String,
            value: ']',
            lineNumber: 0,
            columnNumber: 0,
          }
        ]],
        ["Escaped Close Brace", '"\\}"', [
          {
            type: TydTokenType.String,
            value: '}',
            lineNumber: 0,
            columnNumber: 0,
          }
        ]],
        ["Escaped Quotes in String", '"\\"Hello\\""', [
          {
            type: TydTokenType.String,
            value: '"Hello"',
            lineNumber: 0,
            columnNumber: 0,
          }
        ]],
      ];

      runLexerTestData(stringTestData);
    });

    describe("Numbers", () => {
      const numberTestData: TydTokenTestData = [
        ["Zero", "0", [
          {
            type: TydTokenType.Number,
            value: "0",
            lineNumber: 0,
            columnNumber: 0,
          }
        ]],
        ["Positive Integer", "123", [
          {
            type: TydTokenType.Number,
            value: "123",
            lineNumber: 0,
            columnNumber: 0,
          }
        ]],
        ["Negative Integer", "-123", [
          {
            type: TydTokenType.Number,
            value: "-123",
            lineNumber: 0,
            columnNumber: 0,
          }
        ]],
        ["Positive Float", "123.456", [
          {
            type: TydTokenType.Number,
            value: "123.456",
            lineNumber: 0,
            columnNumber: 0,
          }
        ]],
        ["Negative Float", "-123.456", [
          {
            type: TydTokenType.Number,
            value: "-123.456",
            lineNumber: 0,
            columnNumber: 0,
          }
        ]],
      ];

      runLexerTestData(numberTestData);

    });
  });

  describe("Multi-statement lines", () => {
    test("Singleline List", () => {
      const lexer = new TydLexer("Submarkets\t[1; 2; 3]");

      const tokens: TydToken[] = [
        {
          type: TydTokenType.Identifier,
          value: "Submarkets",
          lineNumber: 0,
          columnNumber: 0,
        },
        {
          type: TydTokenType.OpenSquareBracket,
          value: "[",
          lineNumber: 0,
          columnNumber: 11,
        },
        {
          type: TydTokenType.Number,
          value: "1",
          lineNumber: 0,
          columnNumber: 12,
        },
        {
          type: TydTokenType.StatementTerminator,
          value: ";",
          lineNumber: 0,
          columnNumber: 13,
        },
        {
          type: TydTokenType.Number,
          value: "2",
          lineNumber: 0,
          columnNumber: 15,
        },
        {
          type: TydTokenType.StatementTerminator,
          value: ";",
          lineNumber: 0,
          columnNumber: 16,
        },
        {
          type: TydTokenType.Number,
          value: "3",
          lineNumber: 0,
          columnNumber: 18,
        },
        {
          type: TydTokenType.CloseSquareBracket,
          value: "]",
          lineNumber: 0,
          columnNumber: 19,
        },
      ];

      hasTokens(lexer, tokens);
    });

    test("Multiple Records", () => {
      const lexer = new TydLexer("length\t10.5cm; width 5.5cm; calories 800");

      const tokens: TydToken[] = [
        {
          type: TydTokenType.Identifier,
          value: "length",
          lineNumber: 0,
          columnNumber: 0,
        },
        {
          type: TydTokenType.Identifier,
          value: "10.5cm",
          lineNumber: 0,
          columnNumber: 7,
        },
        {
          type: TydTokenType.StatementTerminator,
          value: ";",
          lineNumber: 0,
          columnNumber: 12,
        },
        {
          type: TydTokenType.Identifier,
          value: "width",
          lineNumber: 0,
          columnNumber: 14,
        },
        {
          type: TydTokenType.Identifier,
          value: "5.5cm",
          lineNumber: 0,
          columnNumber: 20,
        },
        {
          type: TydTokenType.StatementTerminator,
          value: ";",
          lineNumber: 0,
          columnNumber: 25,
        },
        {
          type: TydTokenType.Identifier,
          value: "calories",
          lineNumber: 0,
          columnNumber: 27,
        },
        {
          type: TydTokenType.Number,
          value: "800",
          lineNumber: 0,
          columnNumber: 36,
        },
      ];

      hasTokens(lexer, tokens);
    });
  });

  // This is to test the lexer can handle real world files without lexing error
  test("Read Big File", async (t) => {
    const fileContents = await open("./tests/test.tyd", "r");

    t.after = () => {
      fileContents.close();
    };

    const lexer = new TydLexer((await fileContents.readFile()).toString("utf-8"));

    assert.doesNotThrow(() => {
      while (lexer.hasMoreTokens) {
        lexer.getNextToken();
      }
    });
  });
});

describe("Invalid Cases", () => {
  test("Escaping a character that doesn't need escaping", () => {
    const lexer = new TydLexer('"\\a"');
    
    assert.throws(() => {
      lexer.getNextToken();
    }, {
      name: "LexerError",
    });
  });

  for (const illegalName of ["@record", "$coolrecord", "record!"]) {
    test(`Illegal character(s) in record name '${illegalName}'`, () => {
      const lexer = new TydLexer(illegalName);

      assert.throws(() => {
        while (lexer.hasMoreTokens) {
          lexer.getNextToken();
        }
      }, {
        name: "LexerError",
      });
    });
  }
  
});