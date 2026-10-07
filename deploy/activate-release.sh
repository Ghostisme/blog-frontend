#!/usr/bin/env bash
# 把已经上传到 <deploy_dir>/releases/<release> 的构建产物切换为线上版本，并清理旧版本。
#
# 用法： activate-release.sh <deploy_dir> <release> <keep>
#
# 目录结构（Nginx 的 root 指向 current）：
#   <deploy_dir>/releases/41/   历史版本
#   <deploy_dir>/releases/42/   新版本
#   <deploy_dir>/current  ->  releases/42
#
# 为什么用“软链接切换”而不是直接覆盖文件：
#   * 原子性：用户永远不会访问到“一半旧一半新”的目录，否则旧页面引用的带哈希的 js 文件
#     在覆盖过程中可能已被删除，导致白屏；
#   * 可回滚：出问题时把 current 指回上一个版本即可，秒级生效，无需重新构建。
set -euo pipefail

deploy_dir=${1:?缺少参数 deploy_dir}
release=${2:?缺少参数 release}
keep=${3:?缺少参数 keep}

# 参数会被拼进路径和 rm -rf：先限定格式，避免路径穿越 / 误删
[[ "$deploy_dir" == /* ]] || { echo "deploy_dir 必须是绝对路径: $deploy_dir" >&2; exit 1; }
[[ "$deploy_dir" =~ ^[A-Za-z0-9/_.-]+$ ]] || { echo "deploy_dir 含有非法字符: $deploy_dir" >&2; exit 1; }
[[ "$release" =~ ^[0-9]+$ ]] || { echo "release 必须是数字: $release" >&2; exit 1; }
# 至少保留 2 个：当前版本 + 一个可回滚的上一版本
[[ "$keep" =~ ^[0-9]+$ ]] && (( keep >= 2 )) || { echo "keep 必须是不小于 2 的整数: $keep" >&2; exit 1; }

target="$deploy_dir/releases/$release"
[[ -f "$target/index.html" ]] || { echo "发布目录不完整（缺少 index.html）: $target" >&2; exit 1; }

# 先建临时链接再 mv 覆盖：rename 系统调用是原子的，而 ln -sfn 直接覆盖是“先删后建”，中间有空窗
ln -sfn "$target" "$deploy_dir/current.tmp"
mv -Tf "$deploy_dir/current.tmp" "$deploy_dir/current"
echo "current -> $target"

# 按修改时间从新到旧排序，保留前 keep 个，其余删除。
# 不按版本号排序：Jenkins 任务被重建后构建号会从 1 重新开始，按号排会把最新的版本当成最旧的删掉。
#
# 额外用 grep -vx 把刚上线的版本剔除出删除名单——这是最后一道保险：
# 即便时间戳异常(比如 cp -a 把源目录的修改时间带了过来)导致排序出错，
# 也绝不会删掉 current 正在指向的版本，否则线上站点会直接 404。
# grep 没有任何输出时返回 1，在 pipefail 下会让脚本误判失败，所以用 || true 兜住。
cd "$deploy_dir/releases"
ls -1dt -- */ | tail -n +"$((keep + 1))" | sed 's#/$##' | { grep -vxF -- "$release" || true; } | xargs -r rm -rf --
echo "保留的版本: $(ls -1t | tr '\n' ' ')"
