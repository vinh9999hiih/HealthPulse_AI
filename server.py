import http.server
import os
import re
import socket
import socketserver
import subprocess
import sys
import threading
import time
import urllib.parse
import urllib.request

PORT = 8888
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
os.chdir(SCRIPT_DIR)

tunnel_proc = None
tunnel_url = None
banner_printed = False
tts_cache = {}

VOICE_MAP = {
    'vi': {
        'female': 'vi-VN-HoaiMyNeural',
        'male': 'vi-VN-NamMinhNeural',
    },
    'en': {
        'female': 'en-US-JennyNeural',
        'male': 'en-US-GuyNeural',
    },
    'ko': {
        'female': 'ko-KR-SunHiNeural',
        'male': 'ko-KR-InJoonNeural',
    },
    'zh': {
        'female': 'zh-CN-XiaoxiaoNeural',
        'male': 'zh-CN-YunxiNeural',
    }
}

def free_port(port):
    """Automatically free port if held by a previous zombie or stale instance"""
    try:
        my_pid = os.getpid()
        cmd = f'powershell -Command "Get-NetTCPConnection -LocalPort {port} -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess"'
        out = subprocess.check_output(cmd, shell=True, text=True).strip()
        if out:
            for pid_str in out.split():
                try:
                    pid = int(pid_str)
                    if pid != my_pid and pid > 0:
                        subprocess.run(f'taskkill /F /PID {pid}', shell=True, capture_output=True)
                except ValueError:
                    pass
            time.sleep(0.5)
        # Clean up any leftover cloudflared instances
        subprocess.run('taskkill /F /IM cloudflared.exe', shell=True, capture_output=True)
    except Exception:
        pass

def get_local_ip():
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except Exception:
        return "127.0.0.1"

def monitor_tunnel():
    global tunnel_proc, tunnel_url, banner_printed
    cloudflared_path = os.path.join(SCRIPT_DIR, "cloudflared.exe")
    if not os.path.exists(cloudflared_path):
        return

    try:
        tunnel_proc = subprocess.Popen(
            [cloudflared_path, "tunnel", "--url", f"http://localhost:{PORT}"],
            stdout=subprocess.DEVNULL,
            stderr=subprocess.PIPE,
            text=True,
            bufsize=1,
            creationflags=subprocess.CREATE_NO_WINDOW if os.name == 'nt' else 0
        )

        for line in tunnel_proc.stderr:
            match = re.search(r'https://[a-zA-Z0-9-]+\.trycloudflare\.com', line)
            if match:
                url = match.group(0)
                if "api.trycloudflare.com" in url:
                    continue
                tunnel_url = url
                if banner_printed:
                    print(f"\n  [3] LINK CHO BAN BE O XA (4G/Internet) DA SAN SANG:\n      {tunnel_url}\n", flush=True)
                break
    except Exception:
        pass

# 1. Giải phóng cổng 8888 nếu đang bị chiếm dụng
free_port(PORT)

# 2. Khởi tạo Cloudflare Tunnel
tunnel_thread = threading.Thread(target=monitor_tunnel, daemon=True)
tunnel_thread.start()

# Chờ tối đa 8 giây để lấy link công khai
for _ in range(40):
    if tunnel_url:
        break
    time.sleep(0.2)

local_ip = get_local_ip()

print("\n" + "=" * 68, flush=True)
print("             HEALTHPULSE AI - MAY CHU DANG HOAT DONG", flush=True)
print("=" * 68, flush=True)
print(f"  [1] Tren may tinh nay:            http://localhost:{PORT}", flush=True)
print(f"  [2] Dien thoai chung Wi-Fi (IP):  http://{local_ip}:{PORT}", flush=True)
if tunnel_url:
    print(f"  [3] GUI CHO BAN BE O XA (4G/Net): {tunnel_url}", flush=True)
else:
    print(f"  [3] GUI CHO BAN BE O XA (4G/Net): Dang ket noi, se hien ngay ben duoi...", flush=True)
