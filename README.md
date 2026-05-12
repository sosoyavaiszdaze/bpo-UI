# Zynect BPO System — Operations UI

広告運用OS「Zynect BPO」の管理UI 静的プロトタイプ。
**3階層 (Command → Workbench → Detail)** の運用UIとして再設計。

> 本リポジトリは「朝会ボード」としての1st viewが成立しているかを確認するための最小実装です。

---

## 1. 今回の最重要方針

各画面の 1st view では **主メッセージを1つだけ** 出します。
情報を詰めず、深掘りはクリックで展開する構造。

| 画面 | 1st view の主メッセージ |
|------|------------------------|
| Operations Command Center | **今日、最初に対応すべきことは何か** |
| Clients Workbench | **どのクライアントが危ないか** |

---

## 2. 階層構造

```
Level 1  Command View         今日何をすべきかを即判断
  └─ Level 2  Workbench View  1テーマだけに集中して作業
        └─ Level 3  Detail    なぜ起きたか / 次に何をするか
```

| Level | 画面例 | 表示密度 |
|-------|--------|----------|
| L1 Command | Operations Command Center | 低 (KPI≤4, 一覧 5件) |
| L2 Workbench | Clients / Connections / Cases / Outcomes / Rule Quality / Incidents | 中 (テーブル中心) |
| L3 Detail | Client / Case / Rule / Incident / Outcome | 高 (タブで切替) |

---

## 3. 今回作った 2 画面

### `index.html` — Operations Command Center
1st view に置いたものは以下だけ:
- **Headline 1 行**: 「今日は Critical 2 件を最優先で処理してください」
- **Primary CTA**: 「Criticalから対応する →」
- **KPI 4枚**: Critical / Zynect待ち / 顧客待ち / 接続不備
- **メインリスト 5件**: 今日の最優先タスク (タイトル / Client / Severity / Owner / Due / Next action)
- **下部の小さな補助**: Outcome 測定待ち / Rule Quality blocker / 最近のジョブ失敗

→ 5 秒で「今日 何から手をつけるか」が分かることを目標にしています。

### `clients.html` — Clients Workbench
1st view に置いたものは以下だけ:
- **Headline 1 行**: 「5 社が at risk。うち Acme・Pocket Quest は接続不備が原因で計測停止」
- **KPI 3枚**: At risk / Blocked / Healthy
- **絞り込みバー**: すべて / Blocked / At risk / Healthy
- **テーブル 5列のみ**: Client / Health / Main issue / Owner / Next action

行をクリックすると open case 数 / 接続マトリクス / Outcome / 「なぜ at risk か」が展開表示されます。
**1st view には接続マトリクスを出しません。**

---

## 4. 色の意味 (固定)

| 色 | 意味 | 使う場面 |
|----|------|----------|
| 🔴 赤 | 今すぐ対応 / 運用停止 / Critical | Critical incident, Blocked client, 期限超過 |
| 🟠 オレンジ | 注意 / 今日中・今週中 | High severity, At risk |
| 🔵 青 | Zynect 側対応 | Zynect が次に動く Case |
| 🟣 紫 | 顧客待ち | 顧客返信待ち / D+7,14,28 測定待ち |
| 🟢 緑 | 正常 / 改善 / 完了 | Healthy, Improved outcome |
| ⚫ グレー | draft / disabled / unknown | Medium 以下, draft rule |

赤は **本当に緊急なものだけ**。1画面で 2 つまでを上限としています。

---

## 5. 情報量ルール (本実装で守っているもの)

| ルール | 実装 |
|--------|------|
| KPI カードは最大 4 つ | Command 4 / Clients 3 |
| 1st view メインリストは 5〜10 件 | Command 5 / Clients 10 (うち2件はTier C非表示) |
| テーブル列は最大 6 列 | Command 6 / Clients 5 |
| 色付きアラートは最大 2 つ | Headline 1 + Critical KPI 1 |
| CTA は 1〜2 個 | Headline に Primary 1 + Secondary 1 |
| 詳細は常時非表示 | Expandable Row で展開時のみ表示 |

---

## 6. 共通コンポーネント

`css/style.css` 内に定義。

- `Status Badge` — `.badge.red/orange/blue/purple/green/gray`
- `Priority Badge` — `Critical / High / Medium`
- `Owner Badge` — `Zynect (ZY 青)` / `Client (CL 紫)`
- `Health Score` — `.health` (bar + score + status)
- `Task Row` / `Expandable Row` — `.tbl tr` + `.row-detail-tr`
- `Filter Bar` — `.filterbar` (search + segmented + chip)
- `Headline` — 1st view の主メッセージ用 `.headline`
- `KPI Card` — `.kpi` (label / value / foot)
- `Util Card` — 下部の小さなセカンダリ情報 `.util-card`

未実装 (次フェーズで追加):
- State Machine (Case 9 状態の横並びチップ)
- Detail Drawer (右からスライドイン)
- Empty State
- Incident Alert (画面上端の固定アラート)
- Outcome Timeline (D+7 / D+14 / D+28)
- Rule Quality Checklist

---

## 7. デザイントーン

参考: Stripe Dashboard / Linear / Sentry / Datadog / Retool

- ライトモード
- テーブル中心、カード乱用しない
- 余白は適度 (24px グリッド)
- 1440px / 1280px 両対応
- ヒーローLP的演出なし

---

## 8. 表示確認

```bash
cd /home/user/webapp
python3 -m http.server 8000
```

- `http://localhost:8000/` → Operations Command Center
- `http://localhost:8000/clients.html` → Clients Workbench

サイドバーの「Command Center」「Clients」で行き来できます。

---

## 9. 次フェーズ (このあと作る画面)

1. Connections Workbench (「どの接続不備が運用を止めているか」)
2. Cases Workbench (「どの Case が止まっているか」 + 9状態 State Machine)
3. Outcome Workbench (「成果が出ているか、まだ測定中か」 + D+7/14/28 Timeline)
4. Rule Quality Workbench (「顧客に出せないルールがどれだけあるか」)
5. Incident Workbench (「運用を止めている障害は何か」)
6. Case Detail (タブ: Summary / Evidence / Actions / Outcome / Related Rules / Audit Log)
7. Client Detail (タブ: Cases / Connections / Outcomes / Notifications / Responses / Rules / Jobs)

---

## 10. 良いUI/悪いUI チェック

| 判断基準 | 本実装 |
|----------|--------|
| 5 秒で今日やることが分かる | ✅ Headline + Primary CTA |
| 1画面1テーマ | ✅ Command は判断、Clients はクライアント健全性のみ |
| 詳細を見たい時だけ深掘り | ✅ Expandable Row |
| 顧客待ちと Zynect 待ちがすぐ分かる | ✅ Owner Badge を青/紫で固定色 |
| 接続不備と広告成果問題が混ざらない | ✅ Main issue 列で色付きバッジで分離 |
| Outcome が 改善/悪化/不明 で分かる | ✅ 下部 util-card と Health bar で表現 |
| Rule 品質の穴が分かる | ✅ 下部 util-card に blocker のみ表示 |
| Incident が運用に与える影響が分かる | ✅ Critical KPI + Headline |
