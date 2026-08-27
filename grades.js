/* 成績画面。quiz.js が localStorage に保存した結果を読んで表示する */

// getItem は保存が無いと null を返す。初回など、まだ1回も解いていない場合はHTMLのまま
const saved = localStorage.getItem("quizResult");
if (saved) {
    // 保存されているのは文字列なので、JSON.parse でオブジェクトに戻す
    const result = JSON.parse(saved);

    document.querySelector(".correct-answer").textContent =
        `${result.correctCount}/${result.total}`;

    /* 出題された単語を表に並べる。insertRow で行を、insertCell で列を1つずつ足す。
       textContent に入れれば、単語に記号が含まれていてもそのまま安全に表示できる。 */
    const table = document.querySelector(".wordlist");
    result.words.forEach(w => {
        const row = table.insertRow();
        row.insertCell().textContent = w.word;
        row.insertCell().textContent = w.meaning;
        row.insertCell().textContent = w.description;
    });
}

/* Word List ボタンで一覧の表示・非表示を切り替える。hidden = true の間は画面に出ない */
const wordbtn = document.getElementById("wordbtn");
const wordlist = document.getElementById("itiran");

wordlist.hidden = true;
wordbtn.addEventListener("click", () => {
    wordlist.hidden = !wordlist.hidden;
});
