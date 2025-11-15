---
name: Devin Task
about: インフラ・自動化・完了型タスクを Devin に実行させるためのIssue
title: "[Devin] タスク名を入力"
labels: ''
assignees: ''

---

## 🎯 Goal
このIssueは **Devin に自動実行させるタスク**です。  
目的を1〜3行で明確に記載してください。

例：
- Supabase + Dify のインフラ基盤を最小構成で構築する
- CI/CD（GitHub Actions）を自動生成して、デプロイ手順を簡略化する
- AWS Lambda / API Gateway のMVP環境を作成する

---

## 📦 Scope（Devin が触って良い範囲）
以下のディレクトリ・ファイルのみを対象にしてください。

例：
- `/infra/terraform/`
- `/backend/`
- `.github/workflows/`

上記以外は変更しません。

---

## 📘 Spec / Requirements（参考仕様）
参考資料や要件がある場合はここに貼ります。

例：
- docs/infra-spec.md
- 図（アーキテクチャ）: URL

---

## 📄 Deliverables（成果物）
Devin が出力すべき成果物を具体的に。

- Terraform (.tf) ファイル
- GitHub Actions デプロイ Workflow
- README（セットアップと実行手順）
- 簡易スモークテスト

---

## ⛔ Constraints（制約）
AIが迷わないように、禁止事項や制限を明記します。

- 既存コードは変更しないこと
- 本番デプロイは行わない（plan のみ）
- 不明点は spec に従うこと
- 仕様が曖昧な場合は「安全側」に倒してよい（決め打ちOK）

---

## 📝 Notes
補足したい情報があればここに記載してください。
