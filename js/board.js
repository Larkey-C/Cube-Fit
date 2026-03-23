/**
 * Board クラス
 * 盤面の管理、穴の位置、境界判定を担当
 */
class Board {
  /**
   * コンストラクタ
   */
  constructor() {
    this.size = BOARD_SIZE;
    this.holePosition = { x: 1, y: 1 };  // 穴の位置（初期値は中央）
  }

  /**
   * 指定された座標が盤内（0-2）にあるか判定
   * @param {number} x - X座標
   * @param {number} y - Y座標
   * @returns {boolean} 盤内ならtrue
   */
  isWithinBounds(x, y) {
    return x >= 0 && x < this.size && y >= 0 && y < this.size;
  }

  /**
   * セルの配列のうち、少なくとも1つが盤内にあるか判定
   * はみ出し許容の判定に使用
   * @param {Array} cells - セルの配列 [{x, y}, ...]
   * @returns {boolean} 少なくとも1つのセルが盡内ならtrue
   */
  hasCellInBounds(cells) {
    return cells.some(cell => this.isWithinBounds(cell.x, cell.y));
  }

  /**
   * セルの配列の全てが盤外にあるか判定
   * 完全盤外への移動を禁止するために使用
   * @param {Array} cells - セルの配列 [{x, y}, ...]
   * @returns {boolean} 全てのセルが盡外ならtrue
   */
  isAllCellsOutOfBounds(cells) {
    return cells.every(cell => !this.isWithinBounds(cell.x, cell.y));
  }

  /**
   * 新しい穴をランダムに配置
   */
  placeRandomHole() {
    this.holePosition = {
      x: Math.floor(Math.random() * this.size),
      y: Math.floor(Math.random() * this.size)
    };
  }

  /**
   * 現在の穴の位置を取得（コピーを返す）
   * @returns {Object} 穴の位置 {x, y}
   */
  getHolePosition() {
    return { ...this.holePosition };
  }

  /**
   * グリッド座標を1-9の数字に変換（UI表示用）
   * @param {number} x - X座標
   * @param {number} y - Y座標
   * @returns {number} 1-9の数字
   */
  gridToNumber(x, y) {
    return y * this.size + x + 1;
  }

  /**
   * 1-9の数字をグリッド座標に変換
   * @param {number} number - 1-9の数字
   * @returns {Object} グリッド座標 {x, y}
   */
  numberToGrid(number) {
    const index = number - 1;
    return {
      x: index % this.size,
      y: Math.floor(index / this.size)
    };
  }

  /**
   * 指定された座標が穴かどうかを判定
   * @param {number} x - X座標
   * @param {number} y - Y座標
   * @returns {boolean} 穴ならtrue
   */
  isHole(x, y) {
    return this.holePosition.x === x && this.holePosition.y === y;
  }

  /**
   * セルの配列に盤内の通常マス（穴ではない）が含まれるか判定
   * 直方体が移動できるかどうかの判定に使用
   * @param {Array} cells - セルの配列 [{x, y}, ...]
   * @returns {boolean} 少なくとも1つのセルが盤内の通常マスならtrue
   */
  hasSolidSupport(cells) {
    return cells.some(cell =>
      this.isWithinBounds(cell.x, cell.y) && !this.isHole(cell.x, cell.y)
    );
  }

  /**
   * 全てのセルが穴または盤外であるか判定
   * @param {Array} cells - セルの配列 [{x, y}, ...]
   * @returns {boolean} 全てのセルが穴または盤外ならtrue
   */
  areAllCellsHolesOrOutOfBounds(cells) {
    return cells.every(cell =>
      !this.isWithinBounds(cell.x, cell.y) || this.isHole(cell.x, cell.y)
    );
  }
}
