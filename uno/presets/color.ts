import type { Preset } from 'unocss'

interface MyPresetOptions {
  name?: string
}

const regColor = /^c-/

export default function colorPreset(_options: MyPresetOptions): Preset {
  // console.log(options)

  return {
    name: 'color-preset',
    rules: [[regColor, () => ({ color: 'green' })]],
    variants: [
      // ...
    ],
    // 它支持您在根配置中拥有的大多数配置
  }
}
