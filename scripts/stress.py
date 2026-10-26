#!/usr/bin/env python3
"""Проставляет ударения во всех озвучиваемых строках.
Без них синтез читает «бабочка» как «бабушка», а редкие слова — наугад.
ruaccent отмечает ударный гласный знаком «+» перед ним; переводим его
в комбинирующий акут после гласной — такую разметку модель понимает.

Модель омографов в onnxruntime требует вход token_type_ids, которого
обёртка не передаёт; дописываем его нулями, иначе библиотека падает
на любой фразе с омографом."""
import json, re
import numpy as np
import onnxruntime

_orig_run = onnxruntime.InferenceSession.run
def _run(self, out, feed, *a, **k):
    names = {i.name for i in self.get_inputs()}
    if 'token_type_ids' in names and 'token_type_ids' not in feed and 'input_ids' in feed:
        feed = dict(feed)
        feed['token_type_ids'] = np.zeros_like(np.asarray(feed['input_ids']))
    return _orig_run(self, out, feed, *a, **k)
onnxruntime.InferenceSession.run = _run

from ruaccent import RUAccent

acc = RUAccent()
acc.load(omograph_model_size='turbo3.1', use_dictionary=True, tiny_mode=False)

def to_combining(s):
    return re.sub(r'\+([аеёиоуыэюяАЕЁИОУЫЭЮЯ])', lambda m: m.group(1) + '́', s)

VOWELS = 'аеёиоуыэюяАЕЁИОУЫЭЮЯ'

def strip_monosyllables(s):
    """Знак ударения на односложном слове ничего не уточняет, но сбивает синтез:
    «Э́то ло́сь» читалось как «Это лысь», «на́ маку́шке» — с ударением на предлог."""
    def fix(m):
        w = m.group(0)
        bare = w.replace('\u0301', '')
        return bare if sum(c in VOWELS for c in bare) <= 1 else w
    return re.sub(r'[А-Яа-яЁё\u0301-]+', fix, s)

# ruaccent ошибается на именах и редких словах — правим точечно
MANUAL = {
    'Стеша\u0301': 'Сте\u0301ша', 'стеша\u0301': 'сте\u0301ша',
}

lines = json.load(open('content/voice-lines.json', encoding='utf-8'))
out, failed = {}, []
for ln in lines:
    clean = ln['text'].replace('́', '')
    try:
        t = to_combining(acc.process_all(clean))
        for a, b in MANUAL.items():
            t = t.replace(a, b)
        out[ln['key']] = strip_monosyllables(t)
    except Exception as e:
        failed.append((ln['key'], str(e)[:60]))
        out[ln['key']] = strip_monosyllables(clean)
json.dump(out, open('content/voice-stress.json', 'w'), ensure_ascii=False, indent=1)
print('строк с ударениями:', len(out) - len(failed), 'из', len(out))
for k, e in failed:
    print('  не обработано:', k, e)
for k in ('a-butterfly-name', 'a-starnosedmole-kid', 't-star-name', 'a-orca-kid', 't-dust-kid'):
    if k in out:
        print(' ', k, '→', out[k])
