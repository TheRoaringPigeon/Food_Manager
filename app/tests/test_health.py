from constants import API_CONTEXT_PATH, API_INFO


def test_health_endpoint(client):
  """Test health check endpoint"""
  response = client.get(f"{API_CONTEXT_PATH}/health")
  assert response.status_code == 200
  assert API_INFO['title'] in response.json()


def test_info_endpoint(client):
  """Test info endpoint"""
  response = client.get(f"{API_CONTEXT_PATH}/info")
  assert response.status_code == 200
  data = response.json()
  assert data["Name"] == API_INFO['title']
  assert data["Version"] == API_INFO['version']
  assert "Description" in data


def test_openapi_docs(client):
  """Test that OpenAPI docs are accessible"""
  response = client.get(f"{API_CONTEXT_PATH}/docs")
  assert response.status_code == 200
