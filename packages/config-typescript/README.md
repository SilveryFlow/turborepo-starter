### typescript共享包

typescript-config应该分文件进行不同环境的tsconfig配置

```bash
packages/config-typescript/
├── package.json
├── tsconfig.base.json			# 公共基础配置
├── tsconfig.vue.json    		# apps/Vue 业务代码用
├── tsconfig.node.json       	# vite.config.ts 等node环境工具用
├── tsconfig.library.json    	# packages/* 等库用
└── tsconfig.vitest.json		# 测试环境的 TS 配置
```
