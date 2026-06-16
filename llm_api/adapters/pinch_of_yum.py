from adapters.wprm_base import WPRMSiteAdapter


class PinchOfYumSiteAdapter(WPRMSiteAdapter):
    site_id = "pinchofyum"
    sitemap_url = "https://pinchofyum.com/post-sitemap.xml"
    url_filter = "pinchofyum.com"
