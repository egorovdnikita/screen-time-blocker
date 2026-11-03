# coding: utf-8
"""Убирает запечённые подложки UI из фоновых фотографий галереи.
Запуск: python tools/gen-gallery-art.py ../block/assets/art assets/art/gallery
Требует Pillow, numpy и OpenCV; зависимости ставятся отдельно от Expo.
"""
import sys
from pathlib import Path
import cv2
import numpy as np
from PIL import Image

source, target = map(Path, sys.argv[1:3])
target.mkdir(parents=True, exist_ok=True)
for name in ['work', 'focus', 'intention', 'limit', 'wind', 'morning']:
    image = np.array(Image.open(source / ('gallery-' + name + '-clean.png')).convert('RGB'))
    mask = np.zeros(image.shape[:2], dtype=np.uint8)
    # Охватить рамки целиком, включая наружное свечение и остатки букв.
    cv2.rectangle(mask, (22, 18), (image.shape[1] - 22, 124), 255, -1)
    cv2.rectangle(mask, (20, 510), (image.shape[1] - 20, 653), 255, -1)
    restored = cv2.inpaint(image, mask, 9, cv2.INPAINT_TELEA)
    soft = cv2.GaussianBlur(restored, (0, 0), 6)
    alpha = cv2.GaussianBlur(mask, (0, 0), 3).astype(float)[:, :, None] / 255
    result = (soft * alpha + image * (1 - alpha)).astype(np.uint8)
    Image.fromarray(result).save(target / (name + '.png'))
