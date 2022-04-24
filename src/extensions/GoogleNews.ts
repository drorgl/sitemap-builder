/*
example:
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
  <url>
   <loc>http://www.example.org/business/article55.html</loc>
   <news:news>
   <news:publication>
     <news:name>The Example Times</news:name>
     <news:language>en</news:language>
   </news:publication>
   <news:publication_date>2008-12-23</news:publication_date>
     <news:title>Companies A, B in Merger Talks</news:title>
    </news:news>
  </url>
</urlset>
*/
import escape from 'escape-html'
import { IElementWriter, renderEntry } from '../streamWriters/XmlElementWriters'
import { INamespaceInfo, SitemapExtension } from './SitemapExtension'

interface IGoogleNewsPublication{
    /**
     * The <name> tag is the name of the news publication. It must exactly match the name as it appears on your articles on news.google.com, except for anything in parentheses.
     */
    name:string;

    /**
     * The <language> tag is the language of your publication. Use an ISO 639 language code (two or three letters).
     * http://www.loc.gov/standards/iso639-2/php/code_list.php
     *
     * Exception: For Simplified Chinese, use zh-cn and for Traditional Chinese, use zh-tw.
     */
    language: string;
}

export interface IGoogleNewsEntry {
    /**
     * The publication where the article appears.
     */
    publication: IGoogleNewsPublication;

    /**
     * The article publication date in W3C format.
     * Use either the "complete date" format (YYYY-MM-DD) or the "complete date plus hours, minutes, and seconds" format with time zone designator format (YYYY-MM-DDThh:mm:ssTZD).
     * Specify the original date and time when the article was published on your site.
     * Don't specify the time when you added the article to your sitemap.
     *
     * The Google News crawler accepts any of the following formats:
     * Complete date: YYYY-MM-DD (1997-07-16)
     * Complete date plus hours and minutes: YYYY-MM-DDThh:mmTZD (1997-07-16T19:20+01:00)
     * Complete date plus hours, minutes, and seconds: YYYY-MM-DDThh:mm:ssTZD (1997-07-16T19:20:30+01:00)
     * Complete date plus hours, minutes, seconds, and a decimal fraction of a second: YYYY-MM-DDThh:mm:ss.sTZD (1997-07-16T19:20:30.45+01:00)
     *
     */
    publication_date: string;

    /**
     * The title of the news article.
     *
     * Tip: Google may shorten the title of the news article for space reasons when displaying the article on Google News.
     * Include the title of the article as it appears on your site.
     * Don't include the author name, publication name, or publication date in the News sitemap <title> tag.
     */
    title:string;
}

const GoogleNewsXMLElementWriters: { [key: string]: IElementWriter<IGoogleNewsEntry> } = {
  publication: {
    order: 0,
    writer: (entry) => `<news:publication><news:name>${escape(entry.publication.name)}</news:name><news:language>${escape(entry.publication.language)}</news:language></news:publication>`
  },
  publication_date: {
    order: 0,
    writer: (entry) => `<news:publication_date>${entry.publication_date}</news:publication_date>`
  },
  title: {
    order: 0,
    writer: (entry) => `<news:title>${escape(entry.title)}</news:title>`
  }
}

export class GoogleNewsExtension extends SitemapExtension {
  constructor (private opts?: IGoogleNewsEntry) {
    super()
  }

  public getNamespaceInfo (): INamespaceInfo {
    return {
      default_name: 'news',
      namespace: 'http://www.google.com/schemas/sitemap-news/0.9'
    }
  }

  public render (): string {
    let contents = ''
    if (this.opts) {
      const keys = Object.keys(this.opts)
      if (keys.length > 0) {
        contents += '<news:news>'
        contents += renderEntry(this.opts, GoogleNewsXMLElementWriters)
        contents += '</news:news>'
      }
    }

    return contents
  }
}
