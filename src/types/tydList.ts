import { TydRecordValue } from "./tydRecord";
import { ITydTable } from "./tydTable";

export interface ITydList {
  identifier: string;
  values: (Omit<ITydTable, "identifier"> | TydRecordValue)[];
}