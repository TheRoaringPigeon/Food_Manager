from adapters.wprm_base import WPRMSiteAdapter


class SkinnytasteSiteAdapter(WPRMSiteAdapter):
    site_id = "skinnytaste"
    sitemap_url = "https://www.skinnytaste.com/post-sitemap.xml"
    url_filter = "skinnytaste.com"
