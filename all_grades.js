/**
 * all_grades.js
 * words.json から全単語データを動的に fetch 取得し、
 * 成績表テーブル (all_grades.html / all-grades.html) の <tbody> に動的描画する
 * あわせて、quiz.js が localStorage に貯めた累計成績を集計して表示する
 */

// quiz.js の STATS_KEY と同じ名札。{ "単語のid": { count, correct }, ... } が入っている
const STATS_KEY = 'wordStats';

document.addEventListener('DOMContentLoaded', async () => {
    const tableBody = document.getElementById('word-table-body');

    if (!tableBody) {
        console.error('対象のテーブルボディ (#word-table-body) が見つかりません。');
        return;
    }

    // 累計成績はローカルにあるので、通信を待たずに先に読んでおく
    const stats = loadStats();

    try {
        // words.json から単語データを動的取得
        const response = await fetch('words.json');

        if (!response.ok) {
            throw new Error(`HTTPエラー! ステータス: ${response.status}`);
        }

        const words = await response.json();

        // サマリーとデータの描画
        renderSummary(words, stats);
        renderTableRows(words, tableBody, stats);

    } catch (error) {
        console.error('words.json の取得または描画に失敗しました:', error);

        // 単語が読めていないと集計もできないので、サマリーは丸ごと隠す
        document.getElementById('summary-card').hidden = true;
        document.getElementById('summary-empty').hidden = true;

        tableBody.innerHTML = `
            <tr>
                <td colspan="4" class="status-message">
                    データの読み込みに失敗しました。ローカルサーバー経由で開いているか確認してください。
                </td>
            </tr>
        `;
    }
});

/**
 * localStorage から単語ごとの累計成績を読み出す関数
 * まだ1問も解いていない場合や、データが壊れている場合は空のオブジェクトを返す
 * @returns {Object} { 単語のid: { count: 出題回数, correct: 正解回数 } } 形式のオブジェクト
 */
function loadStats() {
    try {
        return JSON.parse(localStorage.getItem(STATS_KEY)) || {};
    } catch (error) {
        console.warn('累計成績の読み込みに失敗したため、空として扱います:', error);
        return {};
    }
}

/**
 * ページ上部のサマリー (ドーナツリング + 内訳) を描画する関数
 * @param {Array} words - words.json から取得したオブジェクト配列
 * @param {Object} stats - loadStats() が返した累計成績
 */
function renderSummary(words, stats) {
    const card = document.getElementById('summary-card');
    const empty = document.getElementById('summary-empty');

    // words.json に今も存在する単語だけを合計する (消した単語の記録は数えない)
    let total = 0;
    let correct = 0;

    words.forEach(item => {
        const stat = stats[item.id];
        if (stat) {
            total += stat.count;
            correct += stat.correct;
        }
    });

    // まだ1問も解いていないときは、0% のリングではなく案内文を出す
    if (total === 0) {
        card.hidden = true;
        empty.hidden = false;
        return;
    }

    card.hidden = false;
    empty.hidden = true;

    const rate = Math.round((correct / total) * 100);

    document.getElementById('summary-rate').textContent = `${rate}%`;
    document.getElementById('summary-fraction').textContent = `${total}問中${correct}問正解`;
    document.getElementById('stat-total').textContent = total;
    document.getElementById('stat-correct').textContent = correct;
    document.getElementById('stat-wrong').textContent = total - correct;

    // CSS 変数 --rate を書き換えると、conic-gradient で描いた円グラフの角度が変わる
    const ring = document.getElementById('summary-ring');
    ring.style.setProperty('--rate', rate);
    // 画面を読み上げるときは円ではなく文章で伝える
    ring.setAttribute('aria-label', `${total}問中${correct}問正解、正答率${rate}%`);
}

/**
 * 取得した単語配列を元にテーブルの行 (tr) を生成し、tbody へ追加する関数
 * @param {Array} words - words.json から取得したオブジェクト配列
 * @param {HTMLElement} container - 追加先の tbody 要素
 * @param {Object} stats - loadStats() が返した累計成績
 */
function renderTableRows(words, container, stats) {
    // 既存の内容をクリア
    container.innerHTML = '';

    if (!words || words.length === 0) {
        container.innerHTML = `
            <tr>
                <td colspan="4" class="status-message">データが存在しません。</td>
            </tr>
        `;
        return;
    }

    // DOM操作のパフォーマンス向上のため DocumentFragment を使用
    const fragment = document.createDocumentFragment();

    words.forEach(item => {
        const tr = document.createElement('tr');

        // 1. 単語
        const tdWord = document.createElement('td');
        tdWord.textContent = item.word || '';

        // 2. 意味
        const tdMeaning = document.createElement('td');
        tdMeaning.textContent = item.meaning || '';

        // 3. 説明
        const tdDescription = document.createElement('td');
        tdDescription.textContent = item.description || '';

        // 4. 回答 (この単語の累計成績)
        const tdAnswer = createAnswerCell(stats[item.id]);

        // 行に各セルを追加
        tr.appendChild(tdWord);
        tr.appendChild(tdMeaning);
        tr.appendChild(tdDescription);
        tr.appendChild(tdAnswer);

        // フラグメントに行を追加
        fragment.appendChild(tr);
    });

    // まとめてDOMに追加
    container.appendChild(fragment);
}

/**
 * 単語1つ分の「回答」セルを作る関数
 * 出題済みなら「k/n」+ バー +「i%」、未出題なら薄いグレーの「未出題」を表示する
 * @param {Object|undefined} stat - その単語の { count, correct }。未出題なら undefined
 * @returns {HTMLElement} 組み立てた td 要素
 */
function createAnswerCell(stat) {
    const td = document.createElement('td');

    if (!stat || !stat.count) {
        const none = document.createElement('span');
        none.className = 'rate-none';
        none.textContent = '未出題';
        td.appendChild(none);
        return td;
    }

    const rate = Math.round((stat.correct / stat.count) * 100);

    // n問中k問正解 (省スペースのため k/n 表記)
    const fraction = document.createElement('span');
    fraction.className = 'rate-fraction';
    fraction.textContent = `${stat.correct}/${stat.count}`;

    // 正答率のミニバー。中の span の幅 (%) がそのまま正答率になる
    const bar = document.createElement('span');
    bar.className = 'rate-bar';
    const fill = document.createElement('span');
    fill.className = 'rate-bar-fill';
    fill.style.width = `${rate}%`;
    bar.appendChild(fill);

    const percent = document.createElement('span');
    percent.className = 'rate-percent';
    percent.textContent = `${rate}%`;

    td.appendChild(fraction);
    td.appendChild(bar);
    td.appendChild(percent);
    return td;
}
