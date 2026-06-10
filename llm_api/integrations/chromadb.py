from chromadb.utils.embedding_functions import OllamaEmbeddingFunction
from constants import OLLAMA_HOST, OLLAMA_MODEL, CHROMA_HOST, CHROMA_PORT
from chromadb import HttpClient
from typing import Any

embedding_fn = OllamaEmbeddingFunction(
    model_name=OLLAMA_MODEL,
    url=OLLAMA_HOST,
    timeout=30
)


def get_chroma_client():
  return HttpClient(host=CHROMA_HOST, port=CHROMA_PORT)


class ChromaRepository:
  def __init__(self, collection_name: str = "recipes"):
    self.client = get_chroma_client()
    self.collection = self.client.get_or_create_collection(
        name=collection_name,
        embedding_function=embedding_fn
    )

  def process_json_for_vector_db(self, data: dict[str: Any]) -> dict[str: Any]:
    """Take JSON and prepare it in the format that the vector database expects"""
    if isinstance(data, dict):
      return {k: self.process_json_for_vector_db(v) for k, v in data.items()}
    elif isinstance(data, list):
      return ", ".join(str(item) for item in data)
    else:
      return data

  def add(
      self,
      ids: list[str],
      documents: list[str] | None = None,
      metadatas: list[dict] | None = None
  ):
    """Add documents to the collection."""
    return self.collection.add(
        ids=ids,
        documents=documents,
        metadatas=metadatas
    )

  def get(self, ids: list[str]):
    """Retrieve documents by ID."""
    return self.collection.get(ids=ids)

  def query(
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
    return self.collection.query(
        query_texts=[text] if text else None,
        query_embeddings=query_embeddings,
        n_results=n_results,
        where=where,
        where_document=where_document
    )

  def update(
      self,
      ids: list[str],
      documents: list[str] | None = None,
      metadatas: list[dict] | None = None,
  ):
    """Update documents or metadata for given IDs."""
    return self.collection.update(
        ids=ids,
        documents=documents,
        metadatas=metadatas
    )

  def delete(
      self,
      ids: list[str] | None = None,
      where: dict | None = None,
      where_document: dict | None = None,
  ):
    """Delete documents by ID or filter."""
    return self.collection.delete(
        ids=ids,
        where=where,
        where_document=where_document
    )

  def count(self):
    """Return the number of items in the collection."""
    return self.collection.count()

  def peek(self, n: int = 10):
    """Preview a few items."""
    return self.collection.peek(n)

  def all(self):
    """Return all documents in the collection."""
    return self.collection.get()
