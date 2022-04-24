import { Writable } from 'stream'

import escape from 'escape-html'
import {ISiteMapIndexEntry} from "../SiteMapIndexEntry";

/*
<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
   <sitemap>
      <loc>http://www.example.com/sitemap1.xml.gz</loc>
      <lastmod>2004-10-01T18:23:17+00:00</lastmod>
   </sitemap>
   <sitemap>
      <loc>http://www.example.com/sitemap2.xml.gz</loc>
      <lastmod>2005-01-01</lastmod>
   </sitemap>
</sitemapindex>
*/

const SITEMAP_HEADER = '<?xml version="1.0" encoding="UTF-8"?>'

export class SiteMapIndexXMLWriter  {
  constructor (private stream: Writable) {
  }

  private async write (chunk: string) {
    return new Promise<void>((resolve, reject) => {
      this.stream.write(chunk, (err) => {
        if (err) {
          return reject(err)
        }

        return resolve()
      })
    })
  }

  public async initialize () {
    await this.write(SITEMAP_HEADER)

    await this.write('<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">')
  }

  public async addSiteMap (entry: ISiteMapIndexEntry): Promise<void> {
    await this.write(`<sitemap><loc>${escape(entry.loc)}</loc><lastmod>${entry.lastmod}</lastmod></sitemap>`);
  }

  public async done (): Promise<void> {
    await this.write('</sitemapindex>')
  }
}