print("=" * 68, flush=True)
print("  * BAN BE O XA: Chi can gui link [3] la ho xem duoc ngay tren dien thoai!", flush=True)
print("  * DIEN THOAI TRONG NHA: Dung chung Wi-Fi thi vao link [2].", flush=True)
print("  * Giu nguyen cua so nay de duy tri web. Nhan Ctrl + C de tat.", flush=True)
print("=" * 68 + "\n", flush=True)

banner_printed = True

class CustomHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=SCRIPT_DIR, **kwargs)

    def do_GET(self):
        # Support /api/tts endpoint
        if self.path.startswith('/api/tts') or self.path.startswith('/HealthPulse_AI/api/tts'):
            self.handle_tts()
            return

        # Support both / and /HealthPulse_AI/
        if self.path.startswith('/HealthPulse_AI'):
            self.path = self.path[len('/HealthPulse_AI'):]
            if not self.path or self.path == '/':
                self.path = '/index.html'

        # Map favicon.ico to existing logo
        if self.path == '/favicon.ico':
            self.path = '/assets/logo_white_bg.png'

        return super().do_GET()

    def handle_tts(self):
        try:
            parsed = urllib.parse.urlparse(self.path)
            params = urllib.parse.parse_qs(parsed.query)
            text = params.get('text', [''])[0].strip()
            lang = params.get('lang', ['vi'])[0]
            voice = params.get('voice', ['female'])[0]

            if not text:
                self.send_error(400, "Missing text parameter")
                return

            cache_key = f"{lang}_{voice}_{text}"
            if cache_key in tts_cache:
                audio_data = tts_cache[cache_key]
            else:
                audio_data = None
                if voice != 'google':
                    target_voice = VOICE_MAP.get(lang, {}).get(voice, 'vi-VN-HoaiMyNeural')
                    try:
                        import asyncio
                        import edge_tts

                        async def gen_speech():
                            communicate = edge_tts.Communicate(text, target_voice)
                            chunks = []
                            async for chunk in communicate.stream():
                                if chunk["type"] == "audio":
                                    chunks.append(chunk["data"])
                            return b"".join(chunks)

                        loop = asyncio.new_event_loop()
                        asyncio.set_event_loop(loop)
                        audio_data = loop.run_until_complete(gen_speech())
                        loop.close()
                    except Exception:
                        audio_data = None

                # Fallback sang Google Translate TTS nếu edge-tts lỗi hoặc chọn Google
                if not audio_data:
                    try:
                        g_lang = lang if lang in ['vi', 'en', 'ko'] else 'zh-CN'
                        g_url = f"https://translate.google.com/translate_tts?ie=UTF-8&q={urllib.parse.quote(text[:200])}&tl={g_lang}&client=tw-ob"
                        req = urllib.request.Request(g_url, headers={'User-Agent': 'Mozilla/5.0'})
                        with urllib.request.urlopen(req, timeout=6) as resp:
                            audio_data = resp.read()
                    except Exception:
                        pass

                if audio_data:
                    tts_cache[cache_key] = audio_data

            if audio_data:
                self.send_response(200)
                self.send_header('Content-Type', 'audio/mpeg')
                self.send_header('Content-Length', str(len(audio_data)))
                self.send_header('Cache-Control', 'public, max-age=86400')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(audio_data)
            else:
                self.send_error(500, "Could not generate speech")
        except Exception as e:
            self.send_error(500, str(e))

    def end_headers(self):
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        self.send_header('Access-Control-Allow-Origin', '*')
        super().end_headers()

class ThreadedServer(socketserver.ThreadingMixIn, http.server.HTTPServer):
    daemon_threads = True
    allow_reuse_address = True

try:
    with ThreadedServer(("", PORT), CustomHandler) as httpd:
        httpd.serve_forever()
except KeyboardInterrupt:
    print("\nDa dung may chu.")
finally:
    if tunnel_proc:
        try:
            tunnel_proc.terminate()
        except Exception:
            pass
