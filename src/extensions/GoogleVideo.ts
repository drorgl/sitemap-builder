/*
example:
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
   <url>
     <loc>http://www.example.com/videos/some_video_landing_page.html</loc>
     <video:video>
       <video:thumbnail_loc>http://www.example.com/thumbs/123.jpg</video:thumbnail_loc>
       <video:title>Grilling steaks for summer</video:title>
       <video:description>Alkis shows you how to get perfectly done steaks every
         time</video:description>
       <video:content_loc>
          http://streamserver.example.com/video123.mp4</video:content_loc>
       <video:player_loc>
         http://www.example.com/videoplayer.php?video=123</video:player_loc>
       <video:duration>600</video:duration>
       <video:expiration_date>2021-11-05T19:20:30+08:00</video:expiration_date>
       <video:rating>4.2</video:rating>
       <video:view_count>12345</video:view_count>
       <video:publication_date>2007-11-05T19:20:30+08:00</video:publication_date>
       <video:family_friendly>yes</video:family_friendly>
       <video:restriction relationship="allow">IE GB US CA</video:restriction>
       <video:price currency="EUR">1.99</video:price>
       <video:requires_subscription>yes</video:requires_subscription>
       <video:uploader
         info="http://www.example.com/users/grillymcgrillerson">GrillyMcGrillerson
       </video:uploader>
       <video:live>no</video:live>
     </video:video>
   </url>
</urlset>
*/

import escape from 'escape-html'
import { IElementWriter, renderEntry } from '../streamWriters/XmlElementWriters'
import { GoogleVideoPlatforms, GoogleVideoRelationship } from './Google'
import { INamespaceInfo, SitemapExtension } from './SitemapExtension'

// const NAMESPACE = "http://www.google.com/schemas/sitemap-video/1.1";

// interface IGoogleVideoSiteMapEntry extends ISiteMapEntry {
//   /**
//    * Specifies the host page where one or more videos are hosted.
//    * When a user clicks on a video result in Google Search, they are sent to this page.
//    * This URL must be a unique within the sitemap.
//    * This tag is defined by the basic sitemaps format.
//    *
//    * For multiple videos on a single page, create a single <loc> tag for the page, with a child <video> element for each video on that page.
//    */
//   loc: string
// }

interface IGoogleVideoEntryRestriction {
  /**
   * Whether the video is allowed or denied in search results in the specified countries.
   * Supported values are allow or deny.
   * If allow, listed countries are allowed, unlisted countries are denied;
   * if deny, listed countries are denied, unlisted countries are allowed.
   */
  relationship: GoogleVideoRelationship;
  /**
   * country codes in ISO 3166 format.
   * http://wikipedia.org/wiki/ISO_3166
   */
  countries: string[]
}

interface IGoogleVideoEntryPlatform {
  /**
   * specifies whether the video is restricted or permitted for the specified platforms.
   * Supported values are allow or deny.
   * If the allow value is used, any omitted platforms will be denied;
   * if the deny value is used, any omitted platforms will be allowed.
   */
  relationship: GoogleVideoRelationship;
  platforms: GoogleVideoPlatforms[];
}

interface IGoogleVideoEntryPrice {
  price: number;
  /**
   * Specifies the currency in ISO 4217 format.
   * http://en.wikipedia.org/wiki/ISO_4217
   */
  currency: string;

  /**
   * Specifies the purchase option.
   * Supported values are rent and own.
   * If this isn't specified, the default value is own.
   */
  type?: string | 'rent' | 'own';

  /**
   * Specifies the resolution of the purchased version. Supported values are hd and sd.
   */
  resolution?: string | 'hd' | 'sd';

}

interface IGoogleVideoEntryUploader {
  /**
   * The video uploader's name. The string value can be a maximum of 255 characters.
   */
  name: string;

  /**
   * Specifies the URL of a webpage with additional information about this uploader.
   * This URL must be in the same domain as the <loc> tag.
   */
  info?: string;
}

export interface IGoogleVideoEntry {

  /**
   * A URL pointing to the video thumbnail image file.
   *
   * Follow the video thumbnail requirements:
   * https://developers.google.com/search/docs/advanced/guidelines/video#thumbnails
   */
  thumbnail_loc: string;

  /**
   * The title of the video.
   * All HTML entities must be escaped or wrapped in a CDATA block.
   * We recommend that this match the video title displayed on the web page.
   */
  title: string;

  /**
   * A description of the video. Maximum 2048 characters.
   * All HTML entities must be escaped or wrapped in a CDATA block.
   * It must match the description displayed on the web page (it doesn't need to be a word-for-word match).
   */
  description: string;

