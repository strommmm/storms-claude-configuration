#!/usr/bin/env bash
set -euo pipefail

# Claude Code 研发规范配置安装脚本
# 将 agents、templates、rules、settings 部署到 ~/.claude/

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CLAUDE_DIR="$HOME/.claude"

# 颜色输出
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

info()  { echo -e "${GREEN}[INFO]${NC} $1"; }
warn()  { echo -e "${YELLOW}[WARN]${NC} $1"; }
error() { echo -e "${RED}[ERROR]${NC} $1"; }

# 需要管理的目录和文件
DIRS=(agents templates rules)
FILES=(settings.json)

echo "========================================"
echo " Claude Code 研发规范配置安装"
echo "========================================"
echo ""
echo "源目录: $SCRIPT_DIR"
echo "目标:   $CLAUDE_DIR"
echo ""

# 确保 ~/.claude 目录存在
mkdir -p "$CLAUDE_DIR"

# 处理目录：创建符号链接
for dir in "${DIRS[@]}"; do
    src="$SCRIPT_DIR/$dir"
    dst="$CLAUDE_DIR/$dir"

    if [ ! -d "$src" ]; then
        warn "源目录不存在，跳过: $src"
        continue
    fi

    if [ -L "$dst" ]; then
        # 已经是符号链接
        current_target="$(readlink "$dst")"
        if [ "$current_target" = "$src" ]; then
            info "$dir/ 已链接 (无需操作)"
            continue
        else
            warn "$dir/ 已链接到其他位置: $current_target"
            read -p "  是否重新链接到 $src? [y/N] " -n 1 -r
            echo
            if [[ $REPLY =~ ^[Yy]$ ]]; then
                rm "$dst"
                ln -s "$src" "$dst"
                info "$dir/ 已重新链接"
            else
                warn "$dir/ 跳过"
            fi
        fi
    elif [ -d "$dst" ]; then
        # 目录已存在（非符号链接）
        warn "$dir/ 已存在且非符号链接"

        # 检查是否有额外文件
        extra_files=()
        while IFS= read -r -d '' f; do
            basename="$(basename "$f")"
            if [ ! -f "$src/$basename" ]; then
                extra_files+=("$basename")
            fi
        done < <(find "$dst" -maxdepth 1 -type f -print0 2>/dev/null)

        if [ ${#extra_files[@]} -gt 0 ]; then
            warn "  目标目录中有以下文件不在仓库中:"
            for ef in "${extra_files[@]}"; do
                echo "    - $ef"
            done
        fi

        read -p "  备份现有目录并替换为符号链接? [y/N] " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            backup_dir="$CLAUDE_DIR/.backup-$(date +%Y%m%d%H%M%S)"
            mkdir -p "$backup_dir"
            mv "$dst" "$backup_dir/$dir"
            ln -s "$src" "$dst"
            info "$dir/ 已备份到 $backup_dir/$dir 并创建符号链接"
        else
            warn "$dir/ 跳过"
        fi
    else
        # 不存在，直接创建符号链接
        ln -s "$src" "$dst"
        info "$dir/ 符号链接已创建"
    fi
done

# 处理单个文件
for file in "${FILES[@]}"; do
    src="$SCRIPT_DIR/$file"
    dst="$CLAUDE_DIR/$file"

    if [ ! -f "$src" ]; then
        warn "源文件不存在，跳过: $src"
        continue
    fi

    if [ -L "$dst" ]; then
        current_target="$(readlink "$dst")"
        if [ "$current_target" = "$src" ]; then
            info "$file 已链接 (无需操作)"
            continue
        fi
    fi

    if [ -f "$dst" ] && [ ! -L "$dst" ]; then
        warn "$file 已存在"
        # 比较内容
        if diff -q "$src" "$dst" > /dev/null 2>&1; then
            info "  内容相同，创建符号链接"
            rm "$dst"
            ln -s "$src" "$dst"
        else
            read -p "  内容不同，备份并替换? [y/N] " -n 1 -r
            echo
            if [[ $REPLY =~ ^[Yy]$ ]]; then
                cp "$dst" "$dst.backup-$(date +%Y%m%d%H%M%S)"
                rm "$dst"
                ln -s "$src" "$dst"
                info "$file 已备份并创建符号链接"
            else
                warn "$file 跳过"
            fi
        fi
    else
        ln -s "$src" "$dst"
        info "$file 符号链接已创建"
    fi
done

echo ""
echo "========================================"
echo " 安装完成"
echo "========================================"
echo ""
echo "已部署的配置:"
echo "  ~/.claude/agents/    → $SCRIPT_DIR/agents/"
echo "  ~/.claude/templates/ → $SCRIPT_DIR/templates/"
echo "  ~/.claude/rules/     → $SCRIPT_DIR/rules/"
echo "  ~/.claude/settings.json → $SCRIPT_DIR/settings.json"
echo ""
echo "项目级配置:"
echo "  将 CLAUDE.md.template 复制到项目根目录并重命名为 CLAUDE.md"
echo "  cp $SCRIPT_DIR/CLAUDE.md.template <project>/CLAUDE.md"
echo ""
