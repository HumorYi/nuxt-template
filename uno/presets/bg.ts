import type { Preset } from 'unocss'

interface MyPresetOptions {
  name?: string
}

const regBg = /^bg-/

export default function bgPreset(_options: MyPresetOptions): Preset {
  return {
    name: 'bg-preset',
    rules: [[regBg, () => ({ 'background-color': '#ddd' })]],
    variants: [
      // ...
    ],
    // 它支持您在根配置中拥有的大多数配置
  }
}
