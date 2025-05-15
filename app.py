from flask import Flask, render_template, request, jsonify
import os
import requests
import random
from dotenv import load_dotenv

# Load API keys from .env file
load_dotenv()

app = Flask(__name__)

UNSPLASH_URL = "https://api.unsplash.com/search/photos"
UNSPLASH_KEY = os.getenv("UNSPLASH_ACCESS_KEY")

# -------------------------------
# Function to get images from Unsplash
def get_unsplash_images(prompt, count=4):
    params = {
        "query": prompt,
        "client_id": UNSPLASH_KEY,
        "per_page": count
    }
    response = requests.get(UNSPLASH_URL, params=params)
    if response.status_code == 200:
        data = response.json()
        return [img["urls"]["regular"] for img in data["results"]]
    else:
        return []

# -------------------------------
# Function to generate color palette
def get_random_palette():
    palettes = [
        ["#FFB5E8", "#FF9CEE", "#B28DFF", "#AFF8DB", "#D5AAFF"],
        ["#FDE2E4", "#FAD2E1", "#E2ECE9", "#BEE1E6", "#CBAACB"],
        ["#D3E4CD", "#ADC2A9", "#99A799", "#6B9080", "#3D405B"],
        ["#F6BD60", "#F7EDE2", "#F5CAC3", "#84A59D", "#F28482"],
        ["#22223B", "#4A4E69", "#9A8C98", "#C9ADA7", "#F2E9E4"]
    ]
    return random.choice(palettes)

# -------------------------------
# Function to suggest fonts
def get_font_suggestions(prompt):
    prompt = prompt.lower()
    if "vintage" in prompt:
        return ["Playfair Display", "Raleway"]
    elif "modern" in prompt:
        return ["Poppins", "Inter"]
    elif "futuristic" in prompt or "sci-fi" in prompt:
        return ["Orbitron", "Roboto Mono"]
    elif "cozy" in prompt or "calm" in prompt:
        return ["Lora", "Merriweather"]
    else:
        return ["Inter", "Lato"]

# -------------------------------
# Routes

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/generate", methods=["POST"])
def generate():
    prompt = request.json.get("prompt", "")
    images = get_unsplash_images(prompt, count=30)
    return jsonify({ "images": images })



# -------------------------------
# Run the server

if __name__ == "__main__":
    from os import getenv
    app.run(host="0.0.0.0", port=int(getenv("PORT", 5000)))

