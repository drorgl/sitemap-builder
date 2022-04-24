import { SiteMap } from '../src';
import tmp from 'tmp-promise';
import fs from 'fs';
import { expect } from 'chai'
import 'mocha';
import { GOOGLE_NEWS_XSD, SITEMAP_XSD, validateXMLXSD } from './xsdvalidator';
import { GoogleNewsExtension } from '../src/extensions/GoogleNews';

describe('google news', () => {
  it('should render a basic sitemap and pass schema validation', async () => {
    const tmpFileInfo = await tmp.file();
    const file = fs.createWriteStream('', { fd: tmpFileInfo.fd });
    const sm = new SiteMap(file, { format: 'xml', extensions: [new GoogleNewsExtension()] });
    await sm.initialize();
    await sm.add({
      loc: 'http://www.example.com/test.html'
    }, [new GoogleNewsExtension({
      publication: {
        language: 'en',
        name: 'msnbc'
      },
      publication_date: '2022-01-01',
      title: 'testing article'
    })]);

    await sm.done();
    file.close();

    const fileContents = (await fs.promises.readFile(tmpFileInfo.path)).toString();
    expect(fileContents).to.eq('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"><url><loc>http://www.example.com/test.html</loc><news:news><news:publication><news:name>msnbc</news:name><news:language>en</news:language></news:publication><news:publication_date>2022-01-01</news:publication_date><news:title>testing article</news:title></news:news></url></urlset>');
    expect(await validateXMLXSD([SITEMAP_XSD, GOOGLE_NEWS_XSD], fileContents)).to.be.true;

    await tmpFileInfo.cleanup();
  })
});
