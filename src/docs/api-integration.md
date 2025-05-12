# SignVault API Integration Guide

This guide provides detailed information on how to integrate with SignVault's API to programmatically vault documents and retrieve document information.

## Authentication

All API requests require authentication using an API key. You can generate API keys in the SignVault dashboard under Integrations > API.

Include your API key in the Authorization header of all requests:

```
Authorization: Bearer sv_live_your_api_key
```

API keys can have different permissions:
- **Read** - Allows retrieving document information
- **Write** - Allows vaulting new documents

## Endpoints

### Vault a Document

Upload and vault a document securely with blockchain anchoring.

**Endpoint:** `POST /api/vault-document`

**Headers:**
- `Authorization: Bearer sv_live_your_api_key`
- `Content-Type: multipart/form-data`

**Request Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| file | File | Yes | The document file to vault |
| metadata | JSON string | No | Additional metadata for the document |
| source | String | No | Source of the document (default: "api") |
| retention_period | String | No | How long to retain the document (default: "7 years") |

**Example Request (Node.js):**

```javascript
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

async function vaultDocument() {
  const apiKey = 'sv_live_your_api_key';
  const form = new FormData();
  
  // Add the file
  form.append('file', fs.createReadStream('path/to/document.pdf'));
  
  // Add metadata (optional)
  const metadata = {
    contractId: '12345',
    department: 'Legal',
    tags: ['contract', 'nda']
  };
  form.append('metadata', JSON.stringify(metadata));
  
  // Add source (optional)
  form.append('source', 'contract-management-system');
  
  try {
    const response = await axios.post('https://yourdomain.com/api/vault-document', form, {
      headers: {
        ...form.getHeaders(),
        'Authorization': `Bearer ${apiKey}`
      }
    });
    
    console.log('Document vaulted successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error vaulting document:', error.response?.data || error.message);
    throw error;
  }
}

vaultDocument();
```

**Example Request (Python):**

```python
import requests
import json

def vault_document():
    api_key = 'sv_live_your_api_key'
    url = 'https://yourdomain.com/api/vault-document'
    
    # Prepare metadata
    metadata = {
        'contractId': '12345',
        'department': 'Legal',
        'tags': ['contract', 'nda']
    }
    
    # Prepare files and form data
    files = {
        'file': ('document.pdf', open('path/to/document.pdf', 'rb'), 'application/pdf')
    }
    
    data = {
        'metadata': json.dumps(metadata),
        'source': 'contract-management-system'
    }
    
    # Set headers
    headers = {
        'Authorization': f'Bearer {api_key}'
    }
    
    try:
        response = requests.post(url, headers=headers, data=data, files=files)
        response.raise_for_status()
        
        print('Document vaulted successfully:', response.json())
        return response.json()
    except requests.exceptions.RequestException as e:
        print('Error vaulting document:', e)
        if hasattr(e, 'response') and e.response:
            print(e.response.json())
        raise

vault_document()
```

**Example Response:**

```json
{
  "success": true,
  "document": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "file_name": "contract.pdf",
    "vault_time": "2025-05-11T21:38:27.892Z",
    "file_hash": "8a9d5a6c8b9e2f4a3b7c6d5e4f3a2b1c",
    "blockchain_txid": "0x1234567890abcdef1234567890abcdef"
  }
}
```

### Get Documents

Retrieve a list of vaulted documents.

**Endpoint:** `GET /api/get-documents`

**Headers:**
- `Authorization: Bearer sv_live_your_api_key`

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| limit | Number | No | Number of documents to return (default: 10) |
| offset | Number | No | Pagination offset (default: 0) |
| source | String | No | Filter by document source |

**Example Request (Node.js):**

```javascript
const axios = require('axios');

async function getDocuments() {
  const apiKey = 'sv_live_your_api_key';
  
  try {
    const response = await axios.get('https://yourdomain.com/api/get-documents', {
      params: {
        limit: 20,
        offset: 0,
        source: 'contract-management-system'
      },
      headers: {
        'Authorization': `Bearer ${apiKey}`
      }
    });
    
    console.log('Documents retrieved successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error retrieving documents:', error.response?.data || error.message);
    throw error;
  }
}

getDocuments();
```

**Example Request (Python):**

```python
import requests

def get_documents():
    api_key = 'sv_live_your_api_key'
    url = 'https://yourdomain.com/api/get-documents'
    
    # Set query parameters
    params = {
        'limit': 20,
        'offset': 0,
        'source': 'contract-management-system'
    }
    
    # Set headers
    headers = {
        'Authorization': f'Bearer {api_key}'
    }
    
    try:
        response = requests.get(url, headers=headers, params=params)
        response.raise_for_status()
        
        print('Documents retrieved successfully:', response.json())
        return response.json()
    except requests.exceptions.RequestException as e:
        print('Error retrieving documents:', e)
        if hasattr(e, 'response') and e.response:
            print(e.response.json())
        raise

get_documents()
```

