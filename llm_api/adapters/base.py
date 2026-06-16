from abc import ABC, abstractmethod
from typing import Optional
import aiohttp
from schemas.NormalizedRecipe import NormalizedRecipe


class SiteAdapter(ABC):
    site_id: str

    @abstractmethod
    async def get_recipe_urls(self) -> list[str]: ...

    @abstractmethod
    async def fetch_and_parse(
        self, session: aiohttp.ClientSession, url: str
    ) -> Optional[NormalizedRecipe]: ...


class SiteRegistry:
    def __init__(self):
        self._adapters: dict[str, SiteAdapter] = {}

    def register(self, adapter: SiteAdapter) -> None:
        self._adapters[adapter.site_id] = adapter

    def get_all(self) -> list[SiteAdapter]:
        return list(self._adapters.values())

    def get(self, site_id: str) -> Optional[SiteAdapter]:
        return self._adapters.get(site_id)


site_registry = SiteRegistry()
