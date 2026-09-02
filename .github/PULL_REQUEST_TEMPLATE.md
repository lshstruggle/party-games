## 变更说明 / What this PR does
<!-- 用 1-3 句话说明这次 PR 改了什么、为什么 -->

## 关联
<!-- 例如：修复 #12 / 关联需求 XXX（没有可留空） -->

## 自查清单 / Checklist
- [ ] 本地已运行 `npm run typecheck` 无报错（涵盖 shared/game-core/worker/web/server）
- [ ] 本地已运行 `npm run build` 与 `npm -w @pg/server run build` 成功
- [ ] 如涉及游戏逻辑，已运行端到端测试：`node packages/server/test/full-e2e.mjs`
- [ ] 未提交 `node_modules/`、`dist/`、`.env` 等被 gitignore 的文件
- [ ] 提交信息清晰（规范见 CONTRIBUTING.md，例如 `fix(draw): ...`）

## 给审阅者的最快验证方式 / How to test
<!-- 给作者一个最快验证你改动的方式，例如：开一局你画我猜，验证笔画同步 -->
