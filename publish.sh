#!/usr/bin/env bash

set -e

PROJECT_ROOT="$(pwd)"

cd "$PROJECT_ROOT"

# 获取版本号
VERSION=$(node -p "require('./package.json').version")
PKGNAME=$(node -p "require('./package.json').name")

echo ">> 检查 Git 状态..."
if [[ -n $(git status --porcelain) ]]; then
echo "警告: 有未提交的更改，请提交后再运行本脚本。"
exit 1
fi

echo ">> 拉取远程最新 master 分支..."
git pull origin master

echo ">> 打包项目..."
npm run build

echo ">> 推送代码到 GitHub..."
git add -A
git commit -m "release: v$VERSION"
git push origin main

echo ">> 打标签并推送到远程..."
git tag "v$VERSION"
git push origin "v$VERSION"

echo ">> 发布到 npm..."
if [[ -n "$NPM_TOKEN" ]]; then
echo "//registry.npmjs.org/:_authToken=$NPM_TOKEN" > .npmrc
npm publish --access public
rm .npmrc
else
npm publish --access public
fi

echo ">> 发布完成！"
echo "  - GitHub tag: v$VERSION"
echo "  - npm: https://www.npmjs.com/package/$PKGNAME/v/$VERSION"