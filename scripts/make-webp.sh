#!/bin/bash
# Converte as gravações de /tmp/live/*.webm em webp animado + poster estático.
#
# Por que o retiming: o webm do Playwright é CFR 25fps. Em sites pesados o
# compositor descarta frames, e como o muxer só empilha o que sobrou a 25fps,
# a timeline encolhe — 9.8s reais viram ~7s de vídeo e o scroll toca acelerado,
# em velocidade diferente por site. Como a timeline tem duração real conhecida,
# reesticamos cada clipe para TIMELINE segundos e todos voltam à velocidade real.
set -euo pipefail

TIMELINE=9.8          # duração real da timeline em scripts/record-sites.mjs
FPS=12                # cadência do webp animado
Q=50                  # qualidade lossy do webp (abaixo disto degrada sem encolher)
M=6                   # esforço de compressão (0=rápido, 6=menor arquivo)
OUT=/Users/carloslima/linkando-design/public/projects/motion
mkdir -p "$OUT"

for f in /tmp/live/*-desktop.webm /tmp/live/*-mobile.webm; do
  [ -e "$f" ] || continue
  base=$(basename "$f" .webm)
  case "$base" in
    *-desktop) W=640 ;;
    *-mobile)  W=220 ;;
  esac

  # Detecta os dois bursts magenta (#ff00ff → Y~106 U~202 V~223 em frame cheio).
  times=$(ffmpeg -v info -i "$f" -vf "signalstats,metadata=print" -f null - 2>&1 | awk '
    /pts_time/ { split($0,a,"pts_time:"); t=a[2]+0 }
    /UAVG/ { split($0,b,"="); u=b[2]+0 }
    /VAVG/ { split($0,c,"="); v=c[2]+0; if (u>195 && v>210) print t }')

  read -r start dur <<<"$(echo "$times" | awk '
    NR==1 { first=$1; b1end=$1 }
    { if ($1 < first+2) b1end=$1; else if (!t2) t2=$1 }
    END { s=b1end+0.10; printf "%.3f %.3f", s, t2-s-0.06 }')"

  if [ -z "$start" ] || [ -z "$dur" ] || [ "${dur%%.*}" -lt 3 ]; then
    echo "FALHOU (marcador não encontrado): $base"; exit 1
  fi

  # setpts reestica o trecho cortado para a duração real da timeline
  ratio=$(python3 -c "print(f'{$TIMELINE/$dur:.6f}')")

  # Este build do ffmpeg não traz encoder webp: extraímos frames e montamos
  # o webp animado com img2webp (libwebp).
  tmp=$(mktemp -d)
  ffmpeg -y -v error -ss "$start" -t "$dur" -i "$f" \
    -vf "setpts=${ratio}*PTS,fps=${FPS},scale=${W}:-2:flags=lanczos" \
    "$tmp/f-%04d.png"

  delay=$(python3 -c "print(round(1000/$FPS))")
  # -kmax 1 força todo frame a ser keyframe. Sem isso, a predição inter-frame
  # do webp acumula erro num scroll (onde a tela toda muda a cada frame) e o
  # meio da animação sai corrompido em blocos. Custa ~50% de tamanho.
  # Opções por frame (-d/-lossy/-q/-m) valem para as imagens listadas depois delas.
  img2webp -loop 0 -kmax 1 -d "$delay" -lossy -q $Q -m $M "$tmp"/f-*.png -o "$OUT/${base}.webp" >/dev/null

  # poster: primeiro frame, para o card carregar leve e só animar quando visível
  cwebp -quiet -q 72 "$tmp/f-0001.png" -o "$OUT/${base}-poster.webp"

  frames=$(ls "$tmp"/f-*.png | wc -l | tr -d ' ')
  rm -rf "$tmp"

  echo "ok: ${base} — corte ${start}s+${dur}s → ${TIMELINE}s (x$(python3 -c "print(f'{$ratio:.2f}')"), ${frames}f) $(du -h "$OUT/${base}.webp" | cut -f1)"
done
