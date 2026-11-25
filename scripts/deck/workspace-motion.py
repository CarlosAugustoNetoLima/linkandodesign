#!/usr/bin/env python3
"""Gera os vídeos do deck JSYNQ Workspace a partir das capturas reais do sistema.

O sistema exige login, então não dá para gravar com o gravador de cenas. Este script
monta cada vídeo a partir das capturas (1440×732, dados de clientes já mascarados) em
`scripts/deck/workspace-shots/`: a tela numa janela de navegador sobre fundo claro, com
duas linguagens de movimento (ação e detalhe) no mesmo tempo. Ver "linguagem de movimento".

Uso:  python3 scripts/deck/workspace-motion.py [nome …]
Sem nomes, gera tudo. Saída em public/decks/jsynq-workspace/ (mp4 + jpg do quadro de
1,2 s) e manifest.json atualizado.
"""
import json
import math
import subprocess
import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT = Path(__file__).resolve().parents[2]
SHOTS = ROOT / "scripts/deck/workspace-shots"
OUT = ROOT / "public/decks/jsynq-workspace"
FPS = 30
POSTER_T = 1.2

# ---------------------------------------------------------------- capturas
_shots = {}


def shot(key):
    if key not in _shots:
        f = SHOTS / f"{key}.jpg"
        im = Image.open(f if f.exists() else SHOTS / f"{key}.png").convert("RGB")
        if key == "home-claro":
            # o cursor do mouse ficou sobre a barra de rolagem na captura: cobre com a própria barra
            im.paste(im.crop((1418, 182, 1440, 222)), (1418, 130))
        _shots[key] = im
    return _shots[key]


# ---------------------------------------------------------------- mundo do desktop
# Coordenadas do "mundo" em pixels da captura (escala nativa). A saída 1280×800 em
# zoom 1 mostra o mundo inteiro, com a janela de 1180 px de largura.
SW, SH = 1440, 732
WORLD_W, WORLD_H = 1562, 976
WIN_X, CHROME = 61, 44
SHOT_X = WIN_X


def win_y(key):
    # as capturas têm 732 ou 788 px de altura: a janela acompanha a captura, centrada, sem esticar
    return (WORLD_H - CHROME - shot(key).height) // 2


def shot_y(key):
    return win_y(key) + CHROME
RADIUS = 16
BG = (236, 236, 241)
FONT = Path.home() / "Library/Fonts/Inter_18pt-Medium.ttf"

_worlds = {}


def world(key):
    if key in _worlds:
        return _worlds[key]
    w = Image.new("RGB", (WORLD_W, WORLD_H), BG)
    SH = shot(key).height
    WIN_Y, SHOT_Y = win_y(key), shot_y(key)
    win = (WIN_X, WIN_Y, WIN_X + SW, SHOT_Y + SH)
    # sombra macia
    sh = Image.new("L", (WORLD_W, WORLD_H), 0)
    ImageDraw.Draw(sh).rounded_rectangle((win[0] + 10, win[1] + 26, win[2] - 10, win[3] + 22), RADIUS, fill=70)
    sh = sh.filter(ImageFilter.GaussianBlur(26))
    w.paste(Image.new("RGB", w.size, (40, 40, 60)), (0, 0), sh)
    # janela: barra do navegador + captura, com cantos arredondados
    pane = Image.new("RGB", (SW, CHROME + SH), (255, 255, 255))
    d = ImageDraw.Draw(pane)
    d.line((0, CHROME - 1, SW, CHROME - 1), fill=(226, 226, 232), width=1)
    for i, c in enumerate([(255, 95, 87), (254, 188, 46), (40, 200, 64)]):
        cx = 24 + i * 22
        d.ellipse((cx - 7, CHROME / 2 - 7, cx + 7, CHROME / 2 + 7), fill=c)
    pw, ph = 460, 28
    px0 = (SW - pw) / 2
    d.rounded_rectangle((px0, (CHROME - ph) / 2, px0 + pw, (CHROME + ph) / 2), 8, fill=(242, 242, 246))
    try:
        f = ImageFont.truetype(str(FONT), 15)
        d.text((SW / 2, CHROME / 2), "JSYNQ Workspace", font=f, fill=(110, 108, 124), anchor="mm")
    except OSError:
        pass
    pane.paste(shot(key), (0, CHROME))
    mask = Image.new("L", pane.size, 0)
    ImageDraw.Draw(mask).rounded_rectangle((0, 0, pane.width - 1, pane.height - 1), RADIUS, fill=255)
    w.paste(pane, (WIN_X, WIN_Y), mask)
    ImageDraw.Draw(w).rounded_rectangle((WIN_X, WIN_Y, WIN_X + SW - 1, WIN_Y + CHROME + SH - 1), RADIUS, outline=(214, 214, 222), width=1)
    _worlds[key] = w
    return w



