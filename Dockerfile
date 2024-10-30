# ベースイメージとして node:20.18.0-slim を使用
FROM node:20.18.0-slim
# 作業ディレクトリを設定
WORKDIR /usr/src/app
# package.json と package-lock.json をコピーして依存関係をインストール
COPY package*.json ./
# 依存関係のインストール（production環境用）
RUN npm install
# アプリケーションのソースコードをコンテナにコピー
COPY . .
# TypeScript ファイルをビルド
RUN npm run build

# ポートを公開
EXPOSE 8080

# サーバーを起動
CMD ["node", "build/main.js"]