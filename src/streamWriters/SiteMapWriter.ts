import { SitemapExtension } from '../extensions/SitemapExtension'
import { ISiteMapEntry } from '../SiteMapEntry'

export class SiteMapWriter {
  public async initialize (): Promise<void> {
    throw new Error('Not Implemented')
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async addSiteMapEntry (entry: ISiteMapEntry, extensions?: SitemapExtension[]): Promise<void> {
    throw new Error('Not Implemented')
  }

  public async done (): Promise<void> {
    throw new Error('Not Implemented')
  }

  public getLength() : number{
    throw new Error("Not Implemented");
  }
}
