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

chai.use(chaiAsPromised)

describe('sitemap', () => {
  it('should render a basic text sitemap and pass schema validation', async () => {
    const tmpFileInfo = await tmp.file();
    const file = fs.createWriteStream('', { fd: tmpFileInfo.fd });
    const sm = new SiteMap(file, { format: 'text' });
    await sm.initialize();
    await sm.add({ loc: 'http://www.example.com/test.html' });

    await sm.done();
    await closeWriteStream(file);

    const fileContents = (await fs.promises.readFile(tmpFileInfo.path)).toString();
    expect(fileContents).to.eq('http://www.example.com/test.html\r\n');

    await tmpFileInfo.cleanup();
  })

  it('should render a basic sitemap and pass schema validation', async () => {
    const tmpFileInfo = await tmp.file();
    const file = fs.createWriteStream('', { fd: tmpFileInfo.fd });
    const sm = new SiteMap(file, { format: 'xml' });
    await sm.initialize();
    await sm.add({ loc: 'http://www.example.com/test.html' });

    await sm.done();
    await closeWriteStream(file);

    const fileContents = (await fs.promises.readFile(tmpFileInfo.path)).toString();
    expect(fileContents).to.eq('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>http://www.example.com/test.html</loc></url></urlset>');

    expect(await validateXMLXSD([SITEMAP_XSD], fileContents)).to.be.true;

    await tmpFileInfo.cleanup();
  })

  it('should render a complete sitemap and pass schema validation', async () => {
    const tmpFileInfo = await tmp.file();
    const file = fs.createWriteStream('', { fd: tmpFileInfo.fd });
    const sm = new SiteMap(file, { format: 'xml' });
    await sm.initialize();
    await sm.add({
      loc: 'http://www.example.com/test.html',
      changefreq: ChangeFreq.DAILY,
      lastmod: '2022-01-01',
      priority: 0.5
    });

    await sm.done();
    await closeWriteStream(file);

    const fileContents = (await fs.promises.readFile(tmpFileInfo.path)).toString();
    expect(fileContents).to.eq('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>http://www.example.com/test.html</loc><lastmod>2022-01-01</lastmod><changefreq>daily</changefreq><priority>0.5</priority></url></urlset>');

    expect(await validateXMLXSD([SITEMAP_XSD], fileContents)).to.be.true;

    await tmpFileInfo.cleanup();
  })

  it('should throw an error if adding a resource which is not under the root', async () => {
    const tmpFileInfo = await tmp.file();
    const file = fs.createWriteStream('', { fd: tmpFileInfo.fd });
    const sm = new SiteMap(file, { format: 'xml', baseUrl: 'http://example.com/subfolder' });
    await sm.initialize();

    await expect((async () => {
      await sm.add({
        loc: 'http://www.example.com/test.html'
      });
    })()).to.be.rejectedWith('is not under');

    await sm.done();
    await closeWriteStream(file);

    await tmpFileInfo.cleanup();
  })

  it('should throw an error if adding an item with extension not in the extension initialization', async () => {
    const tmpFileInfo = await tmp.file();
    const file = fs.createWriteStream('', { fd: tmpFileInfo.fd });
    const sm = new SiteMap(file, { format: 'xml', extensions: [] });
    await sm.initialize();

    await expect((async () => {
      await sm.add({
        loc: 'http://www.example.com/test.html'
      }, [new GoogleImageExtension({
        loc: 'http://www.example.com/image.jpg'
      })]);
    })()).to.be.rejectedWith('not initialized');

    await sm.done();
    await closeWriteStream(file);

    await tmpFileInfo.cleanup();
  })
});
