"""Cantebury Trails desktop window. Install: py -3 -m pip install pywebview  Run: py -3 desktop.py"""
from __future__ import annotations

import socket
import sys
import threading
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path


def pick_port() -> int:
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
        sock.bind(("127.0.0.1", 0))
        return sock.getsockname()[1]


def serve_folder(root: Path, port: int) -> ThreadingHTTPServer:
    handler = lambda *args, **kwargs: SimpleHTTPRequestHandler(  # noqa: E731
        *args, directory=str(root), **kwargs
    )
    httpd = ThreadingHTTPServer(("127.0.0.1", port), handler)
    thread = threading.Thread(target=httpd.serve_forever, daemon=True)
    thread.start()
    return httpd


def main() -> None:
    try:
        import webview
    except ImportError:
        print("Install pywebview: py -3 -m pip install pywebview", file=sys.stderr)
        sys.exit(1)

    root = Path(__file__).resolve().parent
    port = pick_port()
    httpd = serve_folder(root, port)
    url = f"http://127.0.0.1:{port}/index.html"
    print(f"Serving game assets from {root}")
    print(f"Open {url}")

    webview.create_window(
        "Cantebury Trails",
        url,
        width=1100,
        height=820,
        min_size=(800, 600),
        background_color="#1a1510",
    )
    webview.start()


if __name__ == "__main__":
    main()
