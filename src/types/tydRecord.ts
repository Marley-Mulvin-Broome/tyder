export type TydRecordValue = string | number | null;

export interface ITydRecord<T extends TydRecordValue> {
  identifier: string;
  value: T;
}