#!/usr/bin/env python3
"""Acha, em cada gravação do reel, a janela com mais movimento (onde o efeito acontece) e grava o
início em `from` no configs.json. Dos celulares, fica com os 3 de mais movimento.
Uso: python3 -I scripts/reels/peaks.py"""
import json, os, re, subprocess

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "../.."))
CFG = os.path.join(ROOT, "scripts/reels/configs.json")
WIN = {"details": 1.4, "phones": 3.2, "build": 4.2}  # segundos de cada trecho na tela (igual ao reel.html)


def motion(src):
    r = subprocess.run(["ffmpeg", "-hide_banner", "-i", ROOT + "/public" + src, "-vf",
                        "fps=15,scale=160:-2,format=gray,tblend=all_mode=difference,signalstats,metadata=print:key=lavfi.signalstats.YAVG",
                        "-an", "-f", "null", "-"], capture_output=True, text=True).stderr
    t = [float(x) for x in re.findall(r"pts_time:([\d.]+)", r)]
    v = [float(x) for x in re.findall(r"YAVG=([\d.]+)", r)]
    return list(zip(t, v))


def peak(clip, win):
    pts = motion(clip["src"])
    if not pts:
        clip["from"], clip["score"] = 0, 0
        return
    dur = pts[-1][0]
    best, best_s = 0.0, -1.0
    for i, (t0, _) in enumerate(pts):
        if t0 + win > dur and best_s >= 0:
            break
        s = sum(v for t, v in pts[i:] if t < t0 + win)
        if s > best_s:
            best_s, best = s, t0
    # começa 0,3 s antes para o efeito entrar inteiro
    clip["from"], clip["score"] = round(max(0.0, best - 0.3), 2), round(best_s, 1)


configs = json.load(open(CFG))
for c in configs:
    for clip in c["details"]:
        peak(clip, WIN["details"])
    for clip in c["phones"]:
        peak(clip, WIN["phones"])
    c["phones"] = sorted(c["phones"], key=lambda x: -x["score"])[:3]
    if c.get("build"):
        c["build"]["from"] = 0  # a construção do símbolo vai do começo
    print(c["slug"], [p["src"].split("/")[-1] for p in c["phones"]], flush=True)
json.dump(configs, open(CFG, "w"), indent=1, ensure_ascii=False)
