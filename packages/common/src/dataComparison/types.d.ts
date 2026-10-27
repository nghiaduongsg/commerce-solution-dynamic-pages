export type DataDiffsState = { [_: string]: Array<string> | undefined };

export interface SetDiffsAction {
  diffs: DataDiffsState;
}
