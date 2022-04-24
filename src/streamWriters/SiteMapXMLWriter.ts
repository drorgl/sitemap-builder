import { Writable } from 'stream'
import { SitemapExtension } from '../extensions/SitemapExtension'
import { ISiteMapEntry } from '../SiteMapEntry'
import { SiteMapWriter } from './SiteMapWriter'

import escape from 'escape-html'
import { IElementWriter, renderEntry } from './XmlElementWriters'

const SITEMAP_HEADER = '<?xml version="1.0" encoding="UTF-8"?>'
// const SITEMAP_URLSET =

const SiteMapXMLElementWriters: { [key: string]: IElementWriter<ISiteMapEntry> } = {
  loc: {
    order: 0,
    writer: (entry) => `<loc>${escape(entry.loc)}</loc>`
  },
  lastmod: {
    order: 1,
    writer: (entry) => `<lastmod>${entry.lastmod}</lastmod>`
  },
  changefreq: {
    order: 2,
    writer: (entry) => `<changefreq>${entry.changefreq}</changefreq>`
  },
  priority: {
    order: 3,
    writer: (entry) => `<priority>${entry.priority}</priority>`
  }
}

export class SiteMapXMLWriter extends SiteMapWriter {
  private writtenLength = 0;

  constructor(private stream: Writable, private extensions?: SitemapExtension[]) {
    super()
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

  public async initialize() {
    this.writtenLength = 0;
    await this.write(SITEMAP_HEADER)

    await this.write('<urlset')
    await this.write(' xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"')
    for (const extension of this.extensions || []) {
      const info = extension.getNamespaceInfo()
      if (info && info.default_name && info.namespace) {
        await this.write(` xmlns:${info.default_name}="${info.namespace}"`)
      }
    }
    await this.write('>')
  }

  public getLength(): number {
    return this.writtenLength + `'</urlset>`.length;
  }

  public async addSiteMapEntry(entry: ISiteMapEntry, extensions?: SitemapExtension[]): Promise<void> {
    await this.write('<url>')

    const elementContents = renderEntry(entry, SiteMapXMLElementWriters)
    await this.write(elementContents)

    // extensions:
    for (const extension of extensions || []) {
      if (!this.extensions?.some(v => v.getNamespaceInfo().namespace === extension.getNamespaceInfo().namespace)) {
        throw new Error(`Extension ${extension.getNamespaceInfo().default_name}/${extension.getNamespaceInfo().namespace} not initialized`)
      }
      await this.write(extension.render())
    }

    await this.write('</url>')
  }

  public async done(): Promise<void> {
    await this.write('</urlset>')
  }
}
