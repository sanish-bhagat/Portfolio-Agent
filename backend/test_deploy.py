import requests
import os
import base64
import json
from dotenv import load_dotenv

load_dotenv()

token = os.environ.get('VERCEL_TOKEN')
repo_path = 'generated_sites/b029f0dd-21c4-4c89-acfc-54b8419e8a2f'
files_payload = []

f_path = os.path.join(repo_path, 'index.html')
with open(f_path, 'rb') as f:
    content = f.read()
    files_payload.append({
        'file': 'index.html',
        'data': base64.b64encode(content).decode('utf-8'),
        'encoding': 'base64'
    })

payload = {
    'name': 'test-deploy',
    'files': files_payload,
    'projectSettings': {
        'framework': None
    }
}

headers = {
    'Authorization': f'Bearer {token}',
    'Content-Type': 'application/json'
}

resp = requests.post('https://api.vercel.com/v13/deployments', headers=headers, json=payload)
print(f"Status: {resp.status_code}")
print(f"Response: {json.dumps(resp.json(), indent=2)}")
