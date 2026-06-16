from adapters.jsonld_base import JSONLDSiteAdapter


class BudgetBytesSiteAdapter(JSONLDSiteAdapter):
    site_id = "budgetbytes"
    sitemap_url = "https://www.budgetbytes.com/post-sitemap.xml"
    url_filter = "budgetbytes.com"
