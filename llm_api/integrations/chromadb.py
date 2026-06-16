import asyncio
from chromadb.utils.embedding_functions import OllamaEmbeddingFunction
from constants import OLLAMA_HOST, OLLAMA_MODEL, CHROMA_HOST, CHROMA_PORT
from chromadb import HttpClient
from typing import Any

embedding_fn = OllamaEmbeddingFunction(
    model_name=OLLAMA_MODEL,
    url=OLLAMA_HOST,
    timeout=120
)


def get_chroma_client():
  return HttpClient(host=CHROMA_HOST, port=CHROMA_PORT)


class ChromaRepository:
  def __init__(self, collection_name: str = "recipes"):
    self.client = get_chroma_client()
    self.collection_name = collection_name
    # Collection is fetched lazily inside to_thread calls so a ChromaDB restart
    # never leaves a stale UUID cached on this object.

  def _get_collection(self):
    return self.client.get_or_create_collection(
        name=self.collection_name,
        embedding_function=embedding_fn
    )

  def process_json_for_vector_db(self, data: dict[str: Any]) -> dict[str: Any]:
    """Take JSON and prepare it in the format that the vector database expects"""
    if isinstance(data, dict):
      return {k: self.process_json_for_vector_db(v) for k, v in data.items()}
    elif isinstance(data, list):
      return ", ".join(str(item) for item in data)
    elif data is None:
      return ""
    else:
      return data

  async def add(
      self,
      ids: list[str],
      documents: list[str] | None = None,
      metadatas: list[dict] | None = None
  ):
    """Add documents to the collection."""
    def _run():
      return self._get_collection().add(ids=ids, documents=documents, metadatas=metadatas)
    return await asyncio.to_thread(_run)

  async def get(self, ids: list[str]):
    """Retrieve documents by ID."""
    def _run():
      return self._get_collection().get(ids=ids)
    return await asyncio.to_thread(_run)

  async def query(
      self,
      text: str = None,
      query_embeddings=None,
      n_results: int = 5,
      where: dict | None = None,
      where_document: dict | None = None,
  ):
    """
    Query the collection using text or embedding.
    Provide either `text` OR custom `query_embeddings`.
    """
    def _run():
      return self._get_collection().query(
          query_texts=[text] if text else None,
          query_embeddings=query_embeddings,
          n_results=n_results,
          where=where,
          where_document=where_document
      )
    return await asyncio.to_thread(_run)

  async def update(
      self,
      ids: list[str],
      documents: list[str] | None = None,
      metadatas: list[dict] | None = None,
  ):
    """Update documents or metadata for given IDs."""
    def _run():
      return self._get_collection().update(ids=ids, documents=documents, metadatas=metadatas)
    return await asyncio.to_thread(_run)

  async def delete(
      self,
      ids: list[str] | None = None,
      where: dict | None = None,
      where_document: dict | None = None,
  ):
    """Delete documents by ID or filter."""
    def _run():
      return self._get_collection().delete(ids=ids, where=where, where_document=where_document)
    return await asyncio.to_thread(_run)

  async def count(self):
    """Return the number of items in the collection."""
    def _run():
      return self._get_collection().count()
    return await asyncio.to_thread(_run)

  async def peek(self, n: int = 10):
    """Preview a few items."""
    def _run():
      return self._get_collection().peek(n)
    return await asyncio.to_thread(_run)

  async def all(self):
    """Return all documents in the collection."""
    def _run():
      return self._get_collection().get()
    return await asyncio.to_thread(_run)
