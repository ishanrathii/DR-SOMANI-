#!/usr/bin/env python3
"""Build a single-file, offline preview of the site (dr-somani-preview.html).

Inlines styles.css and all js/*.js referenced by index.html, and embeds any
assets/* images referenced anywhere in the markup as base64 data URIs so the
preview works with no server and no network.
"""
import base64
import mimetypes
import os
import re

ROOT = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(ROOT, "index.html")
OUT = os.path.join(ROOT, "dr-somani-preview.html")


def read(path):
    with open(os.path.join(ROOT, path), "r", encoding="utf-8") as f:
        return f.read()


def data_uri(path):
    full = os.path.join(ROOT, path)
    if not os.path.exists(full):
        return None
    mime = mimetypes.guess_type(full)[0] or "application/octet-stream"
    with open(full, "rb") as f:
        b64 = base64.b64encode(f.read()).decode("ascii")
    return f"data:{mime};base64,{b64}"


html = read("index.html")

# Inline stylesheet
css = read("css/styles.css")
html = re.sub(
    r'<link rel="stylesheet" href="css/styles\.css"\s*/?>',
    "<style>\n" + css + "\n</style>",
    html,
)

# Inline scripts
def inline_script(m):
    src = m.group(1)
    try:
        js = read(src)
    except FileNotFoundError:
        return m.group(0)
    return "<script>\n" + js + "\n</script>"

html = re.sub(r'<script src="(js/[^"]+)"></script>', inline_script, html)

# Embed assets referenced as src="assets/..." or href="assets/..."
def embed_asset(m):
    attr, path = m.group(1), m.group(2)
    uri = data_uri(path)
    if uri is None:
        return m.group(0)
    return f'{attr}="{uri}"'

html = re.sub(r'(src|href)="(assets/[^"]+)"', embed_asset, html)

with open(OUT, "w", encoding="utf-8") as f:
    f.write(html)

print("Wrote", OUT, "(%.0f KB)" % (os.path.getsize(OUT) / 1024))
