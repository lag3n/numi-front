from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Update CORS settings
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4200"],  # Angular dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

ip_addresses = set()

@app.get("/track-ip")
async def track_ip(request: Request):
    client_ip = request.client.host
    ip_addresses.add(client_ip)
    print(f"Received request from IP: {client_ip}")
    return {"uniqueIPs": len(ip_addresses)} 