  /**
   * A URL pointing to the actual video media file. The file must be one of the supported formats. https://developers.google.com/search/docs/advanced/guidelines/video#file-types
   *
   * It's required to provide either a <video:content_loc> or <video:player_loc> tag.
   * We recommend that your provide the <video:content_loc> tag, if possible.
   * This is the most effective way for Google to fetch your video content files.
   * If <video:content_loc> isn't available, provide <video:player_loc> as an alternative.
   *
   * Additional guidelines:
   * - HTML and Flash aren't supported formats.
   * - Must not be the same as the <loc> URL.
   * - This is the equivalent of VideoObject.contentUrl in structured data.
   * - Best practice: If you want to restrict access to your content but still have it crawled, ensure that Googlebot can access your content by using a reverse DNS lookup.
   */
  content_loc: string;

  /**
   * A URL pointing to a player for a specific video.
   * Usually this is the information in the src element of an <embed> tag.
   *
   * It's required to provide either a <video:content_loc> or <video:player_loc> tag.
   * We recommend that your provide the <video:content_loc> tag, if possible.
   * This is the most effective way for Google to fetch your video content files.
   * If <video:content_loc> isn't available, provide <video:player_loc> as an alternative.
   *
   * Additional guidelines:
   * - Must not be the same as the <loc> URL.
   * - For YouTube videos, this value is used rather than video:content_loc. This is the equivalent of VideoObject.embedUrl in structured data.
   * - Best practice: If you want to restrict access to your content but still have it crawled, ensure that Googlebot can access your content by using a reverse DNS lookup.
   */
  player_loc: string;

  /**
   * The duration of the video, in seconds. Value must be from 1 to 28800 (8 hours) inclusive.
   */
  duration?: number;

  /**
   * The date after which the video is no longer be available, in W3C format.
   * Omit this tag if your video does not expire.
   * If present, Google Search won't show your video after this date.
   *
   * Supported values are complete date (YYYY-MM-DD), or complete date plus hours, minutes and seconds, and timezone (YYYY-MM-DDThh:mm:ss+TZD).
   *
   * Example: 2012-07-16T19:20:30+08:00.
   */
  expiration_date?: string;

  /**
   * The rating of the video.
   * Supported values are float numbers in the range 0.0 (low) to 5.0 (high), inclusive.
   */
  rating?: number;

  /**
   * The number of times the video has been viewed.
   */
  view_count?: number;

  /**
   * The date the video was first published, in W3C format.
   * Supported values are complete date (YYYY-MM-DD) or complete date plus hours, minutes and seconds, and timezone (YYYY-MM-DDThh:mm:ss+TZD).
   *
   * Example: 2007-07-16T19:20:30+08:00
   */
  publication_date?: string;

  /**
   * Whether the video is available with SafeSearch.
   * If you omit this tag, the video is available when SafeSearch is turned on.
   *
   * Supported values:
   * - yes: The video is available when SafeSearch is turned on.
   * - no: The video is only available when SafeSearch is turned off.
   */
  family_friendly?: string | 'yes' | 'no';

  /**
   * Whether to show or hide your video in search results from specific countries.
   * Only one <video:restriction> tag can be used for each video.
   *
   * If there is no <video:restriction> tag, Google assumes that the video can be shown in all locations.
   * Note that this tag only affects search results;
   * it doesn't prevent a user from finding or playing your video in a restricted location though other means.
   *
   * Example: This example allows the video search result to be shown only in Canada and Mexico:
   * <video:restriction relationship="allow">CA MX</video:restriction>
   */
  restriction?: IGoogleVideoEntryRestriction;

  /**
   * Whether to show or hide your video in search results on specified platform types.
   * This is a list of space-delimited platform types.
   * Note that this only affects search results on the specified device types;
   * it does not prevent a user from playing your video on a restricted platform.
   *
   * Only one <video:platform> tag can appear for each video.
   * If there is no <video:platform> tag, Google assumes that the video can be played on all platforms.
   *
   * Example: The following example allows users on web or TV, but not mobile devices:
   * <video:platform relationship="allow">web tv</video:platform>
   */
  platform?: IGoogleVideoEntryPlatform;

  /**
   * The price to download or view the video. Omit this tag for videos that are available without payment.
   * More than one <video:price> element can be listed (for example, in order to specify various currencies, purchasing options, or resolutions).
   */
  price?: IGoogleVideoEntryPrice[];

  /**
   * Indicates whether a subscription is required to view the video.
   * Allowed values are yes or no.
   */
  requires_subscription?: string | 'yes' | 'no';

  /**
   * The video uploader's name.
   * Only one <video:uploader> is allowed per video
   */
  uploader?: IGoogleVideoEntryUploader;

  /**
   * Indicates whether the video is a live stream.
   * Supported values are yes or no.
   */
  live?: string | 'yes' | 'no';

  /**
   * An arbitrary string tag describing the video.
   * Tags are generally very short descriptions of key concepts associated with a video or piece of content.
   * A single video could have several tags, although it might belong to only one category.
   * For example, a video about grilling food may belong in the "grilling" category, but could be tagged "steak", "meat", "summer", and "outdoor".
   * Create a new <video:tag> element for each tag associated with a video. A maximum of 32 tags is permitted.
   */
  tag?: string[];

