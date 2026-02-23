#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

// ─── Colors ────────────────────────────────────────────────────
const C = {
  green: (s) => `\x1b[32m${s}\x1b[0m`,
  yellow: (s) => `\x1b[33m${s}\x1b[0m`,
  red: (s) => `\x1b[31m${s}\x1b[0m`,
  cyan: (s) => `\x1b[36m${s}\x1b[0m`,
  bold: (s) => `\x1b[1m${s}\x1b[0m`,
  dim: (s) => `\x1b[2m${s}\x1b[0m`,
};

const info = (msg) => console.log(`${C.green('✓')} ${msg}`);
const warn = (msg) => console.log(`${C.yellow('!')} ${msg}`);
const error = (msg) => console.error(`${C.red('✗')} ${msg}`);

// ─── Paths ─────────────────────────────────────────────────────
const PKG_ROOT = path.resolve(__dirname, '..');
const CLAUDE_DIR = path.join(process.env.HOME || process.env.USERPROFILE, '.claude');

// Directories to install at user level
const DIRS = ['agents', 'templates', 'rules'];
// Files to merge/install at user level
const MERGE_FILES = ['settings.json'];

// ─── Helpers ───────────────────────────────────────────────────

function ask(question) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim().toLowerCase());
    });
  });
}

function copyDirSync(src, dst) {
  fs.mkdirSync(dst, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const dstPath = path.join(dst, entry.name);
    if (entry.isDirectory()) {
      copyDirSync(srcPath, dstPath);
    } else {
      fs.copyFileSync(srcPath, dstPath);
    }
  }
}

function filesEqual(a, b) {
  try {
    return fs.readFileSync(a).equals(fs.readFileSync(b));
  } catch {
    return false;
  }
}

function countFiles(dir) {
  let count = 0;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      count += countFiles(path.join(dir, entry.name));
    } else {
      count++;
    }
  }
  return count;
}

function deepMerge(target, source) {
  const result = { ...target };
  for (const key of Object.keys(source)) {
    if (
      source[key] &&
      typeof source[key] === 'object' &&
      !Array.isArray(source[key]) &&
      target[key] &&
      typeof target[key] === 'object' &&
      !Array.isArray(target[key])
    ) {
      result[key] = deepMerge(target[key], source[key]);
    } else {
      result[key] = source[key];
    }
  }
  return result;
}

// ─── Commands ──────────────────────────────────────────────────

async function cmdInit(opts) {
  console.log('');
  console.log(C.bold('Claude Code 研发规范配置安装'));
  console.log(C.dim(`源: ${PKG_ROOT}`));
  console.log(C.dim(`目标: ${CLAUDE_DIR}`));
  console.log('');

  fs.mkdirSync(CLAUDE_DIR, { recursive: true });

  // 1. Copy directories
  for (const dir of DIRS) {
    const src = path.join(PKG_ROOT, dir);
    const dst = path.join(CLAUDE_DIR, dir);

    if (!fs.existsSync(src)) {
      warn(`源目录不存在，跳过: ${dir}/`);
      continue;
    }

    // If dst is a symlink, remove it first (migrating from symlink-based install)
    if (fs.existsSync(dst) && fs.lstatSync(dst).isSymbolicLink()) {
      if (!opts.force) {
        const answer = await ask(`  ${dir}/ 当前是符号链接，替换为文件副本？[Y/n] `);
        if (answer === 'n') {
          warn(`${dir}/ 跳过`);
          continue;
        }
      }
      fs.unlinkSync(dst);
    }

    if (fs.existsSync(dst) && !opts.force) {
      // Check if content is identical
      const srcCount = countFiles(src);
      const dstCount = countFiles(dst);
      if (srcCount === dstCount) {
        info(`${dir}/ 已是最新 (${srcCount} 个文件)`);
        // Still overwrite to ensure content matches
        copyDirSync(src, dst);
        continue;
      }
    }

    copyDirSync(src, dst);
    info(`${dir}/ 已安装 (${countFiles(src)} 个文件)`);
  }

  // 2. Merge settings.json
  for (const file of MERGE_FILES) {
    const src = path.join(PKG_ROOT, file);
    const dst = path.join(CLAUDE_DIR, file);

    if (!fs.existsSync(src)) continue;

    // If dst is a symlink, remove it first
    if (fs.existsSync(dst) && fs.lstatSync(dst).isSymbolicLink()) {
      fs.unlinkSync(dst);
    }

    if (fs.existsSync(dst) && !fs.lstatSync(dst).isSymbolicLink()) {
      try {
        const existing = JSON.parse(fs.readFileSync(dst, 'utf8'));
        const incoming = JSON.parse(fs.readFileSync(src, 'utf8'));
        const merged = deepMerge(existing, incoming);

        if (JSON.stringify(existing) === JSON.stringify(merged)) {
          info(`${file} 已是最新`);
        } else {
          fs.writeFileSync(dst, JSON.stringify(merged, null, 2) + '\n');
          info(`${file} 已合并更新`);
        }
      } catch {
        // If existing file is malformed, overwrite
        fs.copyFileSync(src, dst);
        info(`${file} 已覆盖`);
      }
    } else {
      fs.copyFileSync(src, dst);
      info(`${file} 已安装`);
    }
  }

  console.log('');
  console.log(C.green('安装完成！'));
  console.log('');
  console.log(`使用 ${C.cyan('claude-config apply')} 将 CLAUDE.md 应用到具体项目`);
  console.log('');
}

