import { TydToken } from "./tydToken";
import { TydTokenType } from "./tydTokenType";

export interface ITydLexer {
  getNextToken(): TydToken;
  getNextStatement(): TydToken[];
  peek(): TydToken;
  getTokens(): Generator<TydToken>;
  get hasMoreTokens(): boolean;
}
