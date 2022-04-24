import { SiteMap } from '../src';
import tmp from 'tmp-promise';
import fs from 'fs';
import chai, { expect } from 'chai'
import 'mocha';
import { SITEMAP_XSD, validateXMLXSD } from './xsdvalidator';
import { ChangeFreq } from '../src/SiteMapEntry';
import { GoogleImageExtension } from '../src/extensions/GoogleImage';
import chaiAsPromised from 'chai-as-promised';
import { closeWriteStream } from './closeWriteStream';
import { render_robots_txt } from '../src/Robots';

chai.use(chaiAsPromised)

describe('robots.txt', () => {
    it('should render a simple robots.txt', async () => {
        const robots = render_robots_txt({
            comments: ["Test Robots.txt"],
            entries: [
                {
                    comments: ["All User Agents"],
                    userAgent: "*",
                    crawlDelay: 1,
                    sitemaps: ["http://localhost.com/sitemap.xml"]
                }
            ]
        });
        expect(robots).eq(`#Test Robots.txt\r\n\r\n#All User Agents\r\nuser-agent: *\r\ncrawl-delay: 1\r\nsitemap: http://localhost.com/sitemap.xml\r\n\r\n`);
    });

    it('should render a multi-group robots.txt', async () => {
        const robots = render_robots_txt({
            comments: ["Test Robots.txt"],
            entries: [
                {
                    comments: ["First"],
                    userAgent: "first",
                    crawlDelay: 1,
                    allow: ["/"],
                    host: ["localhost"],
                    sitemaps: ["http://localhost.com/sitemap1.xml"]
                },

                {
                    comments: ["Second"],
                    userAgent: "second",
                    crawlDelay: 2,
                    disallow: ["/backoffice"],
                    sitemaps: ["http://localhost.com/sitemap2.xml"]
                }
            ]
        });
        expect(robots).eq("#Test Robots.txt\r\n\r\n#First\r\nuser-agent: first\r\ncrawl-delay: 1\r\nallow: /\r\nhost: localhost\r\nsitemap: http://localhost.com/sitemap1.xml\r\n\r\n#Second\r\nuser-agent: second\r\ncrawl-delay: 2\r\ndisallow: /backoffice\r\nsitemap: http://localhost.com/sitemap2.xml\r\n\r\n");
    });
})