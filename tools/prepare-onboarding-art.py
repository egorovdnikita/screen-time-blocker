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
# Нижняя область остаётся нейтральной: нативная синяя кнопка не дублирует растр
# и не окрашивает область под второй кнопкой.
field=image.copy(); pixels=field.load()
y0=round(925*sy); x0=round(105*sx); x1=round(1074*sx)
for y in range(y0,height):
    t=(y-y0)/(height-y0)
    grey=round(64+(255-64)*(t**.8))
    for x in range(x0,x1): pixels[x,y]=(grey,grey,grey)
mask=Image.new('L',image.size)
ImageDraw.Draw(mask).rectangle((x0,y0,x1,height+60),fill=255)
mask=mask.filter(ImageFilter.GaussianBlur(14*sx))
image=Image.composite(field,image,mask)
pixels=image.load()
for y in range(round(920*sy),height):
    for x in range(width):
        r,g,b=pixels[x,y]
        if b-r>15 and g-r>5:
            grey=255 if x<round(105*sx) or x>round(1074*sx) else round((r+g+b)/3)
            pixels[x,y]=(grey,grey,grey)
image.save(root/'assets/art/onboarding/onboarding-friction-phone-clean.png')
# У фона первого экрана удаляется растровая копия статус-бара: на iPhone его рисует iOS.
sky_source=root.parent/'block/dist/00-onboarding__01-welcome/assets/art/welcome-sky-reference.png'
sky=Image.open(sky_source).convert('RGB')
cut=round(sky.height*59/852)
row=sky.crop((0,cut,sky.width,cut+1)).resize((sky.width,cut))
sky.paste(row,(0,0))
sky.save(root/'assets/art/onboarding/welcome-sky-reference.png')
