# 派对游戏站 · CI/CD 与双平台同步设置手册（项目作者视角）

本文件记录「开源协作 + 自动审核 + 作者批准 + GitHub/Gitee 同步」这一套流程的搭建步骤。
代码已包含所需配置文件，本手册是**需要你在网页后台手动完成**的那部分（需要账号与密钥，无法纯靠代码完成）。

---

## 设计原则

- **GitHub 是唯一的贡献入口**：PR、CI、分支保护、CODEOWNERS 全部在 GitHub 上。
- **Gitee 是只读镜像**：仅用于国内访问加速，不用在 Gitee 上收 PR（避免双写冲突）。
- **合并门槛 = 自动审核(CI 绿) + 作者批准(CODEOWNERS 强制)**：二者缺一不可。

已落地的配置文件：
- `.github/workflows/ci.yml` —— PR/推送时跑 类型检查 + 构建 + 端到端测试，作为必选门禁。
- `.github/workflows/mirror.yml` —— 合并到 main 后自动镜像到 Gitee。
- `.github/CODEOWNERS` —— 所有改动需 `@lshstruggle` 审阅（配合分支保护生效）。
- `.github/PULL_REQUEST_TEMPLATE.md` —— PR 模板。
- `CONTRIBUTING.md` —— 给贡献者的新手攻略。

---

## 第一步：把配置推送到 GitHub

本地的配置文件已经写好，需要提交并推送到 `main`：

```bash
git add .github package.json package-lock.json packages/server/src/room.ts \
        packages/web/src/lib/client.ts packages/web/src/features/games/DrawGame.tsx \
        packages/server/test/full-e2e.mjs
git commit -m "ci: 接入 GitHub Actions 审核 + Gitee 镜像，并修复 server 类型检查"
git push origin main
```

> 推送后，以后所有 PR 都会自动触发 CI。

---

## 第二步：开启 GitHub Actions

1. 进入仓库 **Settings → Actions → General**。
2. 在 "Workflow permissions" 选择 **Read and write permissions**（镜像步骤需要写权限，可选；CI 本身只读也可跑）。
3. 确认 Actions 已启用（默认开启）。

---

## 第三步：设置分支保护规则（核心门槛）

进入 **Settings → Branches → Add rule**：

| 设置项 | 值 | 作用 |
| --- | --- | --- |
| Branch name pattern | `main` | 保护主分支 |
| Require a pull request before merging | ✅ 勾选 | 禁止直接 push 合入 |
| Require approvals | `1` | 至少 1 人批准 |
| Require review from code owners | ✅ 勾选 | 强制 `@lshstruggle` 批准（见 CODEOWNERS） |
| Dismiss stale approvals when new commits are pushed | ✅ 勾选 | 改了代码要重新审 |
| Require status checks to pass before merging | ✅ 勾选，并搜索勾选 **`verify`** | 必须 CI 全绿 |
| Do not allow bypassing the above settings | ✅ 勾选 | 连作者自己也不能绕过 |

> 关键点：`verify` 是 `ci.yml` 里的 job 名称，必须作为「必选状态检查」加入，否则 CI 没跑完也能合并。

完成后：任何 PR（包括作者自己提的）都必须 **CI 绿 + 作者批准** 才能合并。

---

## 第四步：配置 Gitee 镜像（GitHub → Gitee）

### 4.1 在 Gitee 建仓库
1. 登录 https://gitee.com ，新建仓库，路径为 `lshstruggle/party-games`（与 GitHub 同名）。
2. 仓库说明随意，初始化**不要**勾选 README（保持空，等镜像覆盖）。

### 4.2 准备 Gitee SSH 密钥（用于推送）
在本机生成一对密钥（不要覆盖你已有的）：
```bash
ssh-keygen -t ed25519 -f ~/.ssh/gitee_mirror -C "ci-mirror"
cat ~/.ssh/gitee_mirror.pub
```
- 把 **公钥** 添加到 Gitee：**设置 → SSH 公钥**。
- 把 **私钥**（`~/.ssh/gitee_mirror` 内容，含 `-----BEGIN/END-----`）稍后填进 GitHub Secrets。

### 4.3 准备 Gitee 私人令牌（用于 API）
1. Gitee：**设置 → 私人令牌**，生成令牌，勾选 `projects` 相关权限。
2. 复制令牌字符串，稍后填进 GitHub Secrets。

### 4.4 在 GitHub 配置 Secrets
进入仓库 **Settings → Secrets and variables → Actions → New repository secret**，添加两个：

| 名称 | 值 |
| --- | --- |
| `GITEE_PRIVATE_KEY` | 4.2 生成的 **私钥** 全文 |
| `GITEE_TOKEN` | 4.3 生成的 **私人令牌** |

### 4.5 验证镜像
在 GitHub 往 `main` 推一次提交（或到 **Actions → Mirror to Gitee → Run workflow** 手动触发）。
成功后，Gitee 的 `lshstruggle/party-games` 会出现与 GitHub 完全一致的最新代码。

> 可选加固：在 Gitee 仓库设置里关闭「允许强制推送 / 允许他人派生后直接推」，把它当纯镜像。

---

## 第五步：给贡献者指路

把 `CONTRIBUTING.md` 链接发给想参与的朋友即可。他们按「Fork → 分支 → 改 → 自测 → PR」操作，
你的 GitHub 会收到 PR 通知，CI 自动审核，你点 Approve 即可合并，合并后 Gitee 自动同步。

---

## 常见问题

**Q: Fork 来的 PR 能跑 CI 吗？能跑镜像吗？**
A: CI（`ci.yml`）只用到公开 npm 依赖，**Fork PR 也能跑**。镜像（`mirror.yml`）只在你自己的仓库 push 时触发，与 Fork 无关。

**Q: CI 一直不出现 / 卡住？**
A: 确认 `main` 已包含 `.github/workflows/ci.yml`；Fork 仓库默认不开 Actions，贡献者首次需在其 Fork 里点一下 "Enable Actions"。

**Q: 想让 Gitee 也能收 PR 并同步回 GitHub？**
A: 进阶玩法，需在 Gitee 也配 CI + 反向同步 webhook，复杂度高。当前标准方案（GitHub 为唯一入口）已满足「开放贡献 + 自动审核 + 作者批准 + 双平台代码一致」。如需双写，另行评估。
