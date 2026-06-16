from adapters.wprm_base import WPRMSiteAdapter


class SallysBakingSiteAdapter(WPRMSiteAdapter):
    site_id = "sallysbaking"
    sitemap_url = "https://sallysbakingaddiction.com/post-sitemap.xml"
    url_filter = "sallysbakingaddiction.com"