# ---------------------------------------------------------------- linguagem de movimento
# Duas linguagens, uma batida só:
#  · AÇÃO: o cursor (ou o toque, no celular) vai até o controle, clica e a tela muda.
#    A câmera fica na tela inteira; só se aproxima quando o item é pequeno e isolado
#    (um dropdown, um menu de ícones).
#  · DETALHE: telas cheias de informação. A câmera só se aproxima para mostrar um detalhe
#    e volta à tela inteira, sempre no mesmo nível de zoom.
# Todo movimento (câmera, cursor, troca de tema, arraste) dura MOVE; toda pausa dura HOLD.
# O clique acontece quando o cursor chega, no começo da pausa.
HOLD = 1.6
MOVE = 1.0
PRESS = 0.18  # cursor afunda no clique
UI = 0.3  # a tela muda depois do clique (modal, dropdown, navegação)
Z = 1.6  # o único nível de zoom de detalhe no computador
ACCENT = (41, 104, 76)  # verde do sistema


def ease(p):
    p = min(1.0, max(0.0, p))
    return p * p * (3 - 2 * p) if p < 1 else 1.0


def ease_cam(p):
    # ease in-out senoidal: começa e termina parado, sem tranco
    p = min(1.0, max(0.0, p))
    return 0.5 - 0.5 * math.cos(math.pi * p)


def layers_at(t, shots):
    """shots: [(t_inicio, chave, duração_da_fusão)] — a 1ª entra direto."""
    out = [(shots[0][1], 1.0)]
    for t0, key, fade in shots[1:]:
        if t < t0:
            break
        a = ease((t - t0) / fade) if fade > 0 else 1.0
        if a >= 1:
            out = [(key, 1.0)]
        else:
            out = [(out[-1][0], 1.0), (key, a)]
    return out


def track_at(t, keys):
    """keys: [(t, a, b, …)] interpoladas com ease_cam; devolve os valores."""
    if t <= keys[0][0]:
        return keys[0][1:]
    for a, b in zip(keys, keys[1:]):
        if a[0] <= t <= b[0]:
            p = ease_cam((t - a[0]) / (b[0] - a[0]) if b[0] > a[0] else 1)
            return tuple(a[i] + (b[i] - a[i]) * p for i in range(1, len(a)))
    return keys[-1][1:]


C = (720, 366)  # centro da captura do computador
PC = (390, 768)  # centro da captura do celular
FULL = (C[0], C[1], 1.0)
PFULL = (PC[0], PC[1], 1.0)


