# Sitemap Builder

Sitemap Builder is used for creating sitemaps, sitemap indexes and managing the lifecycle of them.

This library can be used to generate xml and text sitemaps

# Using the library

## How to create a simple sitemap
```typescript
//create a new sitemap instance
const sm = new SiteMap(fileStream, { format: 'xml' });

//you must initialize the sitemap, this step creates the header
await sm.initialize(); 

//add links to the sitemap
await sm.add({ loc: 'http://www.example.com/test.html' });

// you must mark the sitemap as done, this step will write the footer
await sm.done();

//close the file
```

## How to create a sitemap with google extensions
```typescript
//create a new sitemap instance, you must include all the extensions you intend to use when adding links
//currently implemented GoogleImageExtension, GoogleNewsExtension, GoogleVideoExtension
const sm = new SiteMap(file, { format: 'xml', extensions: [new GoogleImageExtension()] });

//you must initialize the sitemap, this step creates the header
await sm.initialize();

//add links to the sitemap and additional information through the appropriate extension
await sm.add({
    loc: 'http://www.example.com/test.html'
}, [new GoogleImageExtension({
    loc: 'http://www.example.com/image.jpg'
})]);

// you must mark the sitemap as done, this step will write the footer
await sm.done();

//close the file
```

## How to create a sitemap index
```typescript
const siteMapIndexer = new SiteMapIndex(indexFile, {
      sizeLimit: 45 * 1024 * 1024, //maximum size of sitemap in bytes
      entriesLimit: 45000, //maximum number of entries per sitemap
      siteMapGenerator: async (index) => {
        const filename = `sitemap-${index}.xml`;
        const file = fs.createWriteStream(filename, );
        const siteMap = new SiteMap(file, { format: 'xml' });
        await siteMap.initialize();
        return {
          siteMap: siteMap, //SiteMap instance
          fileName: filename, //fileName of the siteMap (should be FQDN)
          index: index, //
          lastModified: "2021-01-01",
          outputStream: file
        }
      },
      siteMapDone: async (siteMap) => {
        (siteMap.outputStream as fs.WriteStream).close();
      }
    })

    //initialize the sitemap index
    await siteMapIndexer.initialize();

    //add sitemaps
    await siteMapIndexer.add({ loc: 'http://www.example.com/test.html' });

    //mark the end of the sitemap indexer and any open site maps
    await siteMapIndexer.done();

    //close the indexFile
```

# How to manage sitemaps in temporary files
```typescript
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

await fileManager.cleanup();
```

# Robots.TXT
```typescript
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
```

# Testing and Coverage
```bash
npm run test
npm run coverage

=============================== Coverage summary ===============================
Statements   : 90.21% ( 295/327 )
Branches     : 67.56% ( 100/148 )
Functions    : 83.92% ( 94/112 )
Lines        : 90.79% ( 286/315 )
================================================================================
```


# License
This library is MIT licensed.