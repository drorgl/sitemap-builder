import libxmljs from 'libxmljs';

export interface XSDInfo {
    namespace: string;
    schemaLocation: string;
}

export const SITEMAPINDEX_XSD: XSDInfo = {
  namespace: 'http://www.sitemaps.org/schemas/sitemap/0.9',
  schemaLocation: 'siteindex.xsd'
}

export const SITEMAP_XSD: XSDInfo = {
  namespace: 'http://www.sitemaps.org/schemas/sitemap/0.9',
  schemaLocation: 'sitemap.xsd'
}

export const GOOGLE_IMAGE_XSD: XSDInfo = {
  namespace: 'http://www.google.com/schemas/sitemap-image/1.1',
  schemaLocation: 'sitemap-image.xsd'
}

export const GOOGLE_NEWS_XSD: XSDInfo = {
  namespace: 'http://www.google.com/schemas/sitemap-news/0.9',
  schemaLocation: 'sitemap-news.xsd'
}

export const GOOGLE_VIDEO_XSD: XSDInfo = {
  namespace: 'http://www.google.com/schemas/sitemap-video/1.1',
  schemaLocation: 'sitemap-video.xsd'
}

export async function validateXMLXSD (xsds: XSDInfo[], xmlContents: string) {
  let xsdAggregate = '<?xml version="1.0" encoding="UTF-8"?><xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema">';
  for (const xsd of xsds) {
    xsdAggregate += `<xs:import namespace="${xsd.namespace}" schemaLocation="${xsd.schemaLocation}"/>`;
  }
  xsdAggregate += '</xs:schema>';

  // console.log("verifying xml", xmlContents);
  // console.log("verifying xsd", xsdAggregate);

  const xsdDoc = libxmljs.parseXmlString(xsdAggregate, { baseUrl: 'test/data/' });
  const xmlDoc = libxmljs.parseXmlString(xmlContents);
  const isValid = xmlDoc.validate(xsdDoc);
  if (!isValid) {
    console.log(xmlDoc.validationErrors);
  }
  return isValid;
}
