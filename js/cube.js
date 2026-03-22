/**
 * Cube クラス
 * 直方体の状態管理、転がり判定を担当
 *
 * 直方体の状態遷移ルール:
 * - 立っている状態 → 移動方向に倒れて寝た状態に
 * - 寝ている状態（長辺方向へ移動） → 起立
 * - 寝ている状態（短辺方向へ移動） → 平行移動
 */
class Cube {
  /**
   * コンストラクタ
   * @param {number} x - 初期X座標
   * @param {number} y - 初期Y座標
   * @param {string} orientation - 初期の向き（デフォルト: 立っている）
   */
  constructor(x, y, orientation = ORIENTATIONS.STANDING) {
    this.position = { x, y };
    this.orientation = orientation;
  }

  /**
   * 現在占有しているセルの配列を計算して返す
   * @returns {Array} セルの配列 [{x, y}, ...]
   */
  getOccupiedCells() {
    const { x, y } = this.position;

    switch (this.orientation) {
      case ORIENTATIONS.STANDING:
        // 立っている状態：1マス占有
        return [{ x, y }];

      case ORIENTATIONS.LYING_HORIZONTAL:
        // 横に寝ている状態：水平方向に2マス占有
        return [
          { x, y },
          { x: x + 1, y }
        ];

      case ORIENTATIONS.LYING_VERTICAL:
        // 縦に寝ている状態：垂直方向に2マス占有
        return [
          { x, y },
          { x, y: y + 1 }
        ];

      default:
        return [{ x, y }];
    }
  }

  /**
   * 転がりを試みる（新しい状態を計算）
   * @param {Object} direction - 移動方向 {x, y}
   * @returns {Object} 新しい状態 {position, orientation, cells}
   */
  tryRoll(direction) {
    const newOrientation = this.calculateNewOrientation(direction);
    const newPosition = this.calculateNewPosition(direction, newOrientation);

    // 仮のCubeを作成して占有セルを計算
    const tempCube = new Cube(newPosition.x, newPosition.y, newOrientation);
    const newCells = tempCube.getOccupiedCells();

    return {
      position: newPosition,
      orientation: newOrientation,
      cells: newCells
    };
  }

  /**
   * 新しい向きを計算（状態遷移ロジック）
   * @param {Object} direction - 移動方向 {x, y}
   * @returns {string} 新しい向き
   */
  calculateNewOrientation(direction) {
    const current = this.orientation;

    if (current === ORIENTATIONS.STANDING) {
      // 立っている状態から移動する場合
      if (direction === DIRECTIONS.UP || direction === DIRECTIONS.DOWN) {
        // 上下に倒れる → 縦に寝た状態
        return ORIENTATIONS.LYING_VERTICAL;
      } else {
        // 左右に倒れる → 横に寝た状態
        return ORIENTATIONS.LYING_HORIZONTAL;
      }
    } else if (current === ORIENTATIONS.LYING_HORIZONTAL) {
      // 横に寝ている状態
      if (direction === DIRECTIONS.LEFT || direction === DIRECTIONS.RIGHT) {
        // 長辺方向（左右）へ移動 → 起立
        return ORIENTATIONS.STANDING;
      } else {
        // 短辺方向（上下）へ移動 → 平行移動（寝たまま）
        return ORIENTATIONS.LYING_HORIZONTAL;
      }
    } else {
      // 縦に寝ている状態
      if (direction === DIRECTIONS.UP || direction === DIRECTIONS.DOWN) {
        // 長辺方向（上下）へ移動 → 起立
        return ORIENTATIONS.STANDING;
      } else {
        // 短辺方向（左右）へ移動 → 平行移動（寝たまま）
        return ORIENTATIONS.LYING_VERTICAL;
      }
    }
  }

  /**
   * 新しい位置を計算
   * @param {Object} direction - 移動方向 {x, y}
   * @param {string} newOrientation - 新しい向き
   * @returns {Object} 新しい位置 {x, y}
   */
  calculateNewPosition(direction, newOrientation) {
    const { x, y } = this.position;

    if (this.orientation === ORIENTATIONS.STANDING) {
      // 立っている状態から倒れる場合：移動方向へ
      return { x: x + direction.x, y: y + direction.y };
    } else if (newOrientation === ORIENTATIONS.STANDING) {
      // 寝ている状態から起立する場合：移動方向の隣のマスへ
      return { x: x + direction.x, y: y + direction.y };
    } else {
      // 寝た状態での平行移動：移動方向へ
      return { x: x + direction.x, y: y + direction.y };
    }
  }

  /**
   * 状態を更新
   * @param {Object} newState - 新しい状態 {position, orientation}
   */
  updateState(newState) {
    this.position = newState.position;
    this.orientation = newState.orientation;
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
