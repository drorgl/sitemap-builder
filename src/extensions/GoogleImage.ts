/*
example:

<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  <url>
    <loc>http://example.com/sample1.html</loc>
    <image:image>
      <image:loc>http://example.com/image.jpg</image:loc>
    </image:image>
    <image:image>
      <image:loc>http://example.com/photo.jpg</image:loc>
    </image:image>
  </url>
  <url>
    <loc>http://example.com/sample2.html</loc>
    <image:image>
      <image:loc>http://example.com/picture.jpg</image:loc>
      <image:caption>A funny picture of a cat eating cabbage</image:caption>
      <image:geo_location>Lyon, France</image:geo_location>
      <image:title>Cat vs Cabbage</image:title>
      <image:license>http://example.com/image-license</image:license>
    </image:image>
  </url>
</urlset>
*/
import escape from 'escape-html'
import { IElementWriter, renderEntry } from '../streamWriters/XmlElementWriters'
import { INamespaceInfo, SitemapExtension } from './SitemapExtension'

export interface IGoogleImageEntry {
  /**
   * The URL of the image.
   * In some cases, the image URL may not be on the same domain as your main site.
   * This is fine, as long as both domains are verified in Search Console.
   *
   * If, for example, you use a content delivery network such as Google Sites to host your images, make sure that the hosting site is verified in Search Console.
   * In addition, make sure that your robots.txt file doesn't disallow the crawling of any content you want indexed.
   */
  loc: string;

  /**
   * A caption for the image.
   */
  caption?: string;

  /**
   * The geographic location of the image.
   *
   * For example, <image:geo_location>Limerick, Ireland</image:geo_location>.
   */
  geo_location?: string;

  /**
   * The title of the image.
   */
  title?: string;

  /**
   * A URL to the license of the image.
   * You can use image metadata instead, if you like. (https://developers.google.com/search/docs/advanced/appearance/image-rights-metadata)
   */
  license?: string;
}

const GoogleImageXMLElementWriters: { [key: string]: IElementWriter<IGoogleImageEntry> } = {
  loc: {
    order: 0,
    writer: (entry) => `<image:loc>${escape(entry.loc)}</image:loc>`
  },
  caption: {
    order: 1,
    writer: (entry) => `<image:caption>${escape(entry.caption)}</image:caption>`
  },
  geo_location: {
    order: 2,
    writer: (entry) => `<image:geo_location>${escape(entry.geo_location)}</image:geo_location>`
  },
  title: {
    order: 3,
    writer: (entry) => `<image:title>${escape(entry.title)}</image:title>`
  },
  license: {
    order: 4,
    writer: (entry) => `<image:license>${escape(entry.license)}</image:license>`
  }
}

export class GoogleImageExtension extends SitemapExtension {
  constructor (private opts?: IGoogleImageEntry) {
    super()
  }

  public getNamespaceInfo (): INamespaceInfo {
    return {
      default_name: 'image',
      namespace: 'http://www.google.com/schemas/sitemap-image/1.1'
    }
  }

  public render (): string {
    let contents = ''
    if (this.opts) {
      const keys = Object.keys(this.opts)
      if (keys.length > 0) {
        contents += '<image:image>'
        contents += renderEntry(this.opts, GoogleImageXMLElementWriters)
        contents += '</image:image>'
      }
    }

    return contents
  }
}