def story(first, beats, cursor=None, phone=False):
    """Monta um vídeo a partir de batidas. Cada batida = um movimento (MOVE) + uma pausa (HOLD).

    Chaves de uma batida (todas opcionais):
      cam:   (x, y) foco de detalhe com zoom Z, ou "full" para a tela inteira
      to:    (x, y) para onde o cursor vai durante o movimento, ou [pontos] no caminho
      click: chave da tela que aparece depois do clique (None = clique sem mudar a tela)
      tap:   (x, y) toque no celular; a tela de `click` aparece depois
      fade:  [chaves] fusão durante o movimento (troca de tema, arraste)
      drag:  True = o botão fica apertado durante o movimento (arraste)
      show:  chave que aparece no começo da pausa sem clique (um modal ao abrir a página)
    """
    full = PFULL if phone else FULL
    cam = [(0, *full), (HOLD, *full)]
    curcam = full
    cur = [(0, *cursor), (HOLD, *cursor)] if cursor else None
    pos = cursor
    shots = [(0, first, 0)]
    presses, ripples, taps = [], [], []
    t = HOLD
    for b in beats:
        m0, m1 = t, t + MOVE
        h1 = m1 + HOLD
        if "cam" in b:
            target = full if b["cam"] == "full" else (b["cam"][0], b["cam"][1], Z)
            cam += [(m0, *curcam), (m1, *target)]
            curcam = target
        cam.append((h1, *curcam))
        if "to" in b:
            # um ponto, ou uma lista de pontos percorridos em partes iguais do movimento
            pts = b["to"] if isinstance(b["to"], list) else [b["to"]]
            cur.append((m0, *pos))
            for i, pt in enumerate(pts, 1):
                cur.append((m0 + MOVE * i / len(pts), *pt))
            pos = pts[-1]
        if cur:
            cur.append((h1, *pos))
        if b.get("fade"):
            step = MOVE / len(b["fade"])
            for i, key in enumerate(b["fade"]):
                shots.append((m0 + i * step, key, step))
        if b.get("drag"):
            presses.append((m0 - PRESS, m1))
        if "click" in b and not phone:
            presses.append((m1, m1 + PRESS))
            ripples.append((m1, *pos))
            if b["click"]:
                shots.append((m1 + PRESS / 2, b["click"], UI))
        if "tap" in b:
            taps.append((m1, *b["tap"]))
            shots.append((m1 + PRESS / 2, b["click"], UI))
        if b.get("show"):
            shots.append((m1, b["show"], UI))
        t = h1
    return {"dur": round(t, 3), "cam": cam, "shots": shots, "cursor": cur,
            "presses": presses, "ripples": ripples, "taps": taps, "phone": phone, "mobile": phone}


def detail(key, d1, d2):
    """Tela de informação: tela inteira → detalhe → detalhe → tela inteira."""
    return story(key, [{"cam": d1}, {"cam": d2}, {"cam": "full"}])


def fusion(base, focus=None):
    """Claro → escuro, um detalhe no escuro (se houver foco) → de volta ao claro."""
    return story(f"{base}-claro", [
        {"fade": [f"{base}-escuro"]},
        {"cam": focus} if focus else {},
        {"cam": "full", "fade": [f"{base}-claro"]},
    ])


# ---------------------------------------------------------------- cursor, clique e toque
_cursors = {}


