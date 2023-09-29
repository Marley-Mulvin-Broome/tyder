import { ITydAst } from "./tydAst";
import { ITydLexer } from "./tydLexer";

export interface ITydParser {
  parse(lexer: ITydLexer): ITydAst;
}