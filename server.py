"""
Simple HTTP Server with proper MIME types for ES6 modules
"""
import http.server
import socketserver
from pathlib import Path

class MyHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # Add CORS headers to allow module loading
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        
        # Ensure JavaScript modules are served with correct MIME type
        if self.path.endswith('.js'):
            self.send_header('Content-Type', 'application/javascript; charset=utf-8')
        
        super().end_headers()
    
    def guess_type(self, path):
        # Override to ensure .js files are served as application/javascript
        mime_type = super().guess_type(path)
        if path.endswith('.js'):
            return 'application/javascript'
        return mime_type

PORT = 3000
Handler = MyHTTPRequestHandler

with socketserver.TCPServer(("", PORT), Handler) as httpd:
    print(f"🚀 Server running at http://localhost:{PORT}/")
    print(f"📁 Serving from: {Path.cwd()}")
    print("\nPress Ctrl+C to stop the server")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n\n✅ Server stopped")
