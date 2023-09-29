import { TydAttribute } from "./tydAttribute";
import { ITydRecord, TydRecordValue } from "./tydRecord";

export interface ITydTable {
  identifier: string;
  attributes?: TydAttribute[];
  tables: ITydTable[];
  records:  ITydRecord<TydRecordValue>[];
}