#!/usr/bin/env python3
"""Headless local server with disk save API (no desktop window)."""
from desktop import pick_port, serve_folder
from pathlib import Path

if __name__ == "__main__":
    root = Path(__file__).resolve().parent
    port = pick_port()
    httpd = serve_folder(root, port)
    url = f"http://127.0.0.1:{port}/index.html"
    print(f"Serving from {root}")
    print(f"Saves folder: {root / 'saves'}")
    print(f"Open {url}")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nShutting down.")
        httpd.shutdown()
