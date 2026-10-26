#!/usr/bin/env python3
"""Проверка «не напугает ли»: слушать я не могу, поэтому меряю то,
что делает звук страшным — резкую атаку, визгливость и длину.
Ребёнок испугался ежа: 6 секунд злого фырканья."""
import sys, subprocess, json
import numpy as np

def load(path, sr=22050):
    raw = subprocess.run(['ffmpeg','-v','quiet','-i',path,'-ac','1','-ar',str(sr),
                          '-f','f32le','-'], capture_output=True).stdout
    return np.frombuffer(raw, dtype=np.float32), sr

for path in sys.argv[1:]:
    x, sr = load(path)
    if x.size == 0:
        print(f'{path}: не читается'); continue
    dur = x.size / sr
    env = np.abs(x)
    win = max(1, sr // 100)
    env = np.convolve(env, np.ones(win) / win, mode='same')
    peak_at = int(np.argmax(env)) / sr
    # спектральный центроид: чем выше, тем визгливее
    f = np.fft.rfft(x * np.hanning(x.size))
    mag = np.abs(f); freq = np.fft.rfftfreq(x.size, 1 / sr)
    centroid = float((mag * freq).sum() / max(mag.sum(), 1e-9))
    crest = float(np.max(np.abs(x)) / max(np.sqrt((x ** 2).mean()), 1e-9))
    bad = []
    if dur > 3.0: bad.append(f'длинный {dur:.1f}с')
    if peak_at < 0.08: bad.append(f'резкая атака (пик на {peak_at*1000:.0f} мс)')
    if centroid > 2600: bad.append(f'визгливый ({centroid:.0f} Гц)')
    if crest > 9: bad.append(f'скачок громкости (крест {crest:.1f})')
    print(f'{path}: {dur:.1f}с, пик {peak_at*1000:.0f} мс, центроид {centroid:.0f} Гц, крест {crest:.1f}'
          f'  -> {"; ".join(bad) if bad else "ок"}')
