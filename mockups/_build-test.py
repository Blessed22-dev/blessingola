# Saves the generated page (from headless Edge) as mockups/_built.html for screenshots
import sys, html, re
raw = open(sys.argv[1], encoding="utf-8", errors="replace").read()
m = re.search(r'<pre id="log">(.*?)</pre>', raw, re.S)
text = html.unescape(m.group(1))
start = text.index("<!doctype html>")
page = text[start:]
open(sys.argv[2], "w", encoding="utf-8").write(page)
print("saved", len(page))
