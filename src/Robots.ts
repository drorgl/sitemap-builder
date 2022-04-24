interface IRobotsEntry {
  /**
   * User Agent Comments
   */
  comments?: string[];
  /**
   * identifies which crawler the rules apply to.
   *
   * The user-agent line identifies which crawler rules apply to.
   * See Google's crawlers and user-agent strings for a comprehensive list of user-agent strings you can use in your robots.txt file.
   * https://developers.google.com/search/docs/advanced/crawling/overview-google-crawlers
   *
   * The value of the user-agent line is case-insensitive.
   * 
   * Google Crawlers:
   * https://developers.google.com/search/docs/advanced/crawling/overview-google-crawlers
   * 
   * Bing Crawlers:
   * https://www.bing.com/webmasters/help/which-crawlers-does-bing-use-8c184ec0
   * 
   * Yandex Crawlers:
   * https://yandex.com/support/search/robots/user-agent.html
   * 
   */
  userAgent: string;

  /**
   * The disallow directive specifies paths that must not be accessed by the crawlers identified by the user-agent line the disallow directive is grouped with.
   * Crawlers ignore the directive without a path.
   *
   * Google can't index the content of pages which are disallowed for crawling, but it may still index the URL and show it in search results without a snippet.
   * Learn how to block indexing.
   *
   * The value of the disallow directive is case-sensitive.
   * 
   * The value, if specified, is relative to the root of the website from where the robots.txt file was fetched (using the same protocol, port number, host and domain names). The path value must start with / to designate the root and the value is case-sensitive. 
   * Learn more about URL matching based on path values (https://developers.google.com/search/docs/advanced/robots/robots_txt#url-matching-based-on-path-values). 
   */
  disallow?: string[];

  /**
   * The allow directive specifies paths that may be accessed by the designated crawlers.
   * When no path is specified, the directive is ignored.
   *
   * The value of the allow directive is case-sensitive.
   */
  allow?: string[];

  /**
   * The crawl-delay value is supported by some crawlers to throttle their visits to the host.
   * Since this value is not part of the standard, its interpretation is dependent on the crawler reading it.
   * It is used when the multiple burst of visits from bots is slowing down the host.
   * Yandex interprets the value as the number of seconds to wait between subsequent visits.
   * Bing defines crawl-delay as the size of a time window (from 1 to 30 seconds) during which BingBot will access a web site only once.
   * Google provides an interface in its search console for webmasters, to control the Googlebot's subsequent visits.
   */
  crawlDelay?: number;

  /**
   * Some crawlers (Yandex) support a Host directive, allowing websites with multiple mirrors to specify their preferred domain
   */
  host?: string[];

  /**
   * Google, Bing, and other major search engines support the sitemap field in robots.txt, as defined by sitemaps.org.
   *
   * The value of the sitemap field is case-sensitive.
   *
   * The [value] points to the location of a sitemap or sitemap index file.
   * It must be a fully qualified URL, including the protocol and host, and doesn't have to be URL-encoded.
   * The URL doesn't have to be on the same host as the robots.txt file.
   * You can specify multiple sitemap fields.
   * The sitemap field isn't tied to any specific user agent and may be followed by all crawlers, provided it isn't disallowed for crawling.
   */
  sitemaps?: string[];
}

interface IRobots {
  /**
   * Header Comments
   */
  comments?: string[];

  /**
   * Groups
   */
  entries: IRobotsEntry[];
}

/* user-agent */
export function render_robots_txt(settings: IRobots) {
  let result = "";

  if(settings.comments){
    for (const comment of settings.comments) {
      result += `#${comment}\r\n`;
    }
    result += "\r\n";
  }

  for (const group of settings.entries) {
    if (!group.userAgent) {
      throw new Error("user agent must be specified or use * for all");
    }

    if(group.comments){
      for (const comment of group.comments) {
        result += `#${comment}\r\n`;
      }
    }

    result += `user-agent: ${group.userAgent}\r\n`;

    if (group.crawlDelay) {
      result += `crawl-delay: ${group.crawlDelay}\r\n`;
    }

    if (group.allow) {
      for (const allow of group.allow) {
        result += `allow: ${allow}\r\n`;
      }
    }
    if (group.disallow) {
      for (const disallow of group.disallow) {
        result += `disallow: ${disallow}\r\n`;
      }
    }

    if (group.host) {
      for (const host of group.host) {
        result += `host: ${host}\r\n`;
      }
    }

    if (group.sitemaps) {
      for (const sitemap of group.sitemaps) {
        result += `sitemap: ${sitemap}\r\n`;
      }
    }

    result += "\r\n";

  }
  return result;
}