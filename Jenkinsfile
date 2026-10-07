// 博客前端流水线：安装 → 检查 → 构建 → 发布静态文件。
//
// 前端是纯静态产物，由宿主机上的 Nginx 直接托管（配置见 deploy/nginx/）。
//
// 前置条件（Jenkins 构建节点）：
//   * Jenkins 用户要能用上 Node（Vite 8 要求 ≥ 20.19 或 ≥ 22.12，版本由仓库根目录的 .nvmrc 指定）。
//     用 nvm 管理时，nvm 必须装在【jenkins 用户能读】的位置：root 的 /root/.nvm 它读不了。
//     默认找 jenkins 用户家目录下的 ~/.nvm，装在别处就设置 Jenkins 参数 NVM_DIR。
//     没有 nvm 时，会直接使用 PATH 里已有的 node。
//   * 本地发布模式（DEPLOY_HOST 留空）：Jenkins 与 Nginx 在同一台机器，且 Jenkins 用户对 DEPLOY_DIR 有写权限。
//   * SSH 发布模式（填写 DEPLOY_HOST）：需要 SSH Agent 插件，以及一个 SSH 私钥类型的凭据；
//     目标机需要有 rsync。
//
// 发布方式：上传到 releases/<构建号>，再用软链接 current 原子切换，并只保留最近几个版本（见 deploy/activate-release.sh）。
/**
 * 在加载了 nvm 的环境里执行一条命令。
 *
 * 为什么要手动 source：nvm 是 shell 函数而不是可执行文件，只有登录/交互式 shell 的启动脚本才会加载它，
 * Jenkins 的 sh 步骤是非交互式的，不会自动加载，直接写 node 会报 command not found。
 * nvm use 会读工作区里的 .nvmrc 决定版本。没有 nvm 时跳过，退回使用 PATH 里的 node。
 *
 * 传入的命令都是本文件里的字面量，不含任何外部输入，所以可以放心用 sh -c。
 */
def nodeRun(String command) {
    withEnv(["BLOG_CMD=${command}"]) {
        sh '''
            export NVM_DIR="${NVM_DIR:-$HOME/.nvm}"
            if [ -s "$NVM_DIR/nvm.sh" ]; then
                . "$NVM_DIR/nvm.sh"
                nvm use
            fi
            command -v node >/dev/null 2>&1 || {
                echo "找不到 node。请在 jenkins 用户下安装 nvm 与 Node，或设置参数 NVM_DIR，详见 Jenkinsfile 头部说明" >&2
                exit 1
            }
            sh -c "$BLOG_CMD"
        '''
    }
}

pipeline {
    agent any

    options {
        timestamps()
        disableConcurrentBuilds()          // 两次构建同时切换 current 会互相覆盖
        buildDiscarder(logRotator(numToKeepStr: '20'))
        timeout(time: 20, unit: 'MINUTES')
    }

    parameters {
        string(name: 'DEPLOY_DIR', defaultValue: '/var/www/blog-frontend',
               description: '发布根目录（绝对路径）。Nginx 的 root 应指向 <DEPLOY_DIR>/current')
        string(name: 'KEEP_RELEASES', defaultValue: '5',
               description: '保留的历史版本数（不小于 2，用于回滚）')
        string(name: 'DEPLOY_HOST', defaultValue: '',
               description: '留空：Jenkins 与 Nginx 在同一台机器，直接本地发布。填写：通过 SSH 发布到该主机，格式 user@host')
        string(name: 'SSH_CREDENTIALS_ID', defaultValue: 'blog-deploy-ssh',
               description: 'SSH 发布模式使用的凭据 ID（SSH 私钥类型）')
        string(name: 'NVM_DIR', defaultValue: '',
               description: 'nvm 的安装目录。留空 = 使用 jenkins 用户家目录下的 ~/.nvm；没有 nvm 则用 PATH 里的 node')
        string(name: 'VITE_ICP', defaultValue: '',
               description: '页脚备案号，可留空。它在【构建时】写入产物，改了需要重新构建')
    }

    environment {
        CI = 'true'
        NVM_DIR = "${params.NVM_DIR}"
        VITE_ICP = "${params.VITE_ICP}"
        // 参数统一走环境变量，shell 里用引号包住引用，而不是 Groovy 插值进脚本：
        // 后者会把参数值当作 shell 代码执行，参数里混进特殊字符就是命令注入
        DEPLOY_DIR = "${params.DEPLOY_DIR}"
        KEEP_RELEASES = "${params.KEEP_RELEASES}"
        DEPLOY_HOST = "${params.DEPLOY_HOST}"
    }

    stages {
        stage('Install') {
            steps {
                // npm ci 严格按 package-lock.json 安装，保证每次构建的依赖版本一致
                nodeRun('node --version && npm --version && npm ci')
            }
        }

        stage('Check') {
            steps {
                nodeRun('npm run lint && npm test')
            }
        }

        stage('Build') {
            steps {
                // build 脚本先 tsc -b 做类型检查，再 vite build；类型错误会直接让构建失败
                nodeRun('npm run build')
                archiveArtifacts artifacts: 'dist/**', fingerprint: true, allowEmptyArchive: false
            }
        }

        stage('Deploy (local)') {
            when { expression { !params.DEPLOY_HOST?.trim() } }
            steps {
                sh '''
                    set -e
                    release_dir="$DEPLOY_DIR/releases/$BUILD_NUMBER"
                    mkdir -p "$release_dir"
                    cp -a dist/. "$release_dir/"
                    bash deploy/activate-release.sh "$DEPLOY_DIR" "$BUILD_NUMBER" "$KEEP_RELEASES"
                '''
            }
        }

        stage('Deploy (ssh)') {
            when { expression { params.DEPLOY_HOST?.trim() } }
            steps {
                sshagent(credentials: [params.SSH_CREDENTIALS_ID]) {
                    // accept-new：首次连接自动信任并记录主机指纹，之后指纹变化会拒绝连接（防中间人）
                    sh '''
                        set -e
                        ssh_opts="-o StrictHostKeyChecking=accept-new"
                        ssh $ssh_opts "$DEPLOY_HOST" "mkdir -p '$DEPLOY_DIR/releases/$BUILD_NUMBER'"
                        rsync -az --delete -e "ssh $ssh_opts" dist/ "$DEPLOY_HOST:$DEPLOY_DIR/releases/$BUILD_NUMBER/"
                        ssh $ssh_opts "$DEPLOY_HOST" bash -s -- "$DEPLOY_DIR" "$BUILD_NUMBER" "$KEEP_RELEASES" < deploy/activate-release.sh
                    '''
                }
            }
        }
    }

    post {
        failure { echo '构建或发布失败，线上版本保持不变（current 软链接只在发布成功的最后一步才切换）。' }
    }
}
