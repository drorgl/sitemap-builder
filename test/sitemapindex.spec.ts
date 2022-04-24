import fs from "fs";
import { SiteMap, SiteMapIndex, TemporaryFileManager } from "../src";
import { closeWriteStream } from "./closeWriteStream";
import tmp from 'tmp-promise';
import 'mocha';
import chai, { expect } from 'chai'
import chaiAsPromised from 'chai-as-promised';
import { SITEMAPINDEX_XSD, SITEMAP_XSD, validateXMLXSD } from "./xsdvalidator";
chai.use(chaiAsPromised)

describe('sitemap index', () => {
  it("should render a basic sitemap and pass schema validation", async () => {
    const indexTmpFileInfo = await tmp.file();
    const indexFile = fs.createWriteStream('', { fd: indexTmpFileInfo.fd });

    let lastSiteMapPhysicalFilename = "";

    const siteMapIndexer = new SiteMapIndex(indexFile, {
      sizeLimit: 1024,
      entriesLimit: 2,
      siteMapGenerator: async (index) => {
        const filename = `sitemap-${index}.xml`;
        const tmpSiteMap = await tmp.file();
        lastSiteMapPhysicalFilename = tmpSiteMap.path;
        const file = fs.createWriteStream('', { fd: tmpSiteMap.fd });
        const siteMap = new SiteMap(file, { format: 'xml' });
        await siteMap.initialize();
        return {
          siteMap: siteMap,
          fileName: filename,
          index: index,
          lastModified: "2021-01-01",
          outputStream: file
        }
      },
      siteMapDone: async (siteMap) => {
        await closeWriteStream(siteMap.outputStream as fs.WriteStream);
        const siteMapContents = (await fs.promises.readFile(lastSiteMapPhysicalFilename)).toString();
        expect(siteMapContents).to.eq(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>http://www.example.com/test.html</loc></url></urlset>`);
      }
    })

    await siteMapIndexer.initialize();

    await siteMapIndexer.add({ loc: 'http://www.example.com/test.html' });

    await siteMapIndexer.done();

    await closeWriteStream(indexFile);


    const indexFileContents = (await fs.promises.readFile(indexTmpFileInfo.path)).toString();
    expect(indexFileContents).to.eq('<?xml version="1.0" encoding="UTF-8"?><sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><sitemap><loc>sitemap-0.xml</loc><lastmod>2021-01-01</lastmod></sitemap></sitemapindex>');

    expect(await validateXMLXSD([SITEMAPINDEX_XSD], indexFileContents)).to.be.true;

    await indexTmpFileInfo.cleanup();
  })

  it("should request a new sitemap when exceeding url limit", async () => {
    const indexTmpFileInfo = await tmp.file();
    const indexFile = fs.createWriteStream('', { fd: indexTmpFileInfo.fd });

    let lastSiteMapPhysicalFilename = "";

    const siteMapIndexer = new SiteMapIndex(indexFile, {
      sizeLimit: 1024,
      entriesLimit: 2,
      siteMapGenerator: async (index) => {
        const filename = `sitemap-${index}.xml`;
        const tmpSiteMap = await tmp.file();
        lastSiteMapPhysicalFilename = tmpSiteMap.path;
        const file = fs.createWriteStream('', { fd: tmpSiteMap.fd });
        const siteMap = new SiteMap(file, { format: 'xml' });
        await siteMap.initialize();
        return {
          siteMap: siteMap,
          fileName: filename,
          index: index,
          lastModified: "2021-01-01",
          outputStream: file
        }
      },
      siteMapDone: async (siteMap) => {
        await closeWriteStream(siteMap.outputStream as fs.WriteStream);
        const siteMapContents = (await fs.promises.readFile(lastSiteMapPhysicalFilename)).toString();
        expect(await validateXMLXSD([SITEMAP_XSD], siteMapContents)).to.be.true;
      }
    })

    await siteMapIndexer.initialize();

    for (let i = 0; i < 10; i++) {
      await siteMapIndexer.add({ loc: 'http://www.example.com/test.html' });
    }

    await siteMapIndexer.done();

    await closeWriteStream(indexFile);


    const indexFileContents = (await fs.promises.readFile(indexTmpFileInfo.path)).toString();
    expect(indexFileContents).to.eq('<?xml version="1.0" encoding="UTF-8"?><sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><sitemap><loc>sitemap-0.xml</loc><lastmod>2021-01-01</lastmod></sitemap><sitemap><loc>sitemap-1.xml</loc><lastmod>2021-01-01</lastmod></sitemap><sitemap><loc>sitemap-2.xml</loc><lastmod>2021-01-01</lastmod></sitemap><sitemap><loc>sitemap-3.xml</loc><lastmod>2021-01-01</lastmod></sitemap><sitemap><loc>sitemap-4.xml</loc><lastmod>2021-01-01</lastmod></sitemap></sitemapindex>');

    expect(await validateXMLXSD([SITEMAPINDEX_XSD], indexFileContents)).to.be.true;

    await indexTmpFileInfo.cleanup();
  })

  it("should request a new sitemap when exceeding size limit", async () => {
    const indexTmpFileInfo = await tmp.file();
    const indexFile = fs.createWriteStream('', { fd: indexTmpFileInfo.fd });

    let lastSiteMapPhysicalFilename = "";

    const siteMapIndexer = new SiteMapIndex(indexFile, {
      sizeLimit: 200,
      entriesLimit: 10000,
      siteMapGenerator: async (index) => {
        const filename = `sitemap-${index}.xml`;
        const tmpSiteMap = await tmp.file();
        lastSiteMapPhysicalFilename = tmpSiteMap.path;
        const file = fs.createWriteStream('', { fd: tmpSiteMap.fd });
        const siteMap = new SiteMap(file, { format: 'xml' });
        await siteMap.initialize();
        return {
          siteMap: siteMap,
          fileName: filename,
          index: index,
          lastModified: "2021-01-01",
          outputStream: file
        }
      },
      siteMapDone: async (siteMap) => {
        await closeWriteStream(siteMap.outputStream as fs.WriteStream);
        const siteMapContents = (await fs.promises.readFile(lastSiteMapPhysicalFilename)).toString();
        expect(await validateXMLXSD([SITEMAP_XSD], siteMapContents)).to.be.true;
      }
    })

    await siteMapIndexer.initialize();

    for (let i = 0; i < 10; i++) {
      await siteMapIndexer.add({ loc: 'http://www.example.com/test.html' });
    }

    await siteMapIndexer.done();

    await closeWriteStream(indexFile);


    const indexFileContents = (await fs.promises.readFile(indexTmpFileInfo.path)).toString();
    expect(indexFileContents).to.eq('<?xml version="1.0" encoding="UTF-8"?><sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><sitemap><loc>sitemap-0.xml</loc><lastmod>2021-01-01</lastmod></sitemap><sitemap><loc>sitemap-1.xml</loc><lastmod>2021-01-01</lastmod></sitemap><sitemap><loc>sitemap-2.xml</loc><lastmod>2021-01-01</lastmod></sitemap><sitemap><loc>sitemap-3.xml</loc><lastmod>2021-01-01</lastmod></sitemap><sitemap><loc>sitemap-4.xml</loc><lastmod>2021-01-01</lastmod></sitemap></sitemapindex>');

    expect(await validateXMLXSD([SITEMAPINDEX_XSD], indexFileContents)).to.be.true;

    await indexTmpFileInfo.cleanup();
  })


  it("should request a new sitemap when exceeding size limit", async () => {
    const indexTmpFileInfo = await tmp.file();
    const indexFile = fs.createWriteStream('', { fd: indexTmpFileInfo.fd });

    let lastSiteMapPhysicalFilename = "";

    const siteMapIndexer = new SiteMapIndex(indexFile, {
      sizeLimit: 200,
      entriesLimit: 10000,
      siteMapGenerator: async (index) => {
        const filename = `sitemap-${index}.xml`;
        const tmpSiteMap = await tmp.file();
        lastSiteMapPhysicalFilename = tmpSiteMap.path;
        const file = fs.createWriteStream('', { fd: tmpSiteMap.fd });
        const siteMap = new SiteMap(file, { format: 'xml' });
        await siteMap.initialize();
        return {
          siteMap: siteMap,
          fileName: filename,
          index: index,
          lastModified: "2021-01-01",
          outputStream: file
        }
      },
      siteMapDone: async (siteMap) => {
        await closeWriteStream(siteMap.outputStream as fs.WriteStream);
        const siteMapContents = (await fs.promises.readFile(lastSiteMapPhysicalFilename)).toString();
        expect(await validateXMLXSD([SITEMAP_XSD], siteMapContents)).to.be.true;
      }
    })

    await siteMapIndexer.initialize();

    for (let i = 0; i < 10; i++) {
      await siteMapIndexer.add({ loc: 'http://www.example.com/test.html' });
    }

    await siteMapIndexer.done();

    await closeWriteStream(indexFile);


    const indexFileContents = (await fs.promises.readFile(indexTmpFileInfo.path)).toString();
    expect(indexFileContents).to.eq('<?xml version="1.0" encoding="UTF-8"?><sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><sitemap><loc>sitemap-0.xml</loc><lastmod>2021-01-01</lastmod></sitemap><sitemap><loc>sitemap-1.xml</loc><lastmod>2021-01-01</lastmod></sitemap><sitemap><loc>sitemap-2.xml</loc><lastmod>2021-01-01</lastmod></sitemap><sitemap><loc>sitemap-3.xml</loc><lastmod>2021-01-01</lastmod></sitemap><sitemap><loc>sitemap-4.xml</loc><lastmod>2021-01-01</lastmod></sitemap></sitemapindex>');

    expect(await validateXMLXSD([SITEMAPINDEX_XSD], indexFileContents)).to.be.true;

    await indexTmpFileInfo.cleanup();
  })



  it("should manage sitemaps using temporary files", async () => {
    const fileManager = new TemporaryFileManager();

    await fileManager.newTempFile("sitemap.xml");
    const indexFile = await fileManager.createWriteStreamForName("sitemap.xml");

    const siteMapIndexer = new SiteMapIndex(indexFile, {
      sizeLimit: 1024,
      entriesLimit: 2,
      siteMapGenerator: async (index) => {
        const filename = `sitemap-${index}.xml`;
        await fileManager.newTempFile(filename);
        const siteMapFile = await fileManager.createWriteStreamForName(filename);
        const siteMap = new SiteMap(siteMapFile, { format: 'xml' });
        await siteMap.initialize();
        return {
          siteMap: siteMap,
          fileName: filename,
          index: index,
          lastModified: "2021-01-01",
          outputStream: siteMapFile
        }
      },
      siteMapDone: async (siteMap) => {
        await closeWriteStream(siteMap.outputStream as fs.WriteStream);
        const siteMapContents = (await fs.promises.readFile(fileManager.getFile(siteMap.fileName).tmp.path)).toString();
        expect(await validateXMLXSD([SITEMAP_XSD], siteMapContents)).to.be.true;
      }
    })

    await siteMapIndexer.initialize();

    for (let i = 0; i < 10; i++) {
      await siteMapIndexer.add({ loc: 'http://www.example.com/test.html' });
    }

    await siteMapIndexer.done();

    await closeWriteStream(indexFile);


    const indexFileContents = (await fs.promises.readFile(fileManager.getFile("sitemap.xml").tmp.path)).toString();
    expect(await validateXMLXSD([SITEMAPINDEX_XSD], indexFileContents)).to.be.true;

    // console.log(fileManager.getFiles())

    await fileManager.cleanup();
  })
});
