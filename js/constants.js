/**
 * キューブフィット - 定数定義
 * ゲーム全体で使用する定数を定義
 */

// 移動方向の定義
const DIRECTIONS = {
  UP: { x: 0, y: -1 },
  DOWN: { x: 0, y: 1 },
  LEFT: { x: -1, y: 0 },
  RIGHT: { x: 1, y: 0 }
};

// 直方体の向き（orientation）の定義
const ORIENTATIONS = {
  STANDING: 'standing',              // 立っている状態（1マス占有）
  LYING_HORIZONTAL: 'lying-horizontal',  // 横に寝ている状態（2マス水平占有）
  LYING_VERTICAL: 'lying-vertical'   // 縦に寝ている状態（2マス垂直占有）
};

// ゲームモードの定義
const MODES = {
  NORMAL: 'normal',    // 通常モード（Canvas描画）
  BLIND: 'blind'       // ブラインドモード（テキストのみ）
};

// 盤面サイズ
const BOARD_SIZE = 3;

// Canvas描画設定
const RENDER_CONFIG = {
  TILE_WIDTH: 64,       // タイル幅
  TILE_HEIGHT: 32,      // タイル高さ（幅の半分）
  CUBE_HEIGHT_STANDING: 60,    // 立っている時の高さ
  CUBE_HEIGHT_LYING: 30,       // �ている時の高さ
  ORIGIN_X: 400,        // 原点X座標（画面中央）
  ORIGIN_Y: 280,        // 原点Y座標（画面中央付近）
};

// カラーパレット（白・黒・グレー基調）
const COLORS = {
  // タイル
  TILE_FILL: '#e0e0e0',
  TILE_STROKE: '#b0b0b0',

  // 穴
  HOLE_FILL: '#303030',
  HOLE_STROKE: '#505050',

  // 直方体（立体的な色分け）
  CUBE_TOP: '#f0f0f0',        // 上面（明るいグレー）
  CUBE_LEFT: '#a0a0a0',       // 左側面（中間グレー）
  CUBE_RIGHT: '#707070',      // 右側面（暗いグレー）
  CUBE_STROKE: '#505050',     // 枠線

  // 背景
  BACKGROUND: '#0a0a0a',
  UI_TEXT: '#f0f0f0',
  UI_LABEL: '#888888'
};

// アニメーション設定
const ANIMATION_CONFIG = {
  ERROR_TILT_DURATION: 150,      // エラー時の傾きアニメーション時間（ms）
  ERROR_SNAP_DURATION: 100,      // エラー時のスナップバック時間（ms）
  ERROR_TILT_OFFSET: 10          // 傾きのオフセット量
};
