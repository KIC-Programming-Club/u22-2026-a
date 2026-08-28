/* words.json を使ったクイズ（quiz.html のHTMLをそのまま使います）

   JavaScriptはHTMLを「後から書き換える」言語です。画面の文字を変えるには、HTMLの
   要素をJSから取ってきて中身を差し替えます。main関数はなく上から下へ実行されます
   （このファイルは一番下の startQuiz() が入口）。宣言に型は書かず、
   const は代入し直せない、let は代入し直せる、という違いだけです。

   画面の流れ： index.html →（スタート）→ quiz.html →（10問終了）→ grades.html   */
const QUESTION_COUNT = 10;      // 1回の出題数
const RESULT_KEY = "quizResult";   // 成績を保存するときの名札（grades.js から読む）
const STATS_KEY = "wordStats";     // 単語ごとの累計成績の名札（all_grades.js から読む）

/* HTMLの要素を取ってくる。document は「表示中のHTML全体」で、getElementById は id、
   querySelector は class で1つだけ探す。使うたび探すのは無駄なので変数に置いておく。 */
const questionNumber = document.querySelector(".question-number");
const questionText = document.querySelector(".question-text");
const correctEffect = document.getElementById("correct-effect");

/* 4つのボタンは同じ扱いをするので、配列にまとめて添字で回せるようにする。
   map は「各要素を関数に通した結果でできた新しい配列」を返す。 */
const optionButtons = [1, 2, 3, 4].map(n => document.getElementById("answer" + n));
let words = [];        // words.json の全単語（読み込み時にシャッフルしておく）
let choices = [];      // 今の問題の選択肢4つ（ボタンの並び順と同じ）
let currentIndex = 0;  // 今何問目か（0から数える）
let correctCount = 0;  // 正解数
let history = [];      // 出題した単語と正誤の記録（成績画面の単語一覧に使う）

/* 配列をランダムに並べ替えて新しい配列を返す。sort には「2つを比べてどちらを先に
   するか」を返す関数を渡す決まりなので、そこを乱数にすると順番がバラバラになる。
   slice() でコピーしてから並べ替えるので、元の配列は壊れない。 */
function shuffle(array) {
    return array.slice().sort(() => Math.random() - 0.5);
}

/* 現在の問題を画面に表示する */
function showQuestion() {
    // words は最初にシャッフルしてあるので、先頭から順に使えば単語が重複しない
    const answer = words[currentIndex];
    /* 選択肢を作る。先に正解を id で除外してからダミーを3つ選ぶので、同じ単語が
       選択肢に二重に出ることがない。filter は条件に合う要素だけを集めた新しい配列を
       返す。w => ... は名前のない小さな関数で、Cの関数ポインタを渡すのに近い。
       ...dummies の「...」は配列を展開する記号。正解＋3個の4個にしてから混ぜる。 */
    const dummies = shuffle(words.filter(w => w.id !== answer.id)).slice(0, 3);
    choices = shuffle([answer, ...dummies]);

    // 逆クォート内の ${ } に値を埋め込める（printf の代わり）。textContent に
    // 代入すると、その要素の表示文字が置き換わる
    questionNumber.textContent = `第${currentIndex + 1}問/${QUESTION_COUNT}問`;
    questionText.textContent = answer.meaning;   // 日本語訳を問題文にする

    // classList はclassを付け外しする道具。前問のエフェクトを消しておく
    correctEffect.classList.remove("show");

    // forEach は配列の要素を1つずつ関数に渡すループ。i には添字（0〜3）が入る
    optionButtons.forEach((button, i) => {
        // innerHTML はHTMLごと差し替える。丸い数字のspanを残したいのでタグも書く
        button.innerHTML = `<span class="option-num">${i + 1}</span>${choices[i].word}`;
        button.disabled = false;   // ボタンを押せる状態に戻す
        // 前問の正解・不正解の色を消す。remove は付いていなくてもエラーにならない
        button.classList.remove("is-correct", "is-wrong");
    });
}

