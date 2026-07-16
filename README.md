This is a demo using cursor to build an Oregon Trail styled game.

It is a web version for now but will update in the future for a standalone setup.

**Player manual:** See [`PLAYER_MANUAL.md`](PLAYER_MANUAL.md) for an introduction, how to play, and FAQs.

## Play on GitHub

The game is hosted on **GitHub Pages** as static HTML/JS — open it in any modern browser; no install required.

**[Play Cantebury Trails](https://losbullitt.github.io/Illirial-Trail/index.html)**  
**[How to play / FAQ](https://losbullitt.github.io/Illirial-Trail/faq.html)** — share this link on PaperSword.

- **Direct link:** `https://losbullitt.github.io/Illirial-Trail/index.html`
- **Repository:** [github.com/losbullitt/Illirial-Trail](https://github.com/losbullitt/Illirial-Trail)

Campaign progress is saved in your browser's local storage on that device (use **Load save** or **Continue** on the setup screen).
## Run locally

Serve this folder over HTTP (do not open `index.html` as a `file://` URL):

- **Windows:** run `serve.ps1`, then open `http://127.0.0.1:8080/index.html`
- **macOS / Linux:** `python3 -m http.server 8080` from this directory, then open `http://127.0.0.1:8080/index.html`

**Desktop window (optional):** double-click `desktop.bat` or run `python3 desktop.py` (one-time: `python3 -m pip install pywebview`).
