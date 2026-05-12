# Zynect BPO System — 4-Layer Operations UI

Apple-likeな静けさを保ちつつ、1st viewに情報を集めず、深掘りは下層に逃がす **4階層** 構造で再設計しました。

> 「ダッシュボード」ではなく「朝の最初の判断装置」。
> 1st viewは綺麗なまま、詳細判断は Level 2 → 3 → 4 へ。

---

## 階層構造

```
Level 1  Morning Command       index.html
   ↓ KPI / 優先アクションをクリック
Level 2  Focus Queue           focus.html?t=<theme>
   ↓ 1行をクリック
Level 3  Detail                detail.html?case=<id>
   ↓ タブを切替
Level 4  Evidence / Outcome / Rule  detail.html (タブ内)
```

| Level | 役割 | 表示する情報 |
|-------|------|-------------|
| 1 Morning Command | 今日まず何をするか宣言する | 主メッセージ1文 + 黒CTA1つ + KPI4 + 優先アクション5 |
| 2 Focus Queue | 1テーマだけのキューを見る | 選択中テーマのリストのみ。他テーマは混ぜない |
| 3 Detail | 1件を深掘り | なぜ起きたか / 次に何をするか / 誰待ち / いつ測るか |
| 4 Evidence / Outcome / Rule | 判断の根拠を見る | Decision Trace / API evidence / D+7/14/28 / Guardrail / Audit |

---

## 公開URL

ローカル:
```bash
cd /home/user/webapp && python3 -m http.server 8000
```

- **Level 1**: http://localhost:8000/
- **Level 2** (テーマで切替): `/focus.html?t=alerts|connections|cases|outcomes|rules|incidents`
- **Level 3 + 4**: http://localhost:8000/detail.html?case=2419

---

## Level 1 — Morning Command (index.html)

**変更なし**。これまでのApple-likeな朝会ボードを維持。

- 主メッセージ: 「本日の最優先は、未対応アラートの確認です。」
- Primary CTA (黒) 1つ → **Level 2 へ**
- KPI 4ブロック (枠線なし、hairlineのみ) → **クリックで Level 2 へ**
- 優先アクション 5行 → **クリックで Level 2 へ**

KPIや行をクリックすると、対応するテーマの **Focus Queue** に遷移します。

---

## Level 2 — Focus Queue (focus.html)

**1テーマだけを見る画面**。テーマを切り替えてもページ構成は同じで、混ざりません。

### Breadcrumb
```
[Level 2]  今日の最優先  ›  未対応アラート
```

### テーマ (アンダーラインタブ、6種)
- 未対応アラート / 接続不備 / 対応中Case / Outcome測定中 / Rule品質 / Incident

選んだテーマ以外は **画面に出ない**。
1画面1テーマの原則を徹底。

### Sub-filter
- すべて / Critical / High / Zynect待ち / 顧客待ち
- 並び替え: 重要度 → 期限

### Queue list (列は最小限)
```
No.  Title + Client/Case/Industry      Severity     Due       ›
```

各行クリックで **Level 3 (Detail)** へ。

---

## Level 3 — Detail (detail.html)

**1件の Case を深掘り。1st viewで4つの問いに答える。**

### Breadcrumb
```
[Level 3]  今日の最優先  ›  未対応アラート  ›  CASE-2419
```

### Detail head
- Case名 + ID + Client + Severity Pill + 状態Pill + 担当者

### Summary panel — 4つの問いに即答
1. **なぜ起きたか** — トークン期限切れ (7日前から予兆)
2. **次に何をするか** — 顧客にトークン再発行を依頼
3. **誰待ちか** — 顧客 (Acme広告担当)、前回応答 2h前
4. **いつ測るか** — D+7でCV回復確認

その下に「**何が見えたか**」「**いま取っている代替策**」を文章で。
これらは Decision Trace の要約として 1st view に置く。

### State machine (9状態を横に)
```
detected → notified → acknowledged → ●planned → executed → verified → measuring → learned → closed
```
塗りつぶし = 完了、太丸 = 現在地。

### Action bar
- 黒「顧客に再通知 ›」 + 「代替計測を確認」 + 「Incidentにエスカレーション」

