from adapters.jsonld_base import JSONLDSiteAdapter


class CookieAndKateSiteAdapter(JSONLDSiteAdapter):
    site_id = "cookieandkate"
    sitemap_url = "https://cookieandkate.com/post-sitemap.xml"
    url_filter = "cookieandkate.com"
