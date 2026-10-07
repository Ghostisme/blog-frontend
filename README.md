# blog-frontend

blog.darkrich.com 个人博客前端。React 19 · TypeScript · Vite 8 · Ant Design 6。

## 功能

- 首页、文章列表（难度 / 领域 / 标签 / 关键词组合筛选，状态保存在 URL 里，可直接分享）、文章详情（目录、阅读进度、代码高亮与复制、转载署名）。
- 简历页：中 / 英文两版，`/resume?lang=en` 可直接发给别人；支持浏览器打印导出 PDF。
- 中 / 英文界面切换，浅色 / 深色主题切换（都会记住选择）。
- 后台 `/admin`：登录、文章管理（批量发布 / 改等级 / 改领域）、Markdown 或公开链接导入、领域与标签管理、简历编辑（可从文字版 PDF 预填）。后台代码是独立分块，普通访客不会下载。

## 开发

需要 Node.js ≥ 20.19 或 ≥ 22.12，并先按 `blog-backend` 的说明在本地跑起后端（默认 `http://127.0.0.1:8080`）。

```bash
npm ci
npm run dev        # http://localhost:5173，/api 自动代理到后端
```

后端不在默认地址时：复制 `.env.example` 为 `.env.local`，修改 `VITE_DEV_API_TARGET`。

其它命令：

```bash
npm run lint       # oxlint
npm test           # vitest
npm run build      # tsc 类型检查 + 生产构建到 dist/
```

本地开发时后台账号是 `admin` / `dev-password-123`（仅 dev profile 的后端有效）。

## 目录结构

```
src/
  api/          axios 封装、前台接口、react-query 配置
  components/   通用组件（文章卡片、筛选栏、Markdown 渲染、目录 …）
  hooks/        通用 hooks
  i18n/         多语言（locales 里是中 / 英文案）
  layouts/      前台页头 / 页脚 / 外壳
  pages/        前台页面
  admin/        后台（独立懒加载分块，自带 api / 鉴权 / 布局 / 文案）
  theme/        主题与 Ant Design 全局配置
  styles/       全局样式与设计变量
  types/        与后端 DTO 对应的类型
```

## 部署

静态文件由宿主机 Nginx 托管，API 由同一个 Nginx 反代到后端容器。

### 1. 配置 Nginx（只需一次）

**先为 `blog.darkrich.com` 单独签发证书**（DNS 需已指向本机）。配置里的 443 段引用了证书文件，证书不存在时 `nginx -t` 会失败。签发不依赖本配置，服务器上已有的 `00-acme.conf` 会处理验证请求：

```bash
certbot certonly --webroot -w /var/www/acme -d blog.darkrich.com
```

然后把 `deploy/nginx/blog.darkrich.com.conf` 复制到服务器 `/etc/nginx/conf.d/`。默认值已按当前服务器填好，部署前只需核对两处是否一致：

1. 静态文件根目录，需等于 Jenkins 参数 `DEPLOY_DIR` + `/current`（默认 `/var/www/blog-frontend/current`）；
2. `proxy_pass` 的端口，需等于后端的 `BLOG_API_PORT`（默认 18086）。

配置适配 Nginx 1.24（Ubuntu 自带），已用该版本做过语法检查。

然后 `nginx -t && systemctl reload nginx`。`nginx -t` 不通过就不要 reload；通过了 reload 也不会中断其它站点，配置只声明 `server_name blog.darkrich.com`。

### 2. 用 Jenkins 发布

新建流水线任务指向本仓库，使用根目录的 `Jenkinsfile`。构建在宿主机上用 nvm 管理的 Node 执行，版本由根目录的 `.nvmrc` 指定（当前 24）。nvm 必须装在 `jenkins` 用户读得到的位置（默认 `~/.nvm`，装在别处用参数 `NVM_DIR` 指定），详见 `Jenkinsfile` 头部说明。

| 参数 | 说明 |
|---|---|
| `DEPLOY_DIR` | 发布根目录，默认 `/var/www/blog-frontend` |
| `DEPLOY_HOST` | 留空 = Jenkins 与 Nginx 同机，直接本地发布；填 `user@host` = 通过 SSH + rsync 发布 |
| `SSH_CREDENTIALS_ID` | SSH 发布模式使用的私钥凭据 ID |
| `KEEP_RELEASES` | 保留的历史版本数，默认 5 |
| `VITE_ICP` | 页脚备案号，可留空（构建时写入产物） |

发布流程：`npm ci` → lint / 测试 → 构建 → 上传到 `releases/<构建号>` → 软链接 `current` 原子切换 → 清理旧版本。

### 回滚

每个版本都保留在 `releases/` 下，把 `current` 指回上一个即可，无需重新构建：

```bash
ln -sfn /var/www/blog-frontend/releases/<上一个构建号> /var/www/blog-frontend/current
```

## 关于 SEO

这是纯前端渲染的单页应用，搜索引擎对文章内容的收录不如服务端渲染的站点。`index.html` 里放了站点默认标题和描述，每个页面会在运行时替换成自己的标题和摘要。如果以后对收录有要求，可以考虑构建期预渲染。
