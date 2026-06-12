# 圖片與資源存放位置 (Assets/Images)
請將專案中需要被 Astro/Vite 打包與優化的圖片放於此處，例如：
- Header Logo (例如 `logo.png`)
- 社群 Icon (例如 `facebook.svg`, `line.svg`)
- 主視覺背景圖等

### 在 Vue 元件中使用方式：
```html
<script setup>
import logo from '../assets/images/logo.png';
</script>

<template>
  <img :src="logo" alt="Logo" />
</template>
```
