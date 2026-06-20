from adapters.jsonld_base import JSONLDSiteAdapter


class SallysBakingSiteAdapter(JSONLDSiteAdapter):
    site_id = "sallysbaking"
    sitemap_url = "https://sallysbakingaddiction.com/post-sitemap.xml"
    url_filter = "sallysbakingaddiction.com"
