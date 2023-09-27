import { TydToken } from "./tydToken";

export interface ITydLexer {
  getNextToken(): TydToken;
  getTokens(): Generator<TydToken>;
}
