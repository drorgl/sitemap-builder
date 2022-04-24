import { Stream, Writable } from "stream";
import { SitemapExtension } from "./extensions";
import { SiteMap } from "./SiteMap";
import { ISiteMapEntry } from "./SiteMapEntry";
import { ISiteMapIndexEntry } from "./SiteMapIndexEntry";
import { SiteMapIndexXMLWriter } from "./streamWriters/SiteMapIndexXmlWriter";

interface IGeneratedSiteMap {
    index: number;
    siteMap: SiteMap;
    fileName: string;
    outputStream: Stream;
    lastModified: string;
}

interface SiteMapIndexOptions {
    entriesLimit?: number;
    sizeLimit?: number;
    siteMapGenerator: (index: number) => Promise<IGeneratedSiteMap>;
    siteMapDone: (siteMapInfo: IGeneratedSiteMap) => Promise<void>;
}

const DEFAULT_OPTIONS: SiteMapIndexOptions = {
    entriesLimit: 45000,
    sizeLimit: 1024 * 1024 * 45,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    siteMapGenerator: async (index) => { throw new Error('siteMapGenerator must be provided'); },
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    siteMapDone: async (siteMapInfo) => { throw new Error('siteMapDone must be provided'); }
}


export class SiteMapIndex {
    private writer: SiteMapIndexXMLWriter;
    private siteMapIndex = 0;

    private currentSiteMapInfo: IGeneratedSiteMap | null = null
    private currentSiteMap: SiteMap | null = null;

    constructor(private outputStream: Writable, private opts: SiteMapIndexOptions) {
        this.opts = Object.assign(DEFAULT_OPTIONS, opts)
        this.writer = new SiteMapIndexXMLWriter(outputStream);
    }

    public async initialize() {
        await this.writer.initialize();
    }

    public async addSiteMap(entry: ISiteMapIndexEntry) {
        await this.writer.addSiteMap(entry);
    }

    private getEntriesLimit(): number {
        return this.opts.entriesLimit || 0;
    }

    private getSizeLimit(): number {
        return this.opts.sizeLimit || 0;
    }

    public async add(entry: ISiteMapEntry, extensions?: SitemapExtension[]) {
        if (!this.currentSiteMap) {
            this.currentSiteMapInfo = await this.opts.siteMapGenerator(this.siteMapIndex++);
            this.currentSiteMap = this.currentSiteMapInfo.siteMap;
            await this.addSiteMap({ loc: this.currentSiteMapInfo.fileName, lastmod: this.currentSiteMapInfo.lastModified });
        }
        if (this.currentSiteMap) {
            await this.currentSiteMap.add(entry, extensions);
        }

        if (
            (this.currentSiteMap.getNumberOfEntries() >= this.getEntriesLimit()) ||
            (this.currentSiteMap.getLength() >= this.getSizeLimit())) {
            await this.closeSiteMap();

        }
    }

    private async closeSiteMap() {
        if (this.currentSiteMap) {
            await this.currentSiteMap?.done();
            await this.opts?.siteMapDone(this.currentSiteMapInfo as IGeneratedSiteMap);
        }
        this.currentSiteMapInfo = null;
        this.currentSiteMap = null;
    }

    public async done() {
        await this.closeSiteMap();

        await this.writer.done();
    }
}