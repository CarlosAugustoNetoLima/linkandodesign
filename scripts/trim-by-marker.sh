#!/bin/bash
# burst 1 (início) e burst 2 (fim) de magenta: corta exatamente entre eles
for f in /tmp/live/*-desktop.webm /tmp/live/*-mobile.webm; do
  times=$(ffmpeg -v info -i "$f" -vf "signalstats,metadata=print" -f null - 2>&1 | awk '
    /pts_time/ { split($0,a,"pts_time:"); t=a[2]+0 }
    /UAVG/ { split($0,b,"="); u=b[2]+0 }
    /VAVG/ { split($0,c,"="); v=c[2]+0; if (u>180 && v>200) print t }')
  read start dur <<< $(echo "$times" | awk '
    NR==1 { first=$1; b1end=$1 }
    { if ($1 < first+2) b1end=$1; else if (!t2) t2=$1 }
    END { s=b1end+0.12; printf "%.3f %.3f", s, t2-s-0.08 }')
  if [ -z "$start" ] || [ -z "$dur" ]; then echo "FALHOU: $f"; exit 1; fi
  out="${f%.webm}.mp4"
  ffmpeg -y -v error -ss "$start" -i "$f" -t "$dur" -c:v libx264 -crf 20 -preset fast -pix_fmt yuv420p "$out"
  echo "$(basename $f): timeline ${start}s + ${dur}s"
done
