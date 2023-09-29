import { test, describe } from "node:test";
import assert from "node:assert";
import { ITydAstNode } from "../src/types/tydAst";
import { TydParser } from "../src/tydParser";
import { TydLexer } from "../src";

type TydParserTestData = [string, string, ITydAstNode[]][];

const runParserTestData = (data: TydParserTestData) => {
  for (const [name, input, expectedNode] of data) {
    test(name, () => {
      const lexer = new TydLexer(input);
      const parser = new TydParser();

      const result = parser.parse(lexer);

      assert.deepStrictEqual(result.root.children, expectedNode);
    });
  }
};

describe("TydParser", () => {
  describe("Valid cases", () => {
    const validCasesData: TydParserTestData = [
      ["Empty file", "", []],
      ["Random whitespace", " \t\n   ", []],
    ];

    runParserTestData(validCasesData);

    describe("Tables", () => {
      const tableCasesData: TydParserTestData = [
        ["Empty table", "Cat\n{\n}", [
          {
            value: {
              identifier: "Cat",
              attributes: [],
              tables: [],
              records: []
            },
            children: [],
          },
        ]],
        ["Empty table one line", "Cat {}", [
          {
            value: {
              identifier: "Cat",
              attributes: [],
              tables: [],
              records: []
            },
            children: [],
          }
        ]],
        ["Empty table with attributes", "Cat *abstract\n{\n}", [
          {
            value: {
              identifier: "Cat",
              attributes: [ { identifier: "*abstract", value: undefined } ],
              tables: [],
              records: []
            },
            children: [],
          }
        ]],
        ["Empty table with attributes one line", "Cat *abstract {}", [
          {
            value: {
              identifier: "Cat",
              attributes: [ { identifier: "*abstract", value: undefined } ],
              tables: [],
              records: []
            },
            children: [],
          }
        ]],
        ["Empty table with attribute value", "Cat *source Potato {\n}\n", [
          {
            value: {
              identifier: "Cat",
              attributes: [ { identifier: "*source", value: "Potato" } ],
              tables: [],
              records: []
            },
            children: [],
          }
        ]],
        ["Empty table with attribute value one line", "Cat *source Potato {}", [
          {
            value: {
              identifier: "Cat",
              attributes: [ { identifier: "*source", value: "Potato" } ],
              tables: [],
              records: []
            },
            children: [],
          }
        ]],
        ["Empty table with multiple attributes", "Cat *source Potato *abstract {\n}\n", [
          {
            value: {
              identifier: "Cat",
              attributes: [ { identifier: "*source", value: "Potato" }, { identifier: "*abstract", value: undefined } ],
              tables: [],
              records: []
            },
            children: [],
          }
        ]],
        ["Empty table with multiple attributes one line", "Cat *source Potato *abstract {}", [
          {
            value: {
              identifier: "Cat",
              attributes: [ { identifier: "*source", value: "Potato" }, { identifier: "*abstract", value: undefined } ],
              tables: [],
              records: []
            },
            children: [],
          }
        ]],
      ];

      runParserTestData(tableCasesData);
    });

    describe("Records", () => {
      const recordCasesData: TydParserTestData = [
        ["Root record naked string", "Cat potato", [
          {
            value: {
              identifier: "Cat",
              value: "potato"
            },
            children: []
          }
        ]],
        ["Root record number", "Cat 2", [
          {
            value: {
              identifier: "Cat",
              value: 2
            },
            children: []
          }
        ]],
        ["Root record null", "Cat null", [
          {
            value: {
              identifier: "Cat",
              value: null
            },
            children: []
          }
        ]],
        ["Root record string", "Cat \"potato\"", [
          {
            value: {
              identifier: "Cat",
              value: "potato"
            },
            children: []
          },
        ]],
        ["Record in table", "Cat\n{\nPotato \"potato\"\n}", [
          {
            value: {
              identifier: "Cat",
              attributes: [],
              tables: [],
              records: []
            },
            children: [
              {
                value: {
                  identifier: "Potato",
                  value: "potato"    
                },
                children: []
              }
            ]
          }
        ]],
        // ["Record in table one line", "Cat { Potato \"potato\" }", [
        //   {
        //     value: {
        //       identifier: "Cat",
        //       attributes: [],
        //       tables: [],
        //       records: []
        //     },
        //     children: [
        //       {
        //         value: {
        //           identifier: "Potato",
        //           value: "potato"
        //         },
        //         children: []
        //       }
        //     ]
        //   }
        // ]],
        ["Inline root records", "Cat potato; Tree sea", [
          {
            value: {
              identifier: "Cat",
              value: "potato"
            },
            children: []
          },
          {
            value: {
              identifier: "Tree",
              value: "sea"
            },
            children: []
          }
        ]],
      ];

      runParserTestData(recordCasesData);

      describe("Lists", () => {
        const listCasesData: TydParserTestData = [
          ["Root list inline", "Cat [potato; sea]", [
            {
              value: {
                identifier: "Cat",
                values: [ "potato", "sea" ]
              },
              children: []
            }
          ]],
          ["Root list multiline", "Cat [\n  potato\n  sea\n]", [
            {
              value: {
                identifier: "Cat",
                values: [ "potato", "sea" ]
              },
              children: []
            }
          ]],
          ["Root list bracket second line", "Cat\n[\n potato\n sea\n]", [
            {
              value: {
                identifier: "Cat",
                values: [ "potato", "sea" ]
              },
              children: []
            }
          ]],
          ["Inline list in table", "Table\n{\n  Cat [potato; sea]\n}", [
            {
              value: {
                identifier: "Table",
                attributes: [],
                tables: [],
                records: []
              },
              children: [
                {
                  value: {
                    identifier: "Cat",
                    values: [ "potato", "sea" ]
                  },
                  children: []
                }
              ]
            }
          ]],
          ["Multiline list in table", "Table\n{\n  Cat [\n    potato\n    sea\n  ]\n}", [
            {
              value: {
                identifier: "Table",
                attributes: [],
                tables: [],
                records: []
              },
              children: [
                {
                  value: {
                    identifier: "Cat",
                    values: [ "potato", "sea" ]
                  },
                  children: []
                }
              ]
            }
          ]]
        ];

        runParserTestData(listCasesData);
      });
    });

    describe("Comments", () => {
      const commentCasesData: TydParserTestData = [
        ["Root comment", "# This is a comment", [
          {
            value: {
              value: "# This is a comment"
            },
            children: []
          }
        ]],
        ["Empty table with comment", "Cat\n{\n# This is a comment\n}", [
          {
            value: {
              identifier: "Cat",
              attributes: [],
              tables: [],
              records: []
            },
            children: [
              {
                value: {
                  value: "# This is a comment"
                },
                children: []
              }
            ]
          }],
        ],
      ];

      runParserTestData(commentCasesData);
    });
  });
});