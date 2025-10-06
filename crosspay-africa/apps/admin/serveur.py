#!/usr/bin/env python3
import http.server
import socketserver
import os

PORT = 8080
os.chdir('/workspace/crosspay-africa/apps/admin')

Handler = http.server.SimpleHTTPRequestHandler

print(f"🌍 Serveur CrossPay Africa démarré !")
print(f"📍 Accédez à la démo sur : http://localhost:{PORT}/demo.html")
print(f"✨ Interface moderne et responsive prête !")
print(f"\nAppuyez sur Ctrl+C pour arrêter le serveur\n")

with socketserver.TCPServer(("", PORT), Handler) as httpd:
    httpd.serve_forever()
