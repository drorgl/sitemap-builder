import { Writable } from 'stream'

import { SitemapExtension } from '../extensions/SitemapExtension'
import { ISiteMapEntry } from '../SiteMapEntry'
import { SiteMapWriter } from './SiteMapWriter'

export class SiteMapTextWriter extends SiteMapWriter {
  private writtenLength = 0;

  constructor(private stream: Writable) {
    super()
  }

  public async initialize(): Promise<void> {
    this.writtenLength = 0;
  }

  public getLength(): number {
    return this.writtenLength;
  }

  private async write(chunk: string) {
    return new Promise<void>((resolve, reject) => {
      this.stream.write(chunk, (err) => {
        this.writtenLength += chunk.length;
        if (err) {
          return reject(err)
        }

        return resolve()
      })
    })
  }


  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async addSiteMapEntry(entry: ISiteMapEntry, extensions?: SitemapExtension[]) {
    await this.write(`${entry.loc}\r\n`);
  }

  public async done(): Promise<void> {
    //nop
  }
}
