/**
 * all_grades.js
 * words.json から全単語データを動的に fetch 取得し、
 * 成績表テーブル (all_grades.html / all-grades.html) の <tbody> に動的描画する
 */

document.addEventListener('DOMContentLoaded', async () => {
    const tableBody = document.getElementById('word-table-body');

    if (!tableBody) {
        console.error('対象のテーブルボディ (#word-table-body) が見つかりません。');
        return;
    }

    try {
        // words.json から単語データを動的取得
        const response = await fetch('words.json');

        if (!response.ok) {
            throw new Error(`HTTPエラー! ステータス: ${response.status}`);
        }

        const words = await response.json();

        // データの描画
        renderTableRows(words, tableBody);

    } catch (error) {
        console.error('words.json の取得または描画に失敗しました:', error);
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
 * 取得した単語配列を元にテーブルの行 (tr) を生成し、tbody へ追加する関数
 * @param {Array} words - words.json から取得したオブジェクト配列
 * @param {HTMLElement} container - 追加先の tbody 要素
 */
function renderTableRows(words, container) {
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

        // 4. 回答 (現在未作成のため空白表示)
        const tdAnswer = document.createElement('td');
        tdAnswer.textContent = ' ';

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
