/**
 * Game クラス
 * メインループ、イベント処理、モード切替、ゲーム全体の統括を担当
 */
class Game {
  /**
   * コンストラクタ
   */
  constructor() {
    // Canvasの取得
    this.canvas = document.getElementById('gameCanvas');

    // ゲームオブジェクトの初期化
    this.board = new Board();
    this.cube = null;  // start()で初期化
    this.renderer = new Renderer(this.canvas);

    // ゲーム状態
    this.score = 0;
    this.mode = MODES.NORMAL;
    this.isMenuOpen = false;
    this.isRunning = false;

    // DOM要素
    this.scoreElement = document.getElementById('score');
    this.modeElement = document.getElementById('mode');
    this.menuElement = document.getElementById('menu');
    this.blindModeLog = document.getElementById('blindModeLog');
    this.blindModeContent = document.getElementById('blindModeContent');

    // イベントリスナーを設定
    this.setupEventListeners();
  }

  /**
   * ゲームを開始
   */
  start() {
    this.isRunning = true;

    // ランダムに初期配置
    this.board.placeRandomHole();
    this.placeCubeRandomly();

    // メインループ開始
    this.startGameLoop();
  }

  /**
   * 直方体をランダムに配置
   */
  placeCubeRandomly() {
    const x = Math.floor(Math.random() * BOARD_SIZE);
    const y = Math.floor(Math.random() * BOARD_SIZE);
    this.cube = new Cube(x, y, ORIENTATIONS.STANDING);
  }

  /**
   * イベントリスナーを設定
   */
  setupEventListeners() {
    document.addEventListener('keydown', (e) => this.handleInput(e));
  }

  /**
   * キーボード入力の処理
   * @param {KeyboardEvent} e - キーボードイベント
   */
  handleInput(e) {
    // メニューが開いている場合はEscのみ受け付ける
    if (this.isMenuOpen) {
      if (e.key === 'Escape') {
        e.preventDefault();
        this.toggleMenu();
      }
      return;
    }

    // アニメーション中は操作を受け付けない
    if (this.renderer.isAnimating) {
      return;
    }

    switch (e.key) {
      case 'ArrowUp':
        e.preventDefault();
        this.tryMoveCube(DIRECTIONS.UP);
        break;
      case 'ArrowDown':
        e.preventDefault();
        this.tryMoveCube(DIRECTIONS.DOWN);
        break;
      case 'ArrowLeft':
        e.preventDefault();
        this.tryMoveCube(DIRECTIONS.LEFT);
        break;
      case 'ArrowRight':
        e.preventDefault();
        this.tryMoveCube(DIRECTIONS.RIGHT);
        break;
      case ' ':
        e.preventDefault();
        this.handleConfirm();
        break;
      case 'Escape':
        e.preventDefault();
        this.toggleMenu();
        break;
    }
  }

  /**
   * 直方体の移動を試みる
   * @param {Object} direction - 移動方向 {x, y}
   */
  tryMoveCube(direction) {
    // 転がりを試みる
    const newState = this.cube.tryRoll(direction);
    const newCells = newState.cells;

    // 完全盤外チェック
    if (this.board.isAllCellsOutOfBounds(newCells)) {
      // エラーアニメーションを再生
      this.renderer.playErrorAnimation(this.cube, direction, this);
      return;
    }

    // 有効な移動
    this.cube.updateState(newState);

    // クリアチェック
    if (this.cube.isClear(this.board.getHolePosition())) {
      this.handleClear();
    }

    // ブラインドモードの場合、テキストログを更新
    if (this.mode === MODES.BLIND) {
      this.updateBlindModeLog();
    }
  }

  /**
   * クリア時の処理
   */
  handleClear() {
    this.score++;
    this.updateScoreDisplay();

    // 新しい配置
    this.board.placeRandomHole();
    this.placeCubeRandomly();

    // ブラインドモードの場合、テキストログを更新
    if (this.mode === MODES.BLIND) {
      this.updateBlindModeLog();
    }
  }

  /**
   * 決定ボタンの処理
   */
  handleConfirm() {
    // 将来的な拡張用
    // 現在は特に何もしない
  }

  /**
   * メニューの開閉を切り替え
   */
  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;

    if (this.isMenuOpen) {
      this.menuElement.style.display = 'block';
    } else {
      this.menuElement.style.display = 'none';
    }
  }

  /**
   * モードを切り替え（通常 ↔ ブラインド）
   */
  toggleMode() {
    this.mode = this.mode === MODES.NORMAL ? MODES.BLIND : MODES.NORMAL;

    if (this.mode === MODES.BLIND) {
      this.canvas.style.display = 'none';
      this.blindModeLog.style.display = 'block';
      this.updateBlindModeLog();
    } else {
      this.canvas.style.display = 'block';
      this.blindModeLog.style.display = 'none';
    }

    this.updateModeDisplay();
  }

  /**
   * スコアをリセット
   */
  resetScore() {
    this.score = 0;
    this.updateScoreDisplay();

    // 新しい配置
    this.board.placeRandomHole();
    this.placeCubeRandomly();

    // ブラインドモードの場合、テキストログを更新
    if (this.mode === MODES.BLIND) {
      this.updateBlindModeLog();
    }
  }

  /**
   * スコア表示を更新
   */
  updateScoreDisplay() {
    this.scoreElement.textContent = this.score;
  }

  /**
   * モード表示を更新
   */
  updateModeDisplay() {
    this.modeElement.textContent = this.mode === MODES.NORMAL ? 'Normal' : 'Blind';
  }

  /**
   * ブラインドモードのログを更新
   */
  updateBlindModeLog() {
    const holePos = this.board.getHolePosition();
    const holeNumber = this.board.gridToNumber(holePos.x, holePos.y);
    const cells = this.cube.getOccupiedCells();

    let cubeInfo = '';

    if (this.cube.orientation === ORIENTATIONS.STANDING) {
      const cubeNumber = this.board.gridToNumber(cells[0].x, cells[0].y);
      cubeInfo = `直方体の位置：${cubeNumber}（立っている）`;
    } else {
      const descriptions = cells.map(cell => {
        if (this.board.isWithinBounds(cell.x, cell.y)) {
          return this.board.gridToNumber(cell.x, cell.y).toString();
        } else {
          return '外';
        }
      });
      cubeInfo = `直方体の位置：${descriptions.join('と')}（寝ている）`;
    }

    this.blindModeContent.innerHTML = `
      <p><strong>現在の穴：${holeNumber}</strong></p>
      <p>${cubeInfo}</p>
      <p>スコア：${this.score}</p>
      <p style="font-size: 14px; color: #666; margin-top: 20px;">
        矢印キーで移動 / Escでメニュー
      </p>
    `;
  }

  /**
   * ゲームをレンダリング（メインループから呼ばれる）
   */
  render() {
    if (!this.isRunning) return;

    // メニューが開いている場合は描画しない
    if (this.isMenuOpen) return;

    // ブラインドモードの場合はCanvasを描画しない
    if (this.mode === MODES.BLIND) return;

    // 画面をクリア
    this.renderer.clear();

    // 盤面を描画
    this.renderer.drawBoard(this.board);

    // 直方体を描画
    this.renderer.drawCube(this.cube);

    // UIを描画
    this.renderer.drawUI(this.score, this.mode);
  }

  /**
   * メインループを開始
   */
  startGameLoop() {
    const loop = () => {
      this.render();
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }
}
