#!/usr/bin/env python3
"""
Advanced HTTP server for freshStart PWA with file writing capabilities.
Supports both serving static files and handling POST requests for data persistence.
"""

import http.server
import socketserver
import json
import os
import urllib.parse
from datetime import datetime
import csv
import io

class FreshStartRequestHandler(http.server.SimpleHTTPRequestHandler):
    """Custom request handler with POST support for file operations"""
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory='/Users/bb/freshStart', **kwargs)
    
    def do_POST(self):
        """Handle POST requests for data saving operations"""
        if self.path == '/save-events':
            self.handle_save_events()
        else:
            self.send_error(404, "Endpoint not found")
    
    def handle_save_events(self):
        """Save events data to TSV file"""
        try:
            # Get content length and read the POST data
            content_length = int(self.headers.get('Content-Length', 0))
            post_data = self.rfile.read(content_length)
            
            # Parse JSON data
            data = json.loads(post_data.decode('utf-8'))
            events = data.get('events', [])
            
            # Validate events data structure
            if not isinstance(events, list):
                raise ValueError("Events must be an array")
            
            # Write to TSV file
            events_file = '/Users/bb/freshStart/data/events.tsv'
            
            # Create backup of existing file
            if os.path.exists(events_file):
                backup_file = f"{events_file}.backup.{datetime.now().strftime('%Y%m%d_%H%M%S')}"
                os.rename(events_file, backup_file)
                print(f"Created backup: {backup_file}")
            
            # Write new events to TSV
            with open(events_file, 'w', newline='', encoding='utf-8') as f:
                writer = csv.writer(f, delimiter='\t')
                
                # Write header if we have events
                if events:
                    # Get all possible keys from all events
                    all_keys = set()
                    for event in events:
                        all_keys.update(event.keys())
                    header = sorted(all_keys)
                    writer.writerow(header)
                    
                    # Write event data
                    for event in events:
                        row = [event.get(key, '') for key in header]
                        writer.writerow(row)
            
            print(f"Saved {len(events)} events to {events_file}")
            
            # Send success response
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            
            response = {
                'success': True,
                'message': f'Successfully saved {len(events)} events',
                'timestamp': datetime.now().isoformat()
            }
            self.wfile.write(json.dumps(response).encode('utf-8'))
            
        except json.JSONDecodeError as e:
            self.send_error_response(400, f"Invalid JSON: {str(e)}")
        except Exception as e:
            print(f"Error saving events: {str(e)}")
            self.send_error_response(500, f"Server error: {str(e)}")
    
    def send_error_response(self, status_code, message):
        """Send a JSON error response"""
        self.send_response(status_code)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        
        error_response = {
            'success': False,
            'error': message,
            'timestamp': datetime.now().isoformat()
        }
        self.wfile.write(json.dumps(error_response).encode('utf-8'))
    
    def do_OPTIONS(self):
        """Handle CORS preflight requests"""
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
    
    def end_headers(self):
        """Add CORS headers to all responses"""
        self.send_header('Access-Control-Allow-Origin', '*')
        super().end_headers()
    
    def log_message(self, format, *args):
        """Custom logging with timestamps"""
        timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        message = format % args
        print(f"[{timestamp}] {self.address_string()} - {message}")

def run_server(port=8000):
    """Start the server"""
    try:
        with socketserver.TCPServer(("", port), FreshStartRequestHandler) as httpd:
            print(f"FreshStart Server running at http://localhost:{port}/")
            print(f"Serving files from: /Users/bb/freshStart")
            print(f"POST endpoint available at: http://localhost:{port}/save-events")
            print("Press Ctrl+C to stop the server")
            httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nServer stopped by user")
    except OSError as e:
        if e.errno == 48:  # Address already in use
            print(f"Port {port} is already in use. Try a different port:")
            print(f"python3 server.py --port 8001")
        else:
            print(f"Error starting server: {e}")

if __name__ == "__main__":
    import sys
    
    port = 8000
    if len(sys.argv) > 1:
        if sys.argv[1] == '--port' and len(sys.argv) > 2:
            try:
                port = int(sys.argv[2])
            except ValueError:
                print("Invalid port number")
                sys.exit(1)
        elif sys.argv[1] == '--help':
            print("Usage: python3 server.py [--port PORT]")
            print("Default port: 8000")
            sys.exit(0)
    
    run_server(port)