/* 何番目のボタンが押されたか（i）を受け取って判定する */
function handleAnswer(i) {
    // 回答済み（ボタンが押せない状態）やクイズ終了後に呼ばれたら何もしない。
    // キーボードでも回答できるようにしたので、この見張りが要る
    if (optionButtons[0].disabled || currentIndex >= QUESTION_COUNT) {
        return;
    }

    // choices はボタンと同じ並び順なので、i 番目が正解かどうかを id で比べればよい
    const answer = words[currentIndex];
    const isCorrect = choices[i].id === answer.id;
    if (isCorrect) {
        correctCount++;
        correctEffect.classList.add("show");   // classが付いた瞬間にCSSが動き出す
    }

    /* どれが正解だったのかを色で見せる。findIndex は「条件に合う最初の要素の添字」を
       返す（見つからなければ -1）。choices とボタンは並び順が同じなので、この添字が
       そのまま「正解のボタンの番号」になる。
       正解のボタンには必ず印を付け、外したときは押したボタンにも×の印を付ける。 */
    const correctIndex = choices.findIndex(choice => choice.id === answer.id);
    optionButtons[correctIndex].classList.add("is-correct");
    if (!isCorrect) {
        optionButtons[i].classList.add("is-wrong");
    }
    /* あとで成績画面に出せるよう、出題した単語と正誤を控えておく。
       { ...answer, isCorrect } は「answer の項目を全部写した上で isCorrect を足した
       新しいオブジェクト」を作る書き方（構造体をコピーして1項目増やすイメージ）。 */
    history.push({ ...answer, isCorrect });
    recordWordStat(answer.id, isCorrect);   // 単語ごとの累計にも1問分足す

    optionButtons.forEach(b => (b.disabled = true));   // 回答済み。二重回答を防ぐ

    /* setTimeout(関数, ミリ秒) は「あとで実行してほしい処理」の予約。sleep とは違い
       ここで止まらず先に進み、1秒後に渡した関数が呼ばれる。すぐ次の問題に進むと
       正解エフェクトが見えないので、1秒あけている。 */
    setTimeout(() => {
        currentIndex++;
        if (currentIndex < QUESTION_COUNT) {
            showQuestion();
        } else {
            finishQuiz();
        }
    }, 1000);
}

/* 10問終わったときの処理：結果を保存して成績画面へ移動する */
function finishQuiz() {
    saveResult();
    // location.href に代入するとそのページへ移動する（index.js のスタートボタンと同じ）
    window.location.href = "grades.html";
}

/* 結果を保存する。ページを移動するとJSの変数は全部消えるので、成績画面に渡すには
   localStorage（ブラウザに残る簡単な保存場所）を使う。保存できるのは文字列だけなので
   JSON.stringify でオブジェクトを文字列に変換してから預ける。 */
function saveResult() {
    const result = {
        correctCount: correctCount,
        total: QUESTION_COUNT,
        words: history,
    };
    localStorage.setItem(RESULT_KEY, JSON.stringify(result));
}

/* 単語1つ分の成績を累計に足す。こちらは10問終わるのを待たず、1問答えるたびに
   保存するので、途中でページを閉じても記録が残る。
   保存する形は { "単語のid": { count: 出題回数, correct: 正解回数 }, ... }。
   localStorage は文字列しか持てないので、読むときに JSON.parse でオブジェクトに戻し、
   数を足してから JSON.stringify で文字列にして書き戻す、という3手順になる。 */
function recordWordStat(id, isCorrect) {
    let stats;
    try {
        // まだ1問も答えていないと getItem は null を返す。|| {} で空の入れ物にしておく
        stats = JSON.parse(localStorage.getItem(STATS_KEY)) || {};
    } catch (error) {
        stats = {};   // 壊れたデータが入っていたら作り直す
    }

    // その単語が初めてなら 0 から数え始める
    const stat = stats[id] || { count: 0, correct: 0 };
    stat.count++;
    if (isCorrect) {
        stat.correct++;
    }
    stats[id] = stat;

    localStorage.setItem(STATS_KEY, JSON.stringify(stats));
}

/* 起動処理：words.json を読み込んで1問目を表示する。ファイルの読み込みは時間が
   かかるので、関数の頭に async と書き、await で結果が届くまでその行で待つ。
   読み込み失敗は戻り値ではなく例外で飛んでくるので、try / catch で受け止める。 */
async function startQuiz() {
    try {
        const response = await fetch("words.json");   // ファイルを取りに行く
        // 通信できてもファイルが無い（404）ことがある。fetch は例外を出さないので自分で確認する
        if (!response.ok) {
            throw new Error(`読み込み失敗: ${response.status}`);
        }
        words = shuffle(await response.json());       // JSONを配列に変換して混ぜる
    } catch (error) {
        questionText.textContent = "words.json を読み込めません（ローカルサーバーで開いてください）";
        return;
    }

    // 単語が足りないと出題も選択肢も作れないので、ここで止めて理由を出す
    if (words.length < 4) {
        questionText.textContent = "単語が足りません";
        return;
    }

    // addEventListener は「押されたらこの関数を呼んでくれ」という登録。
    // 登録した時点では実行されず、押されたときに初めて呼ばれる
    optionButtons.forEach((button, i) => {
        button.addEventListener("click", () => handleAnswer(i));
    });

    /* 1〜4のキーでも答えられるようにする。キー入力はボタンではなく画面全体に届くので
       document に登録する。event.key には押された文字が入っているので、番号に直して
       同じ handleAnswer を呼べばよい（ボタンと処理を共通にできる）。 */
    document.addEventListener("keydown", event => {
        const number = Number(event.key);
        if (number >= 1 && number <= 4) {
            handleAnswer(number - 1);
        }
    });

    showQuestion();   // 1問目を表示
}

startQuiz();

/* 保存した結果の読み出しは grades.js を参照 */
