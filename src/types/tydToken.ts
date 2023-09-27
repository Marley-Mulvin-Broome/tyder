import {TydTokenType} from "./tydTokenType";

export interface TydToken {
  type: TydTokenType;
  value: string;
  lineNumber: number;
  columnNumber: number;
};
