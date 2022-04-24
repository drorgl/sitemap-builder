import { Writable } from 'stream'

import { SitemapExtension } from './extensions/SitemapExtension'
import { ISiteMapEntry } from './SiteMapEntry'
import { SiteMapTextWriter } from './streamWriters/SiteMapTextWriter'
import { SiteMapWriter } from './streamWriters/SiteMapWriter'
import { SiteMapXMLWriter } from './streamWriters/SiteMapXMLWriter'

interface ISiteMapOptions {
    format?: 'xml' | 'text';
    baseUrl?: string;
    extensions?: SitemapExtension[];
}

const DEFAULT_OPTIONS: ISiteMapOptions = {
  format: 'xml',
  baseUrl: 'http://www.example.com/'
}

export class SiteMap {
    private entries = 0;
    private writer: SiteMapWriter = new SiteMapWriter();

    constructor (private outputStream: Writable, private opts?: ISiteMapOptions) {
      this.opts = Object.assign({}, DEFAULT_OPTIONS, opts)
    }

    public async initialize () {
      switch (this.opts?.format) {
        case 'text':
          this.writer = new SiteMapTextWriter(this.outputStream)
          break
        case 'xml':
          this.writer = new SiteMapXMLWriter(this.outputStream, this.opts.extensions)
          break
        default:
          throw new Error(`format ${this.opts?.format} not implemented`)
      }

      await this.writer.initialize()
      this.entries = 0;
    }

    public async add (entry: ISiteMapEntry, extensions?: SitemapExtension[]) {
      // check if entry url is under baseurl, otherwise throw error
      if (!entry.loc.startsWith(this.opts?.baseUrl || '')) {
        throw new Error(`${entry.loc} is not under ${this.opts?.baseUrl}`)
      }
      await this.writer.addSiteMapEntry(entry, extensions)
      this.entries++;
    }

    public getNumberOfEntries(){
      return this.entries;
    }

    public getLength() : number{
      return this.writer.getLength();
    }

    public async done () {
      await this.writer.done()
    }
}
