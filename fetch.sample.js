/* fetch で JSON を読み込むサンプル（words.json を読んで console に出す）

   fetch("ファイル名") はサーバーにファイルを取りに行く関数です。
   通信は時間がかかるので、fetch は「結果そのもの」ではなく
   「あとで結果が入る箱」（Promise）を即座に返します。
   その箱に await を付けると、中身が届くまでその行で待ってくれます。
   await は async と書いた関数の中でしか使えません。

   読み込みは2段階で、どちらも待つ必要があります。
     1回目の await … 通信の応答（ヘッダ）が届くのを待つ
     2回目の await … 本文を全部受け取ってJSONとして解釈し終わるのを待つ

   ブラウザで開くときは file:// ではなくローカルサーバー経由にしてください
   （file:// だとセキュリティ制限で fetch が失敗します）。
     python -m http.server  →  http://localhost:8000/ で開く          */

async function loadWords() {
    try {
        // 1回目：応答が届くまで待つ。response は「応答そのもの」で、まだ中身ではない
        const response = await fetch("words.json");

        /* 通信が成功しても、ファイルが無い（404）ことがある。
           fetch はその場合でも例外を出さないので、自分で確認して例外を投げる。
           ok は状態番号が200番台かどうかを表す真偽値。 */
        if (!response.ok) {
            throw new Error(`読み込み失敗: ${response.status}`);
        }

        // 2回目：本文をJSONとして解釈し、JSの配列に変換する
        const words = await response.json();

        console.log(words.length);      // 32 …… 配列の要素数
        console.log(words[0]);          // { id: 1, word: "auto", ... } …… 1件目
        console.log(words[0].word);     // "auto" …… ドットで項目を取り出す

        // find は条件に合う最初の要素を返す。id を使えば1件だけ取り出せる
        const item = words.find(w => w.id === 5);
        console.log(`${item.word} = ${item.meaning}`);   // const = 定数の

        return words;   // 呼び出した側で使えるように返す
    } catch (error) {
        /* ここに来るのは3種類。
           ・通信そのものの失敗（サーバーが無い、file:// で開いた など）
           ・上で自分が投げた 404 などの例外
           ・JSONの書き方が壊れていて変換できなかった場合（カンマ忘れなど） */
        console.error("words.json を読み込めませんでした", error);
        return [];   // 呼び出した側が壊れないよう、空の配列を返しておく
    }
}

/* 注意：loadWords() は async 関数なので、戻ってくるのも「箱」です。
   中身を使いたい側でも await を付ける必要があります。 */
async function main() {
    const words = await loadWords();
    console.log(`${words.length}語を読み込みました`);
}

main();

/* 参考：await が無かった頃の書き方（古いコードで見かけます）。
   then は「箱の中身が届いたらこの関数を呼ぶ」という予約で、
   数珠つなぎに書くことで同じ処理になります。

fetch("words.json")
    .then(response => response.json())          // 応答が届いたらJSONに変換
    .then(words => console.log(words.length))   // 変換できたら使う
    .catch(error => console.error(error));      // どこかで失敗したらここへ
*/
