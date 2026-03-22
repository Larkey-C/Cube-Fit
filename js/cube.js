/**
 * Cube クラス
 * 直方体の状態管理、転がり判定を担当
 *
 * 直方体の状態遷移ルール:
 * - 立っている状態 → 移動方向に倒れて寝た状態に
 * - 寝ている状態（長辺方向へ移動） → 起立
 * - 寝ている状態（短辺方向へ移動） → 平行移動
 *
 * 位置表現:
 * - positionは常に「占有セルのうち、最も手前（近い）のセル」を表す
 * - 直立状態：そのセル自身
 * - 寝ている状態：倒れている方向の最も手前のセル
 */
class Cube {
  /**
   * コンストラクタ
   * @param {number} x - 初期X座標
   * @param {number} y - 初期Y座標
   * @param {string} orientation - 初期の向き（デフォルト: 立っている）
   * @param {string} lyingDirection - 寝ている方向（直立時はnull）
   */
  constructor(x, y, orientation = ORIENTATIONS.STANDING, lyingDirection = null) {
    this.position = { x, y };
    this.orientation = orientation;
    this.lyingDirection = lyingDirection;
  }

  /**
   * 現在占有しているセルの配列を計算して返す
   * @returns {Array} セルの配列 [{x, y}, ...]
   */
  getOccupiedCells() {
    const { x, y } = this.position;

    if (this.orientation === ORIENTATIONS.STANDING) {
      // 立っている状態：1マス占有
      return [{ x, y }];
    }

    // 寝ている状態：lyingDirectionに基づいて2マス占有
    switch (this.lyingDirection) {
      case LYING_DIRECTIONS.UP:
        // 上方向に倒れている：現在位置とその上
        return [
          { x, y },
          { x, y: y - 1 }
        ];

      case LYING_DIRECTIONS.DOWN:
        // 下方向に倒れている：現在位置とその下
        return [
          { x, y },
          { x, y: y + 1 }
        ];

      case LYING_DIRECTIONS.LEFT:
        // 左方向に倒れている：現在位置とその左
        return [
          { x, y },
          { x: x - 1, y }
        ];

      case LYING_DIRECTIONS.RIGHT:
        // 右方向に倒れている：現在位置とその右
        return [
          { x, y },
          { x: x + 1, y }
        ];

      default:
        return [{ x, y }];
    }
  }

  /**
   * 転がりを試みる（新しい状態を計算）
   * @param {Object} direction - 移動方向 {x, y}
   * @returns {Object} 新しい状態 {position, orientation, lyingDirection, cells}
   */
  tryRoll(direction) {
    const lyingDir = this.directionToLyingDirection(direction);

    if (this.orientation === ORIENTATIONS.STANDING) {
      // 直立状態から倒れる場合
      const newPosition = {
        x: this.position.x + direction.x,
        y: this.position.y + direction.y
      };

      const tempCube = new Cube(newPosition.x, newPosition.y, ORIENTATIONS.LYING, lyingDir);
      const newCells = tempCube.getOccupiedCells();

      return {
        position: newPosition,
        orientation: ORIENTATIONS.LYING,
        lyingDirection: lyingDir,
        cells: newCells
      };
    } else {
      // 寝ている状態から移動する場合
      if (lyingDir === this.lyingDirection) {
        // 起立する場合
        const currentCells = this.getOccupiedCells();
        const newPosition = this.getBaselinePosition(currentCells, direction);

        const tempCube = new Cube(newPosition.x, newPosition.y, ORIENTATIONS.STANDING, null);
        const newCells = tempCube.getOccupiedCells();

        return {
          position: newPosition,
          orientation: ORIENTATIONS.STANDING,
          lyingDirection: null,
          cells: newCells
        };
      } else {
        // 平行移動する場合
        const newPosition = {
          x: this.position.x + direction.x,
          y: this.position.y + direction.y
        };

        const tempCube = new Cube(newPosition.x, newPosition.y, ORIENTATIONS.LYING, this.lyingDirection);
        const newCells = tempCube.getOccupiedCells();

        return {
          position: newPosition,
          orientation: ORIENTATIONS.LYING,
          lyingDirection: this.lyingDirection,
          cells: newCells
        };
      }
    }
  }

  /**
   * 方向ベクトルからLYING_DIRECTIONS定数へ変換
   * @param {Object} direction - 移動方向 {x, y}
   * @returns {string} LYING_DIRECTIONS定数
   */
  directionToLyingDirection(direction) {
    if (direction.x === 0 && direction.y === -1) return LYING_DIRECTIONS.UP;
    if (direction.x === 0 && direction.y === 1) return LYING_DIRECTIONS.DOWN;
    if (direction.x === -1 && direction.y === 0) return LYING_DIRECTIONS.LEFT;
    if (direction.x === 1 && direction.y === 0) return LYING_DIRECTIONS.RIGHT;
    return null;
  }

  /**
   * 占有セルのうち、指定された方向で最も手前のセルを取得
   * @param {Array} cells - 占有セルの配列
   * @param {Object} direction - 移動方向 {x, y}
   * @returns {Object} 基準位置 {x, y}
   */
  getBaselinePosition(cells, direction) {
    let baseline = cells[0];

    for (const cell of cells) {
      if (direction.x > 0) {
        // 右方向：xが最小のセル
        if (cell.x < baseline.x) baseline = cell;
      } else if (direction.x < 0) {
        // 左方向：xが最大のセル
        if (cell.x > baseline.x) baseline = cell;
      } else if (direction.y > 0) {
        // 下方向：yが最小のセル
        if (cell.y < baseline.y) baseline = cell;
      } else if (direction.y < 0) {
        // 上方向：yが最大のセル
        if (cell.y > baseline.y) baseline = cell;
      }
    }

    return baseline;
  }

  /**
   * 状態を更新
   * @param {Object} newState - 新しい状態 {position, orientation, lyingDirection}
   */
  updateState(newState) {
    this.position = newState.position;
    this.orientation = newState.orientation;
    this.lyingDirection = newState.lyingDirection;
  }

  /**
   * クリア条件の判定（起立状態で穴の位置と完全に一致）
   * @param {Object} holePosition - 穴の位置 {x, y}
   * @returns {boolean} クリア条件を満たしていればtrue
   */
  isClear(holePosition) {
    return (
      this.orientation === ORIENTATIONS.STANDING &&
      this.position.x === holePosition.x &&
      this.position.y === holePosition.y
    );
  }

  /**
   * 現在の状態をコピーして返す（状態の保存用）
   * @returns {Object} 状態のコピー {position, orientation}
   */
  getState() {
    return {
      position: { ...this.position },
      orientation: this.orientation
    };
  }

  /**
   * 状態を復元
   * @param {Object} state - 保存しておいた状態 {position, orientation}
   */
  setState(state) {
    this.position = { ...state.position };
    this.orientation = state.orientation;
  }
}