**Example Response:**

```json
{
  "success": true,
  "documents": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "file_name": "contract.pdf",
      "vault_time": "2025-05-11T21:38:27.892Z",
      "file_hash": "8a9d5a6c8b9e2f4a3b7c6d5e4f3a2b1c",
      "file_size": 1024567,
      "mime_type": "application/pdf",
      "blockchain_txid": "0x1234567890abcdef1234567890abcdef",
      "source": "contract-management-system",
      "metadata": {
        "contractId": "12345",
        "department": "Legal",
        "tags": ["contract", "nda"]
      }
    },
    {
      "id": "660e8400-e29b-41d4-a716-446655440001",
      "file_name": "agreement.pdf",
      "vault_time": "2025-05-10T18:22:15.123Z",
      "file_hash": "7b8d6a5c4e3f2a1b0c9d8e7f6a5b4c3d",
      "file_size": 2048123,
      "mime_type": "application/pdf",
      "blockchain_txid": "0xabcdef1234567890abcdef12345678",
      "source": "contract-management-system",
      "metadata": {
        "contractId": "67890",
        "department": "Sales",
        "tags": ["agreement", "sales"]
      }
    }
  ],
  "pagination": {
    "total": 45,
    "limit": 20,
    "offset": 0,
    "has_more": true
  }
}
```

### Get Document

Retrieve a specific document by ID.

**Endpoint:** `GET /api/get-document`

**Headers:**
- `Authorization: Bearer sv_live_your_api_key`

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | String | Yes | Document ID |
| download | Boolean | No | Set to "true" to include a download URL |

**Example Request (Node.js):**

```javascript
const axios = require('axios');

async function getDocument(documentId) {
  const apiKey = 'sv_live_your_api_key';
  
  try {
    const response = await axios.get('https://yourdomain.com/api/get-document', {
      params: {
        id: documentId,
        download: true
      },
      headers: {
        'Authorization': `Bearer ${apiKey}`
      }
    });
    
    console.log('Document retrieved successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error retrieving document:', error.response?.data || error.message);
    throw error;
  }
}

getDocument('550e8400-e29b-41d4-a716-446655440000');
```

**Example Request (Python):**

```python
import requests

def get_document(document_id):
    api_key = 'sv_live_your_api_key'
    url = 'https://yourdomain.com/api/get-document'
    
    # Set query parameters
    params = {
        'id': document_id,
        'download': 'true'
    }
    
    # Set headers
    headers = {
        'Authorization': f'Bearer {api_key}'
    }
    
    try:
        response = requests.get(url, headers=headers, params=params)
        response.raise_for_status()
        
        print('Document retrieved successfully:', response.json())
        return response.json()
    except requests.exceptions.RequestException as e:
        print('Error retrieving document:', e)
        if hasattr(e, 'response') and e.response:
            print(e.response.json())
        raise

get_document('550e8400-e29b-41d4-a716-446655440000')
```

**Example Response:**

```json
{
  "success": true,
  "document": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "file_name": "contract.pdf",
    "vault_time": "2025-05-11T21:38:27.892Z",
    "file_hash": "8a9d5a6c8b9e2f4a3b7c6d5e4f3a2b1c",
    "file_size": 1024567,
    "mime_type": "application/pdf",
    "blockchain_txid": "0x1234567890abcdef1234567890abcdef",
    "source": "contract-management-system",
    "metadata": {
      "contractId": "12345",
      "department": "Legal",
      "tags": ["contract", "nda"]
    },
    "download_url": "https://yourdomain.com/download/signed-url-token"
  }
}
```

## Error Handling

The API returns standard HTTP status codes to indicate the success or failure of a request:

- `200 OK` - The request was successful
- `201 Created` - The resource was successfully created
- `400 Bad Request` - The request was invalid or missing required parameters
- `401 Unauthorized` - Missing or invalid API key
- `403 Forbidden` - The API key does not have the required permissions
- `404 Not Found` - The requested resource was not found
- `500 Internal Server Error` - An error occurred on the server

Error responses include a JSON object with an `error` field that provides a description of the error:

```json
{
  "error": "Invalid API key",
  "message": "The provided API key is not valid or has been revoked"
}
```

## Best Practices

1. **Secure Your API Keys**: Store your API keys securely and never expose them in client-side code.

2. **Use Appropriate Permissions**: Create API keys with the minimum permissions required for your integration.

3. **Handle Rate Limits**: The API has rate limits to prevent abuse. Implement exponential backoff for retries.

4. **Validate Documents**: Before uploading, ensure your documents meet the requirements (file type, size, etc.).

5. **Include Metadata**: Add relevant metadata to your documents to make them easier to search and organize.

6. **Monitor Usage**: Regularly check your API usage in the SignVault dashboard.

7. **Implement Proper Error Handling**: Always handle errors gracefully in your integration.

## Need Help?

If you have any questions or need assistance with your API integration, please contact our support team at support@signvault.com.
