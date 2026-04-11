# Nuxt 项目模板 架构设计

## 基础架构遵循 [Nuxt 架构](https://nuxt.zhcndoc.com/docs/4.x/directory-structure)

## [API 设计](./docs/API.md)

## [路由权限 设计](./docs/路由权限.md)

## [多语言](./docs/多语言.md)

## [前端开发规范](./docs/前端开发规范.md)

## 自动导入

- 排除 utils 目录，因为文件名比较通用易混淆，而且加文件名前缀有些不是很适合，所以不自动导入
- 保留 composables 目录，因为文件名比较好识别，而且内容比较单一，导出方式统一以文件名为前缀
- 新增 stores 目录，因为导出内容比较单一，好识别
