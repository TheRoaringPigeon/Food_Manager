from adapters.wprm_base import WPRMSiteAdapter


class MinimalistBakerSiteAdapter(WPRMSiteAdapter):
    site_id = "minimalistbaker"
    sitemap_url = "https://minimalistbaker.com/post-sitemap.xml"
    url_filter = "minimalistbaker.com"
