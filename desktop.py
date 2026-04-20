"""Cantebury Trails desktop window. Install: py -3 -m pip install pywebview  Run: py -3 desktop.py"""
from __future__ import annotations

import sys
from pathlib import Path


def main() -> None:
    try:
        import webview
    except ImportError:
        print("Install pywebview: py -3 -m pip install pywebview", file=sys.stderr)
        sys.exit(1)

    root = Path(__file__).resolve().parent
    index_uri = (root / "index.html").as_uri()
    webview.create_window(
        "Cantebury Trails",
        index_uri,
        width=1100,
        height=820,
        min_size=(800, 600),
        background_color="#1a1510",
    )
    webview.start()


if __name__ == "__main__":
    main()
