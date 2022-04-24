import { SiteMap } from '../src';
import tmp from 'tmp-promise';
import fs from 'fs';
import { expect } from 'chai'
import 'mocha';
import { GOOGLE_VIDEO_XSD, SITEMAP_XSD, validateXMLXSD } from './xsdvalidator';
import { GoogleVideoExtension } from '../src/extensions/GoogleVideo';
import { GoogleVideoPlatforms, GoogleVideoRelationship } from '../src/extensions/Google';

describe('google video', () => {
  it('should render a basic sitemap and pass schema validation', async () => {
    const tmpFileInfo = await tmp.file();
    const file = fs.createWriteStream('', { fd: tmpFileInfo.fd });
    const sm = new SiteMap(file, { format: 'xml', extensions: [new GoogleVideoExtension()] });
    await sm.initialize();
    await sm.add({
      loc: 'http://www.example.com/test.html'
    }, [new GoogleVideoExtension({
      thumbnail_loc: 'http://www.example.com/thumbnail.jpeg',
      title: 'title',
      description: 'description',
      content_loc: 'http://www.example.com/content.mpeg',
      player_loc: 'http://www.example.com/player'
    })]);

    await sm.done();
    file.close();

    const fileContents = (await fs.promises.readFile(tmpFileInfo.path)).toString();
    expect(fileContents).to.eq('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:video="http://www.google.com/schemas/sitemap-video/1.1"><url><loc>http://www.example.com/test.html</loc><video:video><video:thumbnail_loc>http://www.example.com/thumbnail.jpeg</video:thumbnail_loc><video:title>title</video:title><video:description>description</video:description><video:content_loc>http://www.example.com/content.mpeg</video:content_loc><video:player_loc>http://www.example.com/player</video:player_loc></video:video></url></urlset>');
    expect(await validateXMLXSD([SITEMAP_XSD, GOOGLE_VIDEO_XSD], fileContents)).to.be.true;

    await tmpFileInfo.cleanup();
  })

  it('should render a full sitemap and pass schema validation', async () => {
    const tmpFileInfo = await tmp.file();
    const file = fs.createWriteStream('', { fd: tmpFileInfo.fd });
    const sm = new SiteMap(file, { format: 'xml', extensions: [new GoogleVideoExtension()] });
    await sm.initialize();
    await sm.add({
      loc: 'http://www.example.com/test.html'
    }, [new GoogleVideoExtension({
      thumbnail_loc: 'http://www.example.com/thumbnail.jpeg',
      title: 'title',
      description: 'description',
      content_loc: 'http://www.example.com/content.mpeg',
      player_loc: 'http://www.example.com/player',
      category: 'category 1',
      duration: 128,
      expiration_date: '2022-01-02',
      family_friendly: 'yes',
      gallery_loc: 'http://www.example.com/gallery',
      live: 'yes',
      platform: {
        relationship: GoogleVideoRelationship.ALLOW,
        platforms: [GoogleVideoPlatforms.MOBILE]
      },
      price: [
        {
          price: 1.2,
          currency: 'USD',
          resolution: 'hd',
          type: 'rent'
        }
      ],
      publication_date: '2021-01-02',
      rating: 1,
      requires_subscription: 'yes',
      restriction: {
        relationship: GoogleVideoRelationship.ALLOW,
        countries: ['US']
      },
      tag: ['tag1'],
      uploader: {
        name: 'uploader name',
        info: 'http://www.example.com/uploader'
      },
      view_count: 1222
    })]);

    await sm.done();
    file.close();

    const fileContents = (await fs.promises.readFile(tmpFileInfo.path)).toString();
    expect(fileContents).to.eq('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:video="http://www.google.com/schemas/sitemap-video/1.1"><url><loc>http://www.example.com/test.html</loc><video:video><video:thumbnail_loc>http://www.example.com/thumbnail.jpeg</video:thumbnail_loc><video:title>title</video:title><video:description>description</video:description><video:content_loc>http://www.example.com/content.mpeg</video:content_loc><video:player_loc>http://www.example.com/player</video:player_loc><video:duration>128</video:duration><video:expiration_date>2022-01-02</video:expiration_date><video:rating>1</video:rating><video:view_count>1222</video:view_count><video:publication_date>2021-01-02</video:publication_date><video:tag>tag1</video:tag><video:category>category 1</video:category><video:family_friendly>yes</video:family_friendly><video:restriction relationship="allow">US</video:restriction><video:gallery_loc>http://www.example.com/gallery</video:gallery_loc><video:price resolution="hd" currency="USD" type="rent">1.2</video:price><video:requires_subscription>yes</video:requires_subscription><video:uploader info="http://www.example.com/uploader">uploader name</video:uploader><video:platform relationship="allow">mobile</video:platform><video:live>yes</video:live></video:video></url></urlset>');
    expect(await validateXMLXSD([SITEMAP_XSD, GOOGLE_VIDEO_XSD], fileContents)).to.be.true;

    await tmpFileInfo.cleanup();
  })
});
