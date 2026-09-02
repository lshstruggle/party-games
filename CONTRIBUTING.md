# 贡献指南 · 聚好玩（party-games）

欢迎来玩、来改、来提建议！本项目采用 **标准的开源协作流程**：任何人都可以参与贡献，但每一笔改动都要先通过**自动化审核（CI）**，再经过**项目作者批准**才会被合并进主分支。

> 一句话流程：**Fork → 开分支 → 改代码 → 本地自测 → 提 PR → 等 CI 全绿 + 作者批准 → 合并**

---

## 一、两种参与方式

| 方式 | 适合谁 | 怎么合入 |
| --- | --- | --- |
| **A. Fork + PR（推荐）** | 外部贡献者、第一次来的人 | 在你的 Fork 上改，提 PR 到 `lshstruggle/party-games` |
| **B. 直接 Clone（协作者）** | 已被加入仓库协作者的成员 | 直接 clone 主仓库，开分支提 PR（同样要审核+批准） |

无论哪种，**贡献入口都是 GitHub**，Gitee 只是国内访问用的只读镜像（自动同步，不用在 Gitee 上提 PR）。

---

## 二、准备环境

1. 安装 **Git**（https://git-scm.com/）
2. 安装 **Node.js 20 及以上**（推荐用 `nvm` 管理）
   ```bash
   nvm install 20 && nvm use 20
   node -v   # 应显示 v20.x 或更高
   ```
3. 注册一个 **GitHub** 账号（Gitee 镜像会自动同步，贡献只走 GitHub）

---

## 三、Fork 并克隆（方式 A）

1. 打开 https://github.com/lshstruggle/party-games ，点击右上角 **Fork**（网页操作）。
2. 克隆**你自己的** Fork 到本地：
   ```bash
   git clone https://github.com/<你的用户名>/party-games.git
   cd party-games
   ```
3. 添加上游仓库，方便随时同步最新代码：
   ```bash
   git remote add upstream https://github.com/lshstruggle/party-games.git
   git fetch upstream
   ```

> 方式 B（协作者）则直接：
> ```bash
> git clone https://github.com/lshstruggle/party-games.git
> cd party-games
> ```

---

## 四、创建你的开发分支

```bash
git checkout -b feat/你的功能名      # 新功能
# 或
git checkout -b fix/问题描述         # 修 bug
```
分支名建议带前缀：`feat/` `fix/` `docs/` `refactor/`。

---

## 五、安装依赖 & 本地启动

```bash
npm install                       # 安装所有 workspace 依赖（含 web / server）
npm run dev                       # 启动前端（Vite，默认 http://localhost:5173）
```

另开一个终端，启动联机后端（WebSocket 服务，默认 `ws://localhost:3000`）：

```bash
npm -w @pg/server run build      # 先构建一次
node packages/server/dist/server.cjs
```

现在打开两个浏览器窗口（或两个设备）访问前端，即可多人联机自测。

---

## 六、改完之后：本地自测

提交前请务必在本地跑通以下检查（CI 也会自动跑，提前跑能省时间）：

```bash
# 1) 类型检查（shared / game-core / worker / web / server）
npm run typecheck

# 2) 构建（前端 + 后端）
npm run build
npm -w @pg/server run build

# 3) 端到端测试：脚本会自己在 3000 端口拉起一个服务并跑全部 5 款游戏 + 断线重连 + 房主转移
node packages/server/test/full-e2e.mjs
```

看到 `结果: N 通过 / 0 失败` 即为通过。

---

## 七、提交改动

提交信息建议遵循 **约定式提交（Conventional Commits）**，方便生成变更日志：

```
<type>(<scope>): <一句话描述>

type:   feat(新功能) | fix(修bug) | docs(文档) | refactor(重构) | test(测试) | chore(杂务)
scope:  可选，如 draw / spy / server / web
```

示例：
```
fix(draw): 修复猜测方看不到笔画的同步 bug
feat(spy): 增加平局重投轮提示
```

```bash
git add .
git commit -m "fix(draw): 修复猜测方看不到笔画的同步 bug"
```

> 注意：**不要提交** `node_modules/`、`dist/`、`.env`（这些已在 `.gitignore` 中忽略）。

---

## 八、同步上游 & 推送到你的 Fork

如果主仓库在你开发期间有更新，先同步再推送，避免冲突：

```bash
git fetch upstream
git rebase upstream/main      # 有冲突就解决冲突后 git rebase --continue

git push origin feat/你的功能名
```

---

## 九、在 GitHub 上开 Pull Request（PR）

1. 进入你的 Fork 页面 → **Pull requests** → **New pull request**。
2. 设置：
   - **base repository**：`lshstruggle/party-games`，**base**：`main`
   - **compare**：你的分支
3. 填写 PR 模板，勾选**自查清单**。
4. 点击 **Create pull request**。

提交后会发生什么：
- **自动化审核（CI）** 会自动运行：类型检查 → 构建 → 端到端测试。
- 必须 **✅ CI 全绿**，且 **✅ 作者（@lshstruggle）批准**，PR 才会被允许合并。
- 若 CI 报红：点开日志看原因，在本地修好后再 `git push`（会自动追加到同一个 PR，重新触发 CI）。
- 作者可能留下评论/改动请求，按建议修改后重新推送即可。

---

## 十、几条小约定

- 一个 PR **聚焦一件事**，别把“修 bug + 加功能 + 改文档”混在一起。
- 改动游戏逻辑时，**一定跑 E2E 测试**，确认 5 款游戏都不回归。
- 只改和本次 PR 相关的文件，不要顺手格式化无关代码。
- 有疑问先在 PR 里评论，或参考 `docs/SETUP-CI-CD.md`（作者视角的配置说明）。

感谢你的贡献 🎉
