export type GroupExtractor = (element: Element) => string | null;

export interface Groupable {
  setGroupExtractor(callback: GroupExtractor): void;
  getGroup(): string | null;
}
