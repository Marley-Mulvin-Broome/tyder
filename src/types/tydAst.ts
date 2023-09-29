import { ITydComment } from "./tydComment";
import { ITydList } from "./tydList";
import { ITydRecord, TydRecordValue } from "./tydRecord";
import { ITydTable } from "./tydTable";

export type TydAstValue = ITydRecord<TydRecordValue> | ITydTable | ITydComment | ITydList;

export interface ITydAstNode {
  value: TydAstValue;
  children: ITydAstNode[];
}

export interface ITydAst {
  root: ITydAstNode;
}