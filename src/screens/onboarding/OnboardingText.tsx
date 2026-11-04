import type { ComponentProps } from 'react';
import { T as BaseT } from '@/theme/typography';
import { onboardingTheme as c } from '@/theme/tokens';

// Экраны настройки 015–025 в HTML набраны #111, а не #000 общего T (исключения 018 и 024 передают цвет сами).
export function T({ color = c.ink, ...props }: ComponentProps<typeof BaseT>) {
  return <BaseT color={color} {...props} />;
}