### 右カラム (sticky context)
- Client / SLA / 関連 (INC, RULE, 過去Case) / 通知履歴

---

## Level 4 — Evidence / Outcome / Rule (detail.html 内のタブ)

Detailの下部にタブで5枚。**1st viewには出さず、必要な時だけ開く**。

### 1. Decision Trace
時系列で「なぜこの判断に至ったか」。
- 検知 → 予兆通知 → 停止検知 → Critical化 → 代替計測自動有効化 → 顧客通知予定
- 各ステップに「by 誰 / evidence参照」

### 2. Evidence
API レスポンス・メトリクスの生情報。
- Meta Graph API の `401 Unauthorized` 原文
- CV計測 (Baseline / Current / Δ)
- トークン状態の履歴ログ
- 配信状態 (Impressions/h, Spend/h, ヘルス)

### 3. Outcome (D+7 / D+14 / D+28)
```
D+7  5/27 測定予定  CV回復確認 / Baseline 1,842/日
D+14 6/3  測定予定  CPA Δ ±5% 以内
D+28 6/17 測定予定  運用ルールの改善効果
```
+ 「対応しなかった場合の試算」も同タブに。

### 4. Rule & Guardrail
- 関連ルール (発火済 / 未マップ)
- Guardrail 3軸: 「配信は止めない」「計測欠損を放置しない」「2hで復旧しない場合エスカレーション」

### 5. Audit Log
誰が・いつ・何をしたか、コンパクトに時系列で。

---

## 動線まとめ

```
[Level 1] 主メッセージ「未対応アラート12件」
   ↓ 黒CTA "未対応アラートを確認する"
[Level 2] focus.html?t=alerts — 12件のキュー
   ↓ "Meta CAPI 接続が 14時間 切断" をクリック
[Level 3] detail.html?case=2419
   - 4つの問いに即答 (なぜ/次/誰待ち/いつ測る)
   - State machine で進捗位置
   ↓ タブ "Evidence" をクリック
[Level 4] Meta Graph API の生レスポンス、CV計測Δ
   ↓ タブ "Outcome" をクリック
[Level 4] D+7 / D+14 / D+28 の測定計画と試算
```

5秒で「未対応アラートを最優先」と判断 → 5クリック以内に「なぜ起きたか」「次にすること」が把握でき、さらにクリックすれば API evidence まで辿れる。

---

## 色のルール (変更なし、厳格運用)

| 色 | 使う場面 |
|----|---------|
| 黒 #111113 | Primary CTA / 強調CTA・現在地状態のみ |
| 赤 #d4341f | Critical警告三角、Critical Pill、期限超過 |
| 黄系 #d4a02a | High warning dot のみ |
| 緑 #2fa164 | オンライン、改善 |
| 無彩色 | それ以外すべて |

Level 4 の Evidence でも色は使わず、↑/↓ のような微妙な色変化のみ。
派手なJSONビューアやチャートライブラリ風の装飾は一切なし。

---

## ファイル

```
/home/user/webapp/
├── index.html      ← Level 1: Morning Command (静かな朝会ボード)
├── focus.html      ← Level 2: Focus Queue (テーマ別キュー)
├── detail.html     ← Level 3 + 4: Detail + Evidence/Outcome/Rule タブ
├── clients.html    ← (前バージョン、参考用に残置)
├── css/style.css   ← 4階層分のコンポーネント
├── js/app.js       ← 行展開・タブ切替
└── README.md
```

---

## 階層化で守ったこと

| ルール | 実装 |
|--------|------|
| 1st view (Level 1) で全部を見せない | KPI4 + アクション5 のみ。テーブルなし |
| 1画面1テーマ (Level 2) | テーマ切替で他テーマは消える |
| 4つの問いに即答 (Level 3) | Summary panel の4ブロック |
| 詳細判断は下層に逃がす (Level 4) | タブで初期非表示、必要時のみ展開 |
| 色は意味として使う | 黒=CTA / 赤=危険 / 緑=正常 のみ固定 |
| Apple-likeな静けさ | 余白、hairline、light weight、Serif Brand |
