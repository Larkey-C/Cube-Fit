/**
 * Renderer クラス
 * Canvas描画、アイソメトリック座標変換、アニメーションを担当
 *
 * アイソメトリック（等角投影法）:
 * - 2D Canvasで立体的に見せるための描画手法
 * - グリッド座標を斜め上から見下ろした構図に変換
 */
class Renderer {
  /**
   * コンストラクタ
   * @param {HTMLCanvasElement} canvas - Canvas要素
   */
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');

    // 描画設定
    this.tileWidth = RENDER_CONFIG.TILE_WIDTH;
    this.tileHeight = RENDER_CONFIG.TILE_HEIGHT;
    this.originX = RENDER_CONFIG.ORIGIN_X;
    this.originY = RENDER_CONFIG.ORIGIN_Y;

    // アニメーション関連
    this.isAnimating = false;
  }

  /**
   * グリッド座標をアイソメトリック座標に変換
   * @param {number} gridX - グリッドX座標
   * @param {number} gridY - グリッドY座標
   * @returns {Object} アイソメトリック座標 {x, y}
   */
  gridToIso(gridX, gridY) {
    const isoX = this.originX + (gridX - gridY) * (this.tileWidth / 2);
    const isoY = this.originY + (gridX + gridY) * (this.tileHeight / 2);
    return { x: isoX, y: isoY };
  }

  /**
   * 画面をクリア
   */
  clear() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  /**
   * 盤面を描画
   * @param {Board} board - Boardインスタンス
   */
  drawBoard(board) {
    // 3x3のタイルを描画
    for (let y = 0; y < BOARD_SIZE; y++) {
      for (let x = 0; x < BOARD_SIZE; x++) {
        this.drawTile(x, y);
      }
    }

    // 穴を描画
    const holePos = board.getHolePosition();
    this.drawHole(holePos.x, holePos.y);
  }

  /**
   * タイルを描画（菱形）
   * @param {number} gridX - グリッドX座標
   * @param {number} gridY - グリッドY座標
   */
  drawTile(gridX, gridY) {
    const { x, y } = this.gridToIso(gridX, gridY);
    const ctx = this.ctx;
    const halfWidth = this.tileWidth / 2;
    const halfHeight = this.tileHeight / 2;

    // タイルの色
    ctx.fillStyle = COLORS.TILE_FILL;
    ctx.strokeStyle = COLORS.TILE_STROKE;
    ctx.lineWidth = 1;

    // 菱形のタイル
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + halfWidth, y - halfHeight);
    ctx.lineTo(x, y - this.tileHeight);
    ctx.lineTo(x - halfWidth, y - halfHeight);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // グリッド番号を表示（デバッグ用）
    ctx.fillStyle = '#666';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const number = gridY * BOARD_SIZE + gridX + 1;
    ctx.fillText(number.toString(), x, y - halfHeight);
  }

  /**
   * 穴を描画（凹んだ感じ）
   * @param {number} gridX - グリッドX座標
   * @param {number} gridY - グリッドY座標
   */
  drawHole(gridX, gridY) {
    const { x, y } = this.gridToIso(gridX, gridY);
    const ctx = this.ctx;
    const halfWidth = this.tileWidth / 2;
    const halfHeight = this.tileHeight / 2;

    // 穴の底面（より暗い色）
    ctx.fillStyle = COLORS.HOLE_FILL;
    ctx.beginPath();
    ctx.moveTo(x, y - 4);
    ctx.lineTo(x + halfWidth - 4, y - halfHeight - 2);
    ctx.lineTo(x, y - this.tileHeight + 4);
    ctx.lineTo(x - halfWidth + 4, y - halfHeight - 2);
    ctx.closePath();
    ctx.fill();

    // 穴の縁（立体感）
    ctx.strokeStyle = COLORS.HOLE_STROKE;
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  /**
   * 直方体を描画（立体感のある描画）
   * @param {Cube} cube - Cubeインスタンス
   */
  drawCube(cube) {
    const orientation = cube.orientation;

    if (orientation === ORIENTATIONS.STANDING) {
      // 立っている状態
      const cells = cube.getOccupiedCells();
      this.drawStandingCube(cells[0].x, cells[0].y);
    } else {
      // 寝ている状態（2マス分）
      const cells = cube.getOccupiedCells();
      this.drawLyingCube(cells, orientation);
    }
  }

  /**
   * 立っている状態の直方体を描画
   * @param {number} gridX - グリッドX座標
   * @param {number} gridY - グリッドY座標
   */
  drawStandingCube(gridX, gridY) {
    const { x, y } = this.gridToIso(gridX, gridY);
    const ctx = this.ctx;
    const halfWidth = this.tileWidth / 2;
    const halfHeight = this.tileHeight / 2;
    const height = RENDER_CONFIG.CUBE_HEIGHT_STANDING;

    // 上面（明るいグレー）
    ctx.fillStyle = COLORS.CUBE_TOP;
    ctx.strokeStyle = COLORS.CUBE_STROKE;
    ctx.lineWidth = 1;

    ctx.beginPath();
    ctx.moveTo(x, y - height);
    ctx.lineTo(x + halfWidth - 2, y - halfHeight - height);
    ctx.lineTo(x, y - this.tileHeight - height + 2);
    ctx.lineTo(x - halfWidth + 2, y - halfHeight - height);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // 左側面（中間グレー）
    ctx.fillStyle = COLORS.CUBE_LEFT;
    ctx.beginPath();
    ctx.moveTo(x - halfWidth + 2, y - halfHeight - height);
    ctx.lineTo(x, y - this.tileHeight - height + 2);
    ctx.lineTo(x, y - this.tileHeight + 2);
    ctx.lineTo(x - halfWidth + 2, y - halfHeight);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // 右側面（暗いグレー）
    ctx.fillStyle = COLORS.CUBE_RIGHT;
    ctx.beginPath();
    ctx.moveTo(x + halfWidth - 2, y - halfHeight - height);
    ctx.lineTo(x, y - this.tileHeight - height + 2);
    ctx.lineTo(x, y - this.tileHeight + 2);
    ctx.lineTo(x + halfWidth - 2, y - halfHeight);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  /**
   * 寝ている状態の直方体を描画
   * @param {Array} cells - 占有セルの配列
   * @param {string} orientation - 向き
   */
  drawLyingCube(cells, orientation) {
    const ctx = this.ctx;

    // 2つのセルを描画
    cells.forEach((cell, index) => {
      const { x, y } = this.gridToIso(cell.x, cell.y);
      const halfWidth = this.tileWidth / 2;
      const halfHeight = this.tileHeight / 2;
      const height = RENDER_CONFIG.CUBE_HEIGHT_LYING;

      // 上面
      ctx.fillStyle = COLORS.CUBE_TOP;
      ctx.strokeStyle = COLORS.CUBE_STROKE;
      ctx.lineWidth = 1;

      ctx.beginPath();
      ctx.moveTo(x, y - height);
      ctx.lineTo(x + halfWidth - 2, y - halfHeight - height);
      ctx.lineTo(x, y - this.tileHeight - height + 2);
      ctx.lineTo(x - halfWidth + 2, y - halfHeight - height);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // 左側面
      ctx.fillStyle = COLORS.CUBE_LEFT;
      ctx.beginPath();
      ctx.moveTo(x - halfWidth + 2, y - halfHeight - height);
      ctx.lineTo(x, y - this.tileHeight - height + 2);
      ctx.lineTo(x, y - this.tileHeight + 2);
      ctx.lineTo(x - halfWidth + 2, y - halfHeight);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // 右側面
      ctx.fillStyle = COLORS.CUBE_RIGHT;
      ctx.beginPath();
      ctx.moveTo(x + halfWidth - 2, y - halfHeight - height);
      ctx.lineTo(x, y - this.tileHeight - height + 2);
      ctx.lineTo(x, y - this.tileHeight + 2);
      ctx.lineTo(x + halfWidth - 2, y - halfHeight);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    });
  }

  /**
   * UI情報を描画
   * @param {number} score - スコア
   * @param {string} mode - モード
   */
  drawUI(score, mode) {
    const ctx = this.ctx;

    // 背景を塗りつぶし
    ctx.fillStyle = COLORS.BACKGROUND;
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  /**
   * エラーアニメーションを再生（傾いてからスナップ戻る）
   * @param {Cube} cube - Cubeインスタンス
   * @param {Object} direction - 移動方向
   * @param {Game} game - Gameインスタンス（再描画用）
   * @returns {Promise} アニメーション完了時に解決
   */
  async playErrorAnimation(cube, direction, game) {
    this.isAnimating = true;

    const originalState = cube.getState();

    // 1. 傾くアニメーション
    await this.animateTilt(cube, direction, game);

    // 2. 元の状態に戻す
    cube.setState(originalState);

    // 3. スナップバックアニメーション
    await this.animateSnapBack(game);

    this.isAnimating = false;
  }

  /**
   * 傾きアニメーション
   * @param {Cube} cube - Cubeインスタンス
   * @param {Object} direction - 移動方向
   * @param {Game} game - Gameインスタンス
   * @returns {Promise} アニメーション完了時に解決
   */
  animateTilt(cube, direction, game) {
    return new Promise(resolve => {
      const startTime = performance.now();
      const duration = ANIMATION_CONFIG.ERROR_TILT_DURATION;
      const maxOffset = ANIMATION_CONFIG.ERROR_TILT_OFFSET;

      const animate = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Ease-out cubic
        const eased = 1 - Math.pow(1 - progress, 3);
        const currentOffset = maxOffset * eased;

        // オフセットを適用して描画
        this.renderFrameWithOffset(cube, direction, currentOffset, game);

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          resolve();
        }
      };

      requestAnimationFrame(animate);
    });
  }

  /**
   * スナップバックアニメーション
   * @param {Game} game - Gameインスタンス
   * @returns {Promise} アニメーション完了時に解決
   */
  animateSnapBack(game) {
    return new Promise(resolve => {
      const startTime = performance.now();
      const duration = ANIMATION_CONFIG.ERROR_SNAP_DURATION;

      const animate = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // 普通に再描画
        game.render();

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          resolve();
        }
      };

      requestAnimationFrame(animate);
    });
  }

  /**
   * オフセットを適用してフレームを描画
   * @param {Cube} cube - Cubeインスタンス
   * @param {Object} direction - 移動方向
   * @param {number} offset - オフセット量
   * @param {Game} game - Gameインスタンス
   */
  renderFrameWithOffset(cube, direction, offset, game) {
    // 位置を一時的に変更
    const originalPos = { ...cube.position };
    cube.position.x += direction.x * (offset / 10);
    cube.position.y += direction.y * (offset / 10);

    // 描画
    game.render();

    // 位置を元に戻す
    cube.position = originalPos;
  }
}
