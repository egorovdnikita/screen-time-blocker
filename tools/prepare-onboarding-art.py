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
# В исходном небе остались тёмные следы английского текста и обрезанный край облака (координаты px 1179×2556).
def soften(image,box,feather):
    mask=Image.new('L',image.size)
    ImageDraw.Draw(mask).rectangle(box,fill=255)
    return mask.filter(ImageFilter.GaussianBlur(feather))
# На чистом голубом участке каждый столбец заново протягивается между верхней и нижней границей.
soft=sky.filter(ImageFilter.GaussianBlur(10))
for box,feather in (((60,412,1125,512),12),((300,665,1050,822),30)):
    x0,y0,x1,y1=box
    field=sky.copy(); pixels=field.load(); source=soft.load()
    for x in range(x0,x1):
        top,bottom=source[x,y0],source[x,y1]
        for y in range(y0,y1):
            t=(y-y0)/(y1-y0)
            pixels[x,y]=tuple(round(top[k]*(1-t)+bottom[k]*t) for k in range(3))
    sky=Image.composite(field,sky,soften(sky,box,feather))
# Над облаком протягивать нельзя: след только размывается, облако там и так мягкое.
sky=Image.composite(sky.filter(ImageFilter.GaussianBlur(26)),sky,soften(sky,(118,672,290,812),14))
sky=Image.composite(sky.filter(ImageFilter.GaussianBlur(11)),sky,soften(sky,(120,532,370,560),12))
sky.save(root/'assets/art/onboarding/welcome-sky-reference.png')