def cursor_img(h):
    """Seta do cursor do macOS (branca com contorno), com altura h em pixels."""
    h = max(8, int(round(h)))
    if h not in _cursors:
        s = 8
        pts = [(0, 0), (0, 17), (4.6, 13.2), (7.6, 20), (10.4, 18.8), (7.5, 12.3), (13, 12.3)]
        u = h * s / 21
        big = Image.new("RGBA", (int(15 * u) + 8 * s, int(22 * u) + 8 * s), (0, 0, 0, 0))
        d = ImageDraw.Draw(big)
        o = 3 * s
        sh = Image.new("RGBA", big.size, (0, 0, 0, 0))
        ImageDraw.Draw(sh).polygon([(o + x * u, o + 1.5 * s + y * u) for x, y in pts], fill=(0, 0, 0, 90))
        big = Image.alpha_composite(big, sh.filter(ImageFilter.GaussianBlur(2 * s)))
        d = ImageDraw.Draw(big)
        d.polygon([(o + x * u, o + y * u) for x, y in pts], fill=(255, 255, 255, 255), outline=(20, 20, 24, 255))
        d.line([(o + x * u, o + y * u) for x, y in pts + pts[:1]], fill=(20, 20, 24, 255), width=max(1, int(1.3 * s * h / 21)), joint="curve")
        img = big.resize((big.width // s, big.height // s), Image.LANCZOS)
        _cursors[h] = (img, 3)  # 3 px de margem até a ponta
    return _cursors[h]


def pressed_at(t, spans):
    for a, b in spans:
        if a <= t <= b:
            return True
    return False


def draw_overlays(frame, t, spec, to_screen, scale):
    """Ondas de clique, toques e cursor por cima do quadro já enquadrado."""
    over = Image.new("RGBA", frame.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(over)
    for t0, x, y in spec["ripples"]:
        p = (t - t0) / 0.5
        if 0 <= p <= 1:
            sx, sy = to_screen(x, y)
            r = (6 + 26 * ease_cam(p)) * scale
            d.ellipse((sx - r, sy - r, sx + r, sy + r), outline=(*ACCENT, int(200 * (1 - p))), width=max(2, int(2.5 * scale)))
    for t0, x, y in spec["taps"]:
        sx, sy = to_screen(x, y)
        base = 30 * scale
        if t0 - 0.45 <= t < t0:  # o dedo chega
            p = ease_cam((t - (t0 - 0.45)) / 0.45)
            r = base * (0.6 + 0.4 * p)
            d.ellipse((sx - r, sy - r, sx + r, sy + r), fill=(20, 20, 24, int(70 * p)), outline=(255, 255, 255, int(200 * p)), width=max(2, int(3 * scale)))
        elif t0 <= t <= t0 + 0.5:  # aperta e solta
            p = (t - t0) / 0.5
            r = base * (0.85 if p < 0.3 else 0.85 + 0.15 * ease_cam((p - 0.3) / 0.7))
            a = 1 - ease_cam(max(0, (p - 0.3) / 0.7))
            d.ellipse((sx - r, sy - r, sx + r, sy + r), fill=(20, 20, 24, int(90 * a)), outline=(255, 255, 255, int(220 * a)), width=max(2, int(3 * scale)))
            rr = base * (1 + 0.9 * ease_cam(p))
            d.ellipse((sx - rr, sy - rr, sx + rr, sy + rr), outline=(255, 255, 255, int(160 * (1 - p))), width=max(2, int(2 * scale)))
    if spec.get("cursor"):
        x, y = track_at(t, spec["cursor"])
        sx, sy = to_screen(x, y)
        k = 0.86 if pressed_at(t, spec["presses"]) else 1.0
        img, m = cursor_img(21 * scale * k)
        over.alpha_composite(img, (int(round(sx - m)), int(round(sy - m))))
    out = frame.convert("RGBA")
    out.alpha_composite(over)
    return out.convert("RGB")


# ---------------------------------------------------------------- render
def render_desktop(t, spec):
    fx, fy, z = track_at(t, spec["cam"])
    s = WORLD_W / 1280
    first = spec["shots"][0][1]
    wx = SHOT_X + fx
    wy = shot_y(first) + fy
    vw, vh = 1280 * s / z, 800 * s / z
    # z = 1 sempre centraliza; acima disso, o foco puxa a câmera sem sair do mundo
    cx = min(max(wx, vw / 2), WORLD_W - vw / 2)
    cy = min(max(wy, vh / 2), WORLD_H - vh / 2)
    k = s / z
    ox, oy = cx - 640 * k, cy - 400 * k
    data = (k, 0, ox, 0, k, oy)
    frame = None
    for key, a in layers_at(t, spec["shots"]):
        im = world(key).transform((1280, 800), Image.AFFINE, data, resample=Image.BICUBIC)
        frame = im if frame is None else Image.blend(frame, im, a)
    sy0 = shot_y(first)
    return draw_overlays(frame, t, spec, lambda x, y: ((SHOT_X + x - ox) / k, (sy0 + y - oy) / k), 1 / k)


# ---------------------------------------------------------------- celular
# Capturas do layout de celular do sistema (390×768 a 2×, 780×1536). A saída 520×1126 é
# um pouco mais alta: a captura ocupa a largura toda e as faixas de cima e de baixo
# repetem a primeira e a última linha (o topo vira a área da barra de status), sem esticar.
PH_W = 780
PH_H = round(PH_W * 1126 / 520)
PH_TOP = (PH_H - 1536) // 2
_phones = {}


def phone(key):
    if key not in _phones:
        im = shot(key)
        w = Image.new("RGB", (PH_W, PH_H))
        top = (PH_H - im.height) // 2
        w.paste(im.crop((0, 0, PH_W, 1)).resize((PH_W, top)), (0, 0))
        w.paste(im.crop((0, im.height - 1, PH_W, im.height)).resize((PH_W, PH_H - top - im.height)), (0, top + im.height))
        w.paste(im, (0, top))
        _phones[key] = w
    return _phones[key]


def render_phone(t, spec):
    W, H = 520, 1126
    fx, fy, z = track_at(t, spec["cam"])
    fy += PH_TOP
    k = PH_W / W / z
    vw, vh = W * k, H * k
    cx = min(max(fx, vw / 2), PH_W - vw / 2)
    cy = min(max(fy, vh / 2), PH_H - vh / 2)
    ox, oy = cx - W / 2 * k, cy - H / 2 * k
    data = (k, 0, ox, 0, k, oy)
    frame = None
    for key, a in layers_at(t, spec["shots"]):
        im = phone(key).transform((W, H), Image.AFFINE, data, resample=Image.BICUBIC)
        frame = im if frame is None else Image.blend(frame, im, a)
    return draw_overlays(frame, t, spec, lambda x, y: ((x - ox) / k, (y + PH_TOP - oy) / k), 1 / k)


def encode(name, spec):
    mobile = spec.get("mobile", False)
    W, H = (520, 1126) if mobile else (1280, 800)
    n = round(spec["dur"] * FPS)
    mp4 = OUT / f"{name}.mp4"
    cmd = [
        "ffmpeg", "-y", "-loglevel", "error",
        "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}", "-r", str(FPS), "-i", "-",
        "-an", "-c:v", "libx264", "-preset", "veryslow", "-crf", str(spec.get("crf", 24)),
        "-pix_fmt", "yuv420p", "-movflags", "+faststart", str(mp4),
    ]
    p = subprocess.Popen(cmd, stdin=subprocess.PIPE)
    render = render_phone if spec.get("phone") else render_desktop
    poster_i = round(POSTER_T * FPS)
    for i in range(n):
        fr = render(i / FPS, spec)
        if i == poster_i:
            fr.save(OUT / f"{name}.jpg", quality=86)
        p.stdin.write(fr.tobytes())
    p.stdin.close()
    if p.wait():
        raise SystemExit(f"ffmpeg falhou em {name}")
    return {"name": name, "device": "mobile" if mobile else "desktop", "file": mp4.name, "poster": f"{name}.jpg",
            "width": W, "height": H, "seconds": round(n / FPS, 2), "bytes": mp4.stat().st_size,
            "crf": spec.get("crf", 24), "modo": "capturas reais + movimento (workspace-motion.py)", "fps": FPS}


# ---------------------------------------------------------------- roteiros
# Pontos em pixels da captura. Sidebar do computador: Início (38, 93), Projetos (38, 196),
# mais módulos (38, 457). Celular: menu (56, 54), barra inferior na altura 1436.
SIDE_HOME, SIDE_PROJ, SIDE_MORE = (38, 93), (38, 196), (38, 457)
REST = (700, 640)  # área vazia do início: o cursor descansa e clica ali para fechar
CARD = (249, 397)  # alça do cartão JSY-1098 no quadro
CARD_MID = (499, 277)  # o mesmo ponto na captura do meio do arraste
CARD_OVER = (547, 253)  # o mesmo ponto com o cartão sobre "In Progress"

SPECS = {}

# vitrine: navegação real pela barra lateral, com o menu de mais módulos, o aviso de
# novidades do calendário e um cartão arrastado no quadro; termina onde começou
SPECS["vitrine-desktop"] = dict(story("acao-home-claro", [
    {"cam": (240, 420), "to": SIDE_MORE, "click": "acao-mais-claro"},      # menu pequeno: zoom
    {"cam": "full", "to": (116, 349), "click": "novidades-calendario-claro"},
    {"to": (924, 656), "click": "calendario-claro"},                       # Pular
    {"to": SIDE_PROJ, "click": "acao-quadro-claro"},
    {"to": CARD},
    {"to": [CARD_MID, CARD_OVER], "drag": True, "fade": ["acao-arraste-1-claro", "acao-arraste-2-claro"]},
    {"to": [CARD_MID, CARD], "drag": True, "fade": ["acao-arraste-1-claro", "acao-quadro-claro"]},
    {"to": SIDE_HOME, "click": "acao-home-claro"},
], cursor=SIDE_HOME), crf=25)

# celular: só ação, sem zoom; toque no menu, nos cartões do menu e na barra inferior
M_MENU, M_BACK = (56, 54), (52, 58)
M_NAV = {"inicio": (104, 1436), "projetos": (246, 1436), "mensagens": (532, 1436)}
SPECS["hero-mobile"] = dict(story("m-home-claro", [
    {"tap": M_MENU, "click": "m-menu-claro"},
    {"tap": (114, 340), "click": "m-ia-claro"},          # JSYNQ IA
    {"tap": M_MENU, "click": "m-menu-claro"},
    {"tap": (318, 765), "click": "m-agenda-claro"},      # Calendário
    {"tap": M_NAV["projetos"], "click": "m-quadro-claro"},
    {"tap": M_NAV["mensagens"], "click": "m-mensagens-claro"},
    {"tap": (370, 380), "click": "m-conversa-claro"},
    {"tap": M_BACK, "click": "m-mensagens-claro"},
    {"tap": M_NAV["inicio"], "click": "m-home-claro"},
], phone=True), crf=27)

SPECS["navegacao-mobile"] = dict(story("m-home-claro", [
    {"fade": ["m-home-escuro"]},
    {"tap": M_MENU, "click": "m-menu-escuro"},
    {"tap": (318, 550), "click": "m-mensagens-escuro"},  # Mensagens
    {"fade": ["m-mensagens-claro"]},
    {"tap": M_NAV["inicio"], "click": "m-home-claro"},
], phone=True), crf=27)

# ação: a etapa da tarefa trocada ali mesmo (dropdown pequeno, com zoom)
SPECS["inicio-desktop"] = story("acao-home-claro", [
    {"cam": (300, 190)},                                                   # detalhe: aviso e contadores
    {"cam": (470, 540), "to": (443, 448), "click": "acao-etapa-claro"},
    {"cam": "full", "to": REST, "click": "acao-home-claro"},
], cursor=REST)

# ação: cartão arrastado de coluna, sem zoom (o arraste é cancelado e volta)
SPECS["quadro-desktop"] = story("acao-quadro-claro", [
    {"to": CARD},
    {"to": [CARD_MID, CARD_OVER], "drag": True, "fade": ["acao-arraste-1-claro", "acao-arraste-2-claro"]},
    {"to": [CARD_MID, CARD], "drag": True, "fade": ["acao-arraste-1-claro", "acao-quadro-claro"]},
    {"to": (600, 560)},
], cursor=(600, 560))

# ação: o aviso de novidades ao abrir o calendário, sem zoom; o detalhe da semana entre um e outro
SPECS["calendario-desktop"] = story("novidades-calendario-claro", [
    {"to": (924, 656), "click": "calendario-claro"},                       # Pular
    {"cam": (720, 430)},                                                   # detalhe: a semana
    {"cam": "full", "to": (1180, 560), "show": "novidades-calendario-claro"},
], cursor=(1180, 560))

# detalhe: telas cheias de informação
SPECS["mensagens-desktop"] = detail("mensagens-escuro", (250, 330), (928, 570))
SPECS["ia-desktop"] = detail("ia-claro", (870, 440), (190, 260))
SPECS["biblioteca-desktop"] = detail("biblioteca-claro", (180, 260), (840, 300))
SPECS["reunioes-desktop"] = detail("reunioes-claro", (760, 320), (760, 450))
SPECS["tarefas-desktop"] = detail("taskhub-claro", (330, 170), (1050, 180))
SPECS["dashboard-desktop"] = detail("dashboard-claro", (310, 500), (1190, 560))
SPECS["contatos-desktop"] = detail("contatos-claro", (320, 140), (1150, 130))
SPECS["produtos-desktop"] = detail("produtos-claro", (940, 90), (420, 330))

# claro × escuro na mesma tela: a troca de tema é o movimento
SPECS["tema-inicio-desktop"] = fusion("home", (700, 330))
SPECS["tema-quadro-desktop"] = fusion("quadro", (600, 380))
SPECS["tema-mensagens-desktop"] = fusion("mensagens")  # câmera parada: a anatomia põe pinos em cima
SPECS["tema-ia-desktop"] = fusion("ia", (870, 420))
SPECS["tema-dashboard-desktop"] = fusion("dashboard", (640, 420))
SPECS["tema-calendario-desktop"] = fusion("calendario", (760, 400))
SPECS["tema-produtos-desktop"] = fusion("produtos", (700, 300))


def main():
    names = sys.argv[1:] or list(SPECS)
    man_path = OUT / "manifest.json"
    man = json.loads(man_path.read_text()) if man_path.exists() else {"site": "jsynq-workspace", "files": []}
    by = {f["name"]: f for f in man["files"] if f["name"] in SPECS}
    for name in names:
        print("gerando", name, flush=True)
        by[name] = encode(name, SPECS[name])
        print(f"  {by[name]['seconds']} s · {by[name]['bytes'] / 1e6:.2f} MB", flush=True)
    man["files"] = [by[n] for n in SPECS if n in by]
    man_path.write_text(json.dumps(man, indent=2, ensure_ascii=False) + "\n")


if __name__ == "__main__":
    main()