  /**
   * A short description of the broad category that the video belongs to.
   * This is a string no longer than 256 characters.
   * In general, categories are broad groupings of content by subject.
   * Usually a video belongs to a single category.
   * For example, a site about cooking could have categories for broiling, baking, and grilling, and the video could belong to one of those categories.
   */
  category?: string;

  /**
   * Currently not used.
   */
  gallery_loc?: string;
}

const GoogleVideoXMLElementWriters: { [key: string]: IElementWriter<IGoogleVideoEntry> } = {
  thumbnail_loc: {
    order: 0,
    writer: (entry) => `<video:thumbnail_loc>${escape(entry.thumbnail_loc)}</video:thumbnail_loc>`
  },
  title: {
    order: 1,
    writer: (entry) => `<video:title>${escape(entry.title)}</video:title>`
  },
  description: {
    order: 2,
    writer: (entry) => `<video:description>${escape(entry.description)}</video:description>`
  },
  content_loc: {
    order: 3,
    writer: (entry) => `<video:content_loc>${escape(entry.content_loc)}</video:content_loc>`
  },
  player_loc: {
    order: 4,
    writer: (entry) => `<video:player_loc>${escape(entry.player_loc)}</video:player_loc>`
  },
  duration: {
    order: 5,
    writer: (entry) => `<video:duration>${(entry.duration)}</video:duration>`
  },
  expiration_date: {
    order: 6,
    writer: (entry) => `<video:expiration_date>${escape(entry.expiration_date)}</video:expiration_date>`
  },
  rating: {
    order: 7,
    writer: (entry) => `<video:rating>${(entry.rating)}</video:rating>`
  },
  content_segment_loc: {
    order: 8,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    writer: (entry) => { throw new Error(`not implemented`) }
  },
  view_count: {
    order: 9,
    writer: (entry) => `<video:view_count>${(entry.view_count)}</video:view_count>`
  },
  publication_date: {
    order: 10,
    writer: (entry) => `<video:publication_date>${(entry.publication_date)}</video:publication_date>`
  },
  tag: {
    order: 11,
    writer: (entry) => {
      let tags = ''
      for (const tag of entry.tag || []) {
        tags += `<video:tag>${escape(tag)}</video:tag>`
      }
      return tags
    }
  },
  category: {
    order: 12,
    writer: (entry) => `<video:category>${escape(entry.category)}</video:category>`
  },

  family_friendly: {
    order: 13,
    writer: (entry) => `<video:family_friendly>${(entry.family_friendly)}</video:family_friendly>`
  },
  restriction: {
    order: 14,
    writer: (entry) => `<video:restriction relationship="${entry.restriction?.relationship}">${entry.restriction?.countries.join(' ')}</video:restriction>`
  },
  gallery_loc: {
    order: 15,
    writer: (entry) => `<video:gallery_loc>${escape(entry.gallery_loc)}</video:gallery_loc>`
  },
  price: {
    order: 16,
    writer: (entry) => {
      let prices = ''
      for (const price of entry.price || []) {
        let attributes = ''
        if (price.resolution) {
          attributes += ` resolution="${price.resolution}"`
        }
        if (price.currency) {
          attributes += ` currency="${price.currency}"`
        }

        if (price.type) {
          attributes += ` type="${price.type}"`
        }

        prices += `<video:price${attributes}>${price.price}</video:price>`
      }
      return prices
    }
  },
  requires_subscription: {
    order: 17,
    writer: (entry) => `<video:requires_subscription>${escape(entry.requires_subscription)}</video:requires_subscription>`
  },
  uploader: {
    order: 18,
    writer: (entry) => {
      let attributes = ''
      if (entry.uploader?.info) {
        attributes += ` info="${escape(entry.uploader.info)}"`
      }
      return `<video:uploader${attributes}>${escape(entry.uploader?.name)}</video:uploader>`
    }
  },
  tvshow: {
    order: 19,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    writer: (entry) => { throw new Error('not implemented') }
  },
  platform: {
    order: 20,
    writer: (entry) => `<video:platform relationship="${entry.platform?.relationship}">${(entry.platform?.platforms.join(' '))}</video:platform>`
  },
  live: {
    order: 21,
    writer: (entry) => `<video:live>${escape(entry.live)}</video:live>`
  },
  id: {
    order: 22,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    writer: (entry) => { throw new Error('not implemented') }
  }
}

export class GoogleVideoExtension extends SitemapExtension {
  constructor (private opts?: IGoogleVideoEntry) {
    super()
  }

  public getNamespaceInfo (): INamespaceInfo {
    return {
      default_name: 'video',
      namespace: 'http://www.google.com/schemas/sitemap-video/1.1'
    }
  }

  public render (): string {
    let contents = ''
    if (this.opts) {
      const keys = Object.keys(this.opts)
      if (keys.length > 0) {
        contents += '<video:video>'
        contents += renderEntry(this.opts, GoogleVideoXMLElementWriters)
        contents += '</video:video>'
      }
    }

    return contents
  }
}
