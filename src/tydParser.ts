import ParserError from "./parserError";
import { ITydAst, ITydAstNode } from "./types/tydAst";
import { TydAttribute } from "./types/tydAttribute";
import { ITydLexer } from "./types/tydLexer";
import { ITydParser } from "./types/tydParser";
import { TydToken } from "./types/tydToken";
import { TydTokenType } from "./types/tydTokenType";

// TODO: Implement with an AST to allow for things like comments to be saved
// This is a very basic implementation of the parser and will change in the future

export class TydParser implements ITydParser {
  #parseAttributes(tokens: TydToken[]): TydAttribute[] {
    const attributes: TydAttribute[] = [];

    for (const token of tokens) {
      if (token.type !== TydTokenType.Identifier && token.type !== TydTokenType.AttributeIdentifier) {
        throw new ParserError(`Expected attribute identifier or identifier @ ${token.lineNumber}:${token.columnNumber} not ${token.type}`);
      }

      if (token.type === TydTokenType.Identifier) {
        if (attributes.length === 0) {
          throw new ParserError(`Expected attribute identifier @ ${token.lineNumber}:${token.columnNumber} not ${token.type}`);
        }

        // add to previous
        attributes[attributes.length - 1].value = token.value;
        continue;
      }

      attributes.push({
        identifier: token.value,
        value: "",
      });
    }

    return attributes;
  }

  #parseTableHead(tokens: TydToken[]): [string, TydAttribute[]] {
    if (tokens[0].type !== TydTokenType.Identifier) {
      throw new ParserError(`Expected table identifier @ ${tokens[0].lineNumber}:${tokens[0].columnNumber} not ${tokens[0].type}`);
    }

    return [tokens[0].value, this.#parseAttributes(tokens.slice(1))];
  }

  #parseTable(lexer: ITydLexer, targetNode: ITydAstNode) {
    while (lexer.hasMoreTokens) {
      let tokens = lexer.getNextStatement();

      if (tokens.length === 0) {
        continue;
      }

      if (tokens[0].type === TydTokenType.CloseBrace) {
        // End of table
        return;
      }

      if (tokens[0].type === TydTokenType.EOF) {
        throw new ParserError(`Unexpected EOF @ ${tokens[0].lineNumber}:${tokens[0].columnNumber}, expected '}'`);
      }

      const nextToken = lexer.peek();


      // Table cases
      // Has '{' last token or next one

      if (tokens[-1].type === TydTokenType.OpenBrace || nextToken.type === TydTokenType.OpenBrace) {
        if (nextToken.type === TydTokenType.OpenBrace) {
          // Need to skip the '{'
          lexer.getNextToken();
        }

        const head = this.#parseTableHead(tokens);
        const node: ITydAstNode = {
          value: {
            identifier: head[0],
            attributes: head[1],
            tables: [],
            records: [],
          },
          children: [],
        };

        this.#parseTable(lexer, node);

        targetNode.children.push(node);
        continue;
      } 

      // List cases
      // Has '[' in statement or is next token



      // Record cases
      // The rest

      if (tokens.length > 2) {
        const toCombine = tokens.splice(1, -1);

        tokens = [
          tokens[0],
          {
            type: TydTokenType.Identifier,
            value: toCombine.map(token => token.value).join(" "),
            lineNumber: toCombine[0].lineNumber,
            columnNumber: toCombine[0].columnNumber,
          },
        ];
      } else if (tokens.length === 1) {
        // TODO: Handle this xD
      }

      let value: string | number | null = tokens[1].value;

      if (tokens[1].type === TydTokenType.Number) {
        value = Number(value);
      } else if (tokens[1].type === TydTokenType.Null) {
        value = null;
      }

      targetNode.children.push({
        value: {
          identifier: tokens[0].value,
          value: value,
        },
        children: [],
      });
    }
  }

  /**
   * Parses a lexed TyD file into an AST
   * @param lexer ITydLexer to parse
   * @returns ITydTable of root table
   */
  parse(lexer: ITydLexer): ITydAst {
    const rootAstNode: ITydAst = {
      root: {
        value: {
          identifier: "$root",
          attributes: [],
          tables: [],
          records: [],
        },
        children: [],
      },
    };

    this.#parseTable(lexer, rootAstNode.root);

    return rootAstNode;
  }

}