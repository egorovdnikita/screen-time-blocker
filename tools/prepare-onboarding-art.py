"""Убирает английские надписи и нарисованные кнопки из иллюстрации телефона.
Исходная HTML-выгрузка только читается; русские подписи и кнопки рисует React Native.
"""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter
root = Path(__file__).resolve().parents[1]
source = root.parent / 'block/dist/00-onboarding__02-intro-friction/assets/art/onboarding-friction-phone-clean.png'
image = Image.open(source).convert('RGB')
width, height = image.size
sx, sy = width / 1179, height / 1395
# Растушёванная заливка между соседними участками фона скрывает старую подпись.
box = tuple(round(v * (sx if i % 2 == 0 else sy)) for i, v in enumerate((180,650,1005,890)))
x0,y0,x1,y1 = box
field = image.copy()
pixels = field.load()
original = image.load()
for y in range(y0,y1):
    left, right = original[x0,y], original[x1,y]
    for x in range(x0,x1):
        t=(x-x0)/(x1-x0)
        pixels[x,y]=tuple(round(left[k]*(1-t)+right[k]*t) for k in range(3))
mask=Image.new('L',image.size)
ImageDraw.Draw(mask).rounded_rectangle(box,radius=30*sx,fill=255)
mask=mask.filter(ImageFilter.GaussianBlur(14*sx))
image=Image.composite(field,image,mask)
# Английская подпись второй кнопки: контур и свечение из растра остаются, как в HTML; русская подпись — компонентом.
box=tuple(round(v*(sx if i%2==0 else sy)) for i,v in enumerate((465,1172,715,1234)))
x0,y0,x1,y1=box
field=image.copy(); pixels=field.load(); original=image.load()
for y in range(y0,y1):
    left,right=original[x0,y],original[x1,y]
    for x in range(x0,x1):
        t=(x-x0)/(x1-x0)
        pixels[x,y]=tuple(round(left[k]*(1-t)+right[k]*t) for k in range(3))
mask=Image.new('L',image.size)
ImageDraw.Draw(mask).rounded_rectangle(box,radius=20*sx,fill=255)
mask=mask.filter(ImageFilter.GaussianBlur(7*sx))
image=Image.composite(field,image,mask)
image.save(root/'assets/art/onboarding/onboarding-friction-phone-clean.png')
# У фона первого экрана удаляется растровая копия статус-бара: на iPhone его рисует iOS.
sky_source=root.parent/'block/dist/00-onboarding__01-welcome/assets/art/welcome-sky-reference.png'
sky=Image.open(sky_source).convert('RGB')
cut=round(sky.height*59/852)
row=sky.crop((0,cut,sky.width,cut+1)).resize((sky.width,cut))
sky.paste(row,(0,0))
sky.save(root/'assets/art/onboarding/welcome-sky-reference.png')
