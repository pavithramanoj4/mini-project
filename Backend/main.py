from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import requests
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

SERP_API_KEY = os.getenv("SERPAPI_KEY")

@app.get("/compare")
def compare_product(product: str):
    params = {
        "engine": "google_shopping",
        "q": product,
        "api_key": SERP_API_KEY,
        "gl": "in",
        "hl": "en"
    }

    response = requests.get("https://serpapi.com/search.json", params=params)
    data = response.json()

    results = []

    for item in data.get("shopping_results", [])[:5]:
        results.append({
            "title": item.get("title"),
            "price": item.get("price"),
            "rating": item.get("rating"),
            "store": item.get("source"),
            "image": item.get("thumbnail"),
            "link": item.get("link")
        })

    return {
        "product": product,
        "results": results
    }


	
