import { SiteMap } from '../src';
import tmp from 'tmp-promise';
import fs from 'fs';
import { expect } from 'chai'
import 'mocha';
import { GOOGLE_IMAGE_XSD, SITEMAP_XSD, validateXMLXSD } from './xsdvalidator';
import { ChangeFreq } from '../src/SiteMapEntry';
import { GoogleImageExtension } from '../src/extensions/GoogleImage';

describe('google images', () => {
  it('should render a basic sitemap and pass schema validation', async () => {
    const tmpFileInfo = await tmp.file();
    const file = fs.createWriteStream('', { fd: tmpFileInfo.fd });
    const sm = new SiteMap(file, { format: 'xml', extensions: [new GoogleImageExtension()] });
    await sm.initialize();
    await sm.add({
      loc: 'http://www.example.com/test.html'
    }, [new GoogleImageExtension({
      loc: 'http://www.example.com/image.jpg'
    })]);

    await sm.done();
    file.close();

    const fileContents = (await fs.promises.readFile(tmpFileInfo.path)).toString();
    expect(fileContents).to.eq('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"><url><loc>http://www.example.com/test.html</loc><image:image><image:loc>http://www.example.com/image.jpg</image:loc></image:image></url></urlset>');
    expect(await validateXMLXSD([SITEMAP_XSD, GOOGLE_IMAGE_XSD], fileContents)).to.be.true;

    await tmpFileInfo.cleanup();
  })

  it('should render a complete sitemap and pass schema validation', async () => {
    const tmpFileInfo = await tmp.file();
    const file = fs.createWriteStream('', { fd: tmpFileInfo.fd });
    const sm = new SiteMap(file, { format: 'xml', extensions: [new GoogleImageExtension()] });
    await sm.initialize();
    await sm.add({
      loc: 'http://www.example.com/test.html',
      changefreq: ChangeFreq.ALWAYS,
      lastmod: '2022-01-01',
      priority: 0.5
    }, [new GoogleImageExtension({
      loc: 'http://www.example.com/image.jpg',
      caption: 'caption',
      geo_location: 'geo location',
      license: 'license',
      title: 'title'
    })]);

    await sm.done();
    file.close();

    const fileContents = (await fs.promises.readFile(tmpFileInfo.path)).toString();
    expect(fileContents).to.eq('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"><url><loc>http://www.example.com/test.html</loc><lastmod>2022-01-01</lastmod><changefreq>always</changefreq><priority>0.5</priority><image:image><image:loc>http://www.example.com/image.jpg</image:loc><image:caption>caption</image:caption><image:geo_location>geo location</image:geo_location><image:title>title</image:title><image:license>license</image:license></image:image></url></urlset>');
    expect(await validateXMLXSD([SITEMAP_XSD, GOOGLE_IMAGE_XSD], fileContents)).to.be.true;

    await tmpFileInfo.cleanup();
  })
});
