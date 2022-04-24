export interface INamespaceInfo{
    default_name: string;
    namespace: string;
}

export class SitemapExtension {
  public getNamespaceInfo () : INamespaceInfo {
    throw new Error('not implemented')
  }

  public render (): string {
    throw new Error('not implemented')
  }
}