async function cmdApply(opts) {
  const src = path.join(PKG_ROOT, 'CLAUDE.md.template');
  const dst = path.join(process.cwd(), 'CLAUDE.md');

  if (!fs.existsSync(src)) {
    error('CLAUDE.md.template 不存在');
    process.exit(1);
  }

  if (fs.existsSync(dst) && !opts.force) {
    if (filesEqual(src, dst)) {
      info('CLAUDE.md 已是最新，无需更新');
      return;
    }

    const answer = await ask(`当前目录已有 CLAUDE.md，覆盖？[Y/n] `);
    if (answer === 'n') {
      warn('已取消');
      return;
    }
  }

  fs.copyFileSync(src, dst);
  info(`CLAUDE.md 已写入 ${process.cwd()}/CLAUDE.md`);
}

function cmdHelp() {
  console.log('');
  console.log(C.bold('Claude Code 研发规范配置'));
  console.log('');
  console.log('命令:');
  console.log(`  ${C.cyan('init')}     安装/更新用户级配置到 ~/.claude/`);
  console.log(`  ${C.cyan('apply')}    将 CLAUDE.md 模板应用到当前项目`);
  console.log(`  ${C.cyan('status')}   查看当前配置状态`);
  console.log(`  ${C.cyan('help')}     显示帮助信息`);
  console.log('');
  console.log('选项:');
  console.log(`  ${C.cyan('--force')}  跳过确认提示，强制覆盖`);
  console.log('');
  console.log('示例:');
  console.log(`  ${C.dim('# 首次安装')}`);
  console.log(`  npx @stormhwdev/claude-config init`);
  console.log('');
  console.log(`  ${C.dim('# 在项目根目录应用 CLAUDE.md')}`);
  console.log(`  cd your-project && npx @stormhwdev/claude-config apply`);
  console.log('');
  console.log(`  ${C.dim('# 更新到最新版')}`);
  console.log(`  npx @stormhwdev/claude-config@latest init`);
  console.log('');
}

function cmdStatus() {
  console.log('');
  console.log(C.bold('配置状态'));
  console.log('');

  // Check user-level
  for (const dir of DIRS) {
    const dst = path.join(CLAUDE_DIR, dir);
    if (fs.existsSync(dst)) {
      const isLink = fs.lstatSync(dst).isSymbolicLink();
      const count = isLink ? '(symlink)' : `${countFiles(dst)} 个文件`;
      info(`~/.claude/${dir}/  ${C.dim(count)}`);
    } else {
      warn(`~/.claude/${dir}/  ${C.dim('未安装')}`);
    }
  }

  for (const file of MERGE_FILES) {
    const dst = path.join(CLAUDE_DIR, file);
    if (fs.existsSync(dst)) {
      info(`~/.claude/${file}  ${C.dim('已配置')}`);
    } else {
      warn(`~/.claude/${file}  ${C.dim('未安装')}`);
    }
  }

  // Check project-level
  console.log('');
  const claudeMd = path.join(process.cwd(), 'CLAUDE.md');
  if (fs.existsSync(claudeMd)) {
    info(`./CLAUDE.md  ${C.dim('已存在')}`);
  } else {
    warn(`./CLAUDE.md  ${C.dim('未配置 (使用 claude-config apply 应用)')}`);
  }

  console.log('');
}

// ─── Main ──────────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2);
  const command = args.find((a) => !a.startsWith('-')) || 'help';
  const opts = {
    force: args.includes('--force') || args.includes('-f'),
  };

  switch (command) {
    case 'init':
    case 'install':
    case 'update':
      await cmdInit(opts);
      break;
    case 'apply':
      await cmdApply(opts);
      break;
    case 'status':
      cmdStatus();
      break;
    case 'help':
    case '--help':
    case '-h':
      cmdHelp();
      break;
    default:
      error(`未知命令: ${command}`);
      cmdHelp();
      process.exit(1);
  }
}

main().catch((err) => {
  error(err.message);
  process.exit(1);
});
