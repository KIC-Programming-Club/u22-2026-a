/* 成績画面。quiz.js が localStorage に保存した結果を読んで表示する */

const RESULT_KEY = "quizResult";   // quiz.js が保存に使ったのと同じ名札

// getItem は保存が無いと null を返す。初回など、まだ1回も解いていない場合の分岐に使う
const saved = localStorage.getItem(RESULT_KEY);

if (saved) {
    // 保存されているのは文字列なので、JSON.parse でオブジェクトに戻す
    const result = JSON.parse(saved);

    renderScore(result);
    renderMarks(result.words);
    renderAllList(result.words);
} else {
    // 成績が無いのに 0% の円を出しても仕方がないので、案内文だけ出す
    document.getElementById("no-result").hidden = false;
    document.getElementById("result-card").hidden = true;
    document.getElementById("wordbtn").hidden = true;
}

/* 得点をドーナツ状の円グラフと数字で表示する */
function renderScore(result) {
    // 0で割ると NaN になるので、total が 0 のときは 0% 扱いにしておく
    const rate = result.total ? Math.round((result.correctCount / result.total) * 100) : 0;

    document.getElementById("result-rate").textContent = `${rate}%`;
    document.getElementById("result-fraction").textContent = `${result.correctCount}/${result.total}`;
    document.getElementById("result-comment").textContent = buildComment(rate);

    /* CSS変数 --rate を書き換えると、conic-gradient で描いた円の角度が変わる。
       style.setProperty は「この要素にこのCSSを直接指定する」という命令 */
    const ring = document.getElementById("result-ring");
    ring.style.setProperty("--rate", rate);
    // 画面を読み上げるときは円ではなく文章で伝える
    ring.setAttribute("aria-label", `${result.total}問中${result.correctCount}問正解、正答率${rate}%`);
}

/* 正答率に応じた一言を返す。上から順に調べ、当てはまった時点で return して抜ける */
function buildComment(rate) {
    if (rate === 100) {
        return "全問正解！";
    }
    if (rate >= 70) {
        return "よくできました！";
    }
    if (rate >= 40) {
        return "あと少し！";
    }
    return "復習しよう";
}

/* 1問ごとの○×を横に並べる。どの問題を間違えたのかが一目で分かる */
function renderMarks(words) {
    const list = document.getElementById("result-marks");

    // forEach の2つ目の引数 index には添字(0から)が入るので、+1 して問題番号にする
    words.forEach((w, index) => {
        const item = document.createElement("li");
        // マウスを乗せたときにどの単語だったか分かるようにしておく
        item.title = `第${index + 1}問 ${w.word}（${w.meaning}）`;

        const icon = document.createElement("span");
        icon.className = `mark-icon ${w.isCorrect ? "is-correct" : "is-wrong"}`;
        icon.textContent = w.isCorrect ? "✓" : "×";

        const number = document.createElement("span");
        number.className = "mark-no";
        number.textContent = index + 1;

        item.appendChild(icon);
        item.appendChild(number);
        list.appendChild(item);
    });
}

/* Word List ボタンで開く、出題された10問すべての一覧 */
function renderAllList(words) {
    const body = document.getElementById("all-body");

    words.forEach((w, index) => {
        const row = body.insertRow();
        row.insertCell().textContent = index + 1;
        row.insertCell().textContent = w.word;
        row.insertCell().textContent = w.meaning;
        row.insertCell().textContent = w.description;

        // 正誤の列だけは色を付けたいので、セルの中に span を1つ入れる
        const cell = row.insertCell();
        cell.className = "mark-cell";
        const icon = document.createElement("span");
        icon.className = `mark-icon ${w.isCorrect ? "is-correct" : "is-wrong"}`;
        icon.textContent = w.isCorrect ? "✓" : "×";
        cell.appendChild(icon);

        // 間違えた行は行ごと薄い赤にして目立たせる
        if (!w.isCorrect) {
            row.className = "is-wrong-row";
        }
    });
}

/* Word List ボタンで一覧の表示・非表示を切り替える。hidden = true の間は画面に出ない */
const wordbtn = document.getElementById("wordbtn");
const wordlist = document.getElementById("itiran");

wordlist.hidden = true;
wordbtn.addEventListener("click", () => {
    wordlist.hidden = !wordlist.hidden;
});
