from chromadb.utils.embedding_functions import OllamaEmbeddingFunction
from constants import OLLAMA_HOST, OLLAMA_MODEL, CHROMA_HOST, CHROMA_PORT
from chromadb import HttpClient

embedding_fn = OllamaEmbeddingFunction(
    model_name=OLLAMA_MODEL,
    url=OLLAMA_HOST,
    timeout=30
)

def get_chroma_client():
    return HttpClient(host=CHROMA_HOST, port=CHROMA_PORT)

def get_collection(name: str = "recipes"):
    client = get_chroma_client()
    return client.get_or_create_collection(
        name=name,
        embedding_function=embedding_fn
    )
