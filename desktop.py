"""Cantebury Trails desktop window. Install: py -3 -m pip install pywebview  Run: py -3 desktop.py"""
from __future__ import annotations

import json
import socket
import sys
import threading
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import unquote


def pick_port() -> int:
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
        sock.bind(("127.0.0.1", 0))
        return sock.getsockname()[1]


class GameHTTPRequestHandler(SimpleHTTPRequestHandler):
    """Static files plus campaign save API under /api/campaign-save/."""

    saves_dir: Path

    def __init__(self, *args, directory=None, saves_dir=None, **kwargs):
        self.saves_dir = saves_dir or Path("saves")
        super().__init__(*args, directory=directory, **kwargs)

    def log_message(self, format, *args):
        if args and str(args[0]).startswith("GET /api/campaign-save"):
            return
        super().log_message(format, *args)

    def _send_json(self, status, payload):
        body = json.dumps(payload).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(body)

    def _read_body(self):
        length = int(self.headers.get("Content-Length", "0") or 0)
        if length <= 0:
            return b""
        return self.rfile.read(length)

    def _slot_path(self, slot_index):
        return self.saves_dir / ("slot-" + str(slot_index) + ".json")

    def _meta_path(self):
        return self.saves_dir / "meta.json"

    def _ensure_saves_dir(self):
        self.saves_dir.mkdir(parents=True, exist_ok=True)

    def _handle_campaign_save_api(self):
        path = unquote(self.path.split("?", 1)[0])
        if not path.startswith("/api/campaign-save"):
            return False

        self._ensure_saves_dir()

        if path == "/api/campaign-save/ping":
            if self.command == "GET":
                self._send_json(200, {"ok": True, "savesDir": str(self.saves_dir.resolve())})
                return True
            self.send_error(405)
            return True

        if path == "/api/campaign-save/active-slot":
            if self.command == "GET":
                meta = {"activeSlot": 0}
                meta_path = self._meta_path()
                if meta_path.is_file():
                    try:
                        loaded = json.loads(meta_path.read_text(encoding="utf-8"))
                        if isinstance(loaded, dict) and "activeSlot" in loaded:
                            meta = loaded
                    except (OSError, json.JSONDecodeError):
                        pass
                self._send_json(200, meta)
                return True
            if self.command == "PUT":
                try:
                    data = json.loads(self._read_body().decode("utf-8") or "{}")
                    slot = int(data.get("activeSlot", 0))
                    slot = max(0, min(2, slot))
                    self._meta_path().write_text(
                        json.dumps({"activeSlot": slot}, indent=2) + "\n",
                        encoding="utf-8",
                    )
                    self._send_json(200, {"ok": True, "activeSlot": slot})
                except (ValueError, TypeError, OSError) as exc:
                    self._send_json(500, {"ok": False, "error": str(exc)})
                return True
            self.send_error(405)
            return True

        prefix = "/api/campaign-save/slot/"
        if path.startswith(prefix):
            try:
                slot_index = int(path[len(prefix):])
            except ValueError:
                self.send_error(404)
                return True

            slot_path = self._slot_path(slot_index)

            if self.command == "GET":
                if not slot_path.is_file():
                    self.send_error(404)
                    return True
                try:
                    raw = slot_path.read_bytes()
                except OSError:
                    self.send_error(500)
                    return True
                self.send_response(200)
                self.send_header("Content-Type", "application/json; charset=utf-8")
                self.send_header("Content-Length", str(len(raw)))
                self.send_header("Cache-Control", "no-store")
                self.end_headers()
                self.wfile.write(raw)
                return True

            if self.command == "PUT":
                try:
                    raw = self._read_body()
                    json.loads(raw.decode("utf-8"))
                    slot_path.write_bytes(raw)
                    self._send_json(200, {"ok": True, "slot": slot_index})
                except (json.JSONDecodeError, OSError) as exc:
                    self._send_json(400, {"ok": False, "error": str(exc)})
                return True

            if self.command == "DELETE":
                try:
                    if slot_path.is_file():
                        slot_path.unlink()
                    self._send_json(200, {"ok": True, "slot": slot_index})
                except OSError as exc:
                    self._send_json(500, {"ok": False, "error": str(exc)})
                return True

            self.send_error(405)
            return True

        self.send_error(404)
        return True

    def do_GET(self):
        if self._handle_campaign_save_api():
            return
        super().do_GET()

    def do_PUT(self):
        if self._handle_campaign_save_api():
            return
        self.send_error(405)

    def do_DELETE(self):
        if self._handle_campaign_save_api():
            return
        self.send_error(405)


def serve_folder(root, port):
    saves_dir = root / "saves"
    saves_dir.mkdir(parents=True, exist_ok=True)

    def handler(*args, **kwargs):
        return GameHTTPRequestHandler(*args, directory=str(root), saves_dir=saves_dir, **kwargs)

    httpd = ThreadingHTTPServer(("127.0.0.1", port), handler)
    thread = threading.Thread(target=httpd.serve_forever, daemon=True)
    thread.start()
    return httpd


def main():
    try:
        import webview
    except ImportError:
        print("Install pywebview: py -3 -m pip install pywebview", file=sys.stderr)
        sys.exit(1)

    root = Path(__file__).resolve().parent
    port = pick_port()
    httpd = serve_folder(root, port)
    saves_dir = root / "saves"
    url = "http://127.0.0.1:{0}/index.html".format(port)
    print("Serving game assets from {0}".format(root))
    print("Campaign saves folder: {0}".format(saves_dir))
    print("Open {0}".format(url))

    webview.create_window(
        "Cantebury Trails",
        url,
        width=1100,
        height=820,
        min_size=(800, 600),
        background_color="#1a1510",
    )
    webview.start()
    httpd.shutdown()


if __name__ == "__main__":
    main()
