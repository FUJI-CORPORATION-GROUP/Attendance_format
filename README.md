# フジ住宅の勤怠フォーマット

- フジ住宅で使用している勤怠管理のフォーマットを作成するスクリプト
- GAS を用いて Google スプレッドシート上で使用する

## 勤怠入力スクリプト

### 使い方

1. Google Sheets で新しいスプレッドシートを作成する
2. 拡張機能の App script を開く
3. スプレッドシートに `勤怠入力.gs` のコードを貼り付ける
4. `mainButton` 関数をスプレッドシート上のオブジェクトに付与する
5. `mainButton` 関数が呼び出された際に、業務内容の入力ダイアログが表示される
6. 入力が完了すれば、対応するセルに時刻と業務内容が記録される

### ファイルの説明

- `勤怠入力.gs`: メインのスクリプトファイル。開始・終了時間を記録し、業務内容を入力するための関数が含まれる
- その他の関数:
  - `roundDownTo15Minutes`: 時刻を 15 分単位で切り捨てる関数
  - `roundUpTo15Minutes`: 時刻を 15 分単位で切り上げる関数
  - `startTimeData`: 開始時間を処理する関数
  - `endTimeData`: 終了時間を処理する関数

## 勤怠出力スクリプト

### 使い方

1. 入力スクリプト同様、App script に `勤怠出力.gs` のコードを貼り付ける
2. `showDatePickerDialog` 関数をスプレッドシート上のオブジェクトに付与する
3. オブジェクト選択によりを実行して、期間を選択するためのダイアログを表示する
4. 開始日と終了日を選択して「OK」をクリックする
5. 選択した期間内の勤怠情報が新しいシートにまとめられる
6. シートは、「明細」と「合計」の 2 つのセクションが生成される。明細セクションには日付ごとの詳細な情報が、合計セクションには期間全体の合計が表示される。

### ファイルの説明

- `勤怠出力.gs`: メインのスクリプトファイル。指定された期間の勤怠情報をまとめて新しいシートに出力するための関数が含まれる。
- その他の関数:
  - `makeDetailSheet`: 「明細」セクションの作成を担当する関数
  - `makeSumSheet`: 「合計」セクションの作成を担当する関数
  - `clearSheet`: シートをクリアする関数。指定されたシート名のセルをクリアする
  - `showDatePickerDialog`: 期間を選択するためのダイアログを表示する関数

### 注意事項

- このスクリプトを使用するには、Google アカウントが必要です。
- スクリプトの実行前に、Google Sheets とスクリプトが連携されていることを確認してください。

## ローカルでの開発

### Docker 立ち上げ

```sh
docker-compose build
docker-compose up -d
```

### google API へのログイン

```sh
# コンテナ中入る
docker-compose exec -it clasp /bin/bash

# コンテナの中でログイン処理
clasp login
```

実行結果で表示される URL を開く

```bash
root@~~/usr/src/app# clasp login
Logging in globally…
🔑 Authorize clasp by visiting this url:
https://accounts.google.com/hogehoge
```

開かれた先で Google ログイン&許可して，
リダイレクト先の localhost の URL をコピーする

別コンソールを開き下記を実行

```sh
# コンテナの中入る
docker-compose exec -it clasp /bin/bash

# ブラウザでアクセスできなかったURLにコンテナの中からcurlでアクセス
curl "{http://localhost:hogehoge}"
```

ログインできるはず！

### Project の Clone

普段触る AppScript の画面のサイドメニューの中からスクリプト ID をコピー

コンテナの中で下記を実行

```sh
clasp clone {スクリプトID}
```

### 編集後

コンテナの中で下記を実行

```sh
clasp push
```
