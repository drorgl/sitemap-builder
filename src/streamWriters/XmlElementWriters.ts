
export interface IElementWriter<TEntry> {
    order: number;
    writer: (entry: TEntry) => string;
}

export function ElementWritersOrderCompare<TEntry> (a: IElementWriter<TEntry>, b: IElementWriter<TEntry>) {
  if (a.order < b.order) {
    return -1
  }
  if (a.order > b.order) {
    return 1
  }
  return 0
}

export function renderEntry<TEntry> (entry: TEntry, elementWriters: { [key: string]: IElementWriter<TEntry> }): string {
  let contents = ''
  const writers = Object.keys(entry).map(key => elementWriters[key]).filter(v => v).sort(ElementWritersOrderCompare)
  for (const element of writers) {
    contents += element.writer(entry)
  }

  return contents
}
