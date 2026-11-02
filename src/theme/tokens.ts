// Перенесено из block-screens/*/styles/tokens.css. Имена совпадают с CSS-переменными без префикса --c-.

export const colors = {
  bg: '#f4f6f8',
  bgPage: '#f6f8fa',
  card: '#ffffff',
  white: '#ffffff',
  black: '#000000',
  text: '#000000',
  textSecondary: '#717479',
  chartLabel: '#747679',
  separator: '#e4e6e7',
  grid: '#e7e7e7',
  tick: '#ebebeb',
  bar: '#3983f0',
  barFuture: '#eef1f9',
  decrease: '#14c765',
  chevronCompact: '#c7c8cc',
  tabInk: '#0d0e12',
  wordmark: '#fafefd',
  goalGreen: '#00c350',
  sectionLight: '#9198a4',
  muBar: '#3784f1',
  chip: '#e3ecf8',
  chipInk: '#3b7ddf',
  otherBg: '#eaf0f9',
  otherIco: '#3582eb',
  plusMore: '#747a89',
  section: '#9499a4',
  chevron: '#727587',
  streak: '#e16335',
  streakBorder: '#faefe6',
  blocking: '#3b7cf0',
  unlockCount: '#797a85',
  dash: '#dcdee1',
  dashHint: '#e6e8eb',
  dashTpl: '#e2e2e2',
  plusCircle: '#dee0e4',
  plusCircle2: '#d6d9df',
  plusInk: '#757c89',
  addTitle: '#737889',
  addHint: '#9699a2',
  pillBorder: '#e6e8ec',
  meta: '#757987',
  metaSep: '#e4e4e4',
  bullet: '#6f777e',
  lockGrey: '#c6c8cd',
  appsPill: '#eaeef2',
  hint: '#757988',
  ongoingBorder: '#c8d9ee',
  accentText: '#5080da',
  accentIco: '#5781d1',
  ringTrack: '#c7d7f3',
  progressTrack: '#eaeff0',
  blockingPill: '#3a82f7',
  taskRing: '#e4e5e6',
  taskSub: '#777b82',
  seeMore: '#171717',
  hdrBlur: '#f9f9f9',
  avatarInk: '#3d80e3',
  pencil: '#cce7fe',
  now: '#1dc167',
  nowBg: '#e6faee',
  nowBorder: '#d0f1dd',
  nowPill: '#cef3db',
  before: '#ed551c',
  beforeBorder: '#ffe6da',
  beforePillBorder: '#fbdbcb',
  beforeNum: '#b2b7c0',
  beforeSub: '#c6c8cb',
  written: '#91929d',
  artPill: 'rgba(24, 8, 9, 0.55)',
  glassDarkFill: 'rgba(0, 40, 140, 0.2)',
  glassRim: 'rgba(120, 215, 255, 0.45)',
  glassTplFill: 'rgba(40, 40, 120, 0.35)',
  glassTplRim: 'rgba(160, 150, 255, 0.45)',
  tabbar: 'rgba(255, 255, 255, 0.5)',
  tabbarHome: 'rgba(243, 243, 245, 0.86)',
  tabSelected: 'rgba(205, 207, 214, 0.55)',
  startRim: 'rgba(187, 238, 250, 0.9)',
  dotOff: '#89bafd',
  limitProgress: '#54c567',
  tutorialDim: 'rgba(0, 0, 0, 0.13)',
  periodDim: 'rgba(0, 0, 0, 0.13)',
  periodSegment: '#e9eef1',
  periodSelected: '#edf1fe',
  excludedBg: '#dfe2e7',
  excludedInk: '#788292',
  emptyActivities: '#737d93',
  activityHighlight: '#e2f8cd',
  contextMenu: 'rgba(248, 250, 251, 0.92)',
  menuInk: '#080a09',
  qTile: '#1f80e2',
  qTileRim: 'rgba(110, 215, 255, 0.75)',
  qTileOn: '#707d97',
  qChartTrack: '#f4f6f8',
  qGoodOn: '#00d45c',
  qProductive: '#0dc763',
  qNeutral: '#feaa16',
  barQ: '#737d93',
  toastSuccess: '#b5ead1',
} as const;

export const gradients = {
  start: {
    colors: ['#3388db', '#3392eb', '#389dff', '#7dbaff', '#abd5ff', '#b8ddfc'],
    locations: [0.078, 0.283, 0.487, 0.693, 0.897, 0.964],
  },
  startRules: {
    colors: ['#4a84d0', '#4d8ee3', '#559bf5', '#89b7fb', '#b3d3fb', '#c0dcfd'],
    locations: [0.078, 0.283, 0.487, 0.693, 0.897, 0.964],
  },
  period: {
    colors: ['#66a7e4', '#6db0ef', '#6cb6fc', '#85c0ff', '#a4d1ff', '#bfe0ff'],
    locations: [0.07, 0.23, 0.4, 0.6, 0.79, 0.95],
  },
  menuRefraction: {
    colors: ['#f6f8fc', '#f0f6ff', '#d9edff', '#cbe7fe', '#cce8ff', '#cee9ff', '#f4f6fe', '#f6f9fd'],
    locations: [0, 0.143, 0.286, 0.429, 0.571, 0.714, 0.857, 1],
  },
} as const;

export const radii = {
  card: 31,
  ruleCard: 26,
  tile: 26,
  gtile: 20,
  art: 25,
  pill: 999,
} as const;

export const shadows = {
  card: '0px 10px 30px rgba(20, 30, 60, 0.06)',
  ruleCard: '0px 6px 20px rgba(20, 30, 60, 0.06)',
  btnWhite: '0px 4px 16px rgba(20, 30, 60, 0.08)',
  pillSoft: '0px 3px 12px rgba(20, 30, 60, 0.08)',
  tabbar: '0px 10px 30px rgba(20, 30, 60, 0.17)',
  tabbarRim: 'inset 0px 0px 0px 1px rgba(255, 255, 255, 0.9)',
  start: '0px 10px 26px rgba(40, 110, 220, 0.12)',
  startRim: `inset 0px 1px 0px ${colors.startRim}`,
  glassDark: `inset 0px 0px 0px 1px ${colors.glassRim}`,
  glassTpl: `inset 0px 0px 0px 1px ${colors.glassTplRim}`,
  contextMenu: '0px 10px 35px rgba(35, 46, 52, 0.12)',
  contextMenuRim: 'inset 0px 0px 0px 1px rgba(255, 255, 255, 0.7)',
} as const;

export const insetBorder = (color: string, width = 1.333) => `inset 0px 0px 0px ${width}px ${color}`;

// Горизонтальное поле экрана в макете.
export const GUTTER = 20;

// Поток04: значения из session-editor.css и blocking-menu.css HTML-выгрузок.
export const sessionTheme = {
  backdrop: 'rgba(0,0,0,.52)', surface: '#f7f7f9', menu: 'rgba(250,250,252,.68)',
  ink: '#111114', secondary: '#7a7f88', section: '#858b95', handle: '#e5e6e8',
  orange: '#ffab13', cyan: '#22b8e8', red: '#ff5427', violet: '#bd69e8', green: '#12c67a',
  strict: '#e1785c', blue: '#3983f0', off: '#c7c8ca', disabled: '#c5c7ca',
  dark: '#191919', rim: '#929393', line: 'rgba(110,120,130,.28)', badge: '#edf0f3',
  rowShadow: '0px 1px 2px #00000010, 0px 3px 10px #16203a04',
  buttonShadow: 'inset 0px 0px 0px .833px #929393, 0px 6px 16px #1018200a',
  focusGradient: ['#21265e', '#9630a7'],
  sheetRadius: 40, rowRadius: 22, suggestionRadius: 20, side: 20,
} as const;

// Колёса и поповер времени из состояний048–053 HTML-потока04.
export const sessionPickerTheme = {
  wheelMuted: '#aeb2b9', wheelPill: '#f4f5f7', wheelInk: '#18191b',
  segmentBorder: '#e1e3e7', scheduleGrid: '#f7f8fa', scheduleLine: '#e4e6e9', scheduleTime: '#e9eaed',
  clockFill: 'rgba(250,250,252,.94)', clockMask: '#fafafc', clockFade: 'rgba(250,250,252,0)',
  whiteFade: 'rgba(255,255,255,0)', clockRim: 'rgba(255,255,255,.75)',
  switchThumbShadow: 'none', switchOn: '#3983ed', switchOff: '#c1c0c5',
  clockShadow: '0px 8px 24px #0f141e20, inset 0px 1px 0px #ffffffe6',
  note: '#858a93', inactiveDay: '#858b95',
  activityRadius: 25, gridRadius: 22, clockRadius: 28,
  clockWidth: 234, clockHeight: 204, clockCenter: 103, clockRow: 28,
  durationHeight: 220, durationCenter: 96, durationRow: 29,
} as const;

// Разблокировки055/056: значения сняты с template-editor-fixes.css.
export const sessionUnlockTheme = {
  radius: 25, choiceRadius: 23, countRadius: 21,
  countShadow: '0px 2px 9px #10182814',
  maxBackground: '#eff6fe', maxInk: '#3983d8', muted: '#c5c7ca',
  durationRadius: 44, durationSurface: '#f7f9fb', durationFade: 'rgba(247,249,251,0)', durationBackdrop: 'rgba(20,22,27,.16)', durationHighlight: '#e3e4e6', durationHelp: '#89929f', durationButton: '#17191a',
  countSize: 40, countButton: 41, detailHeight: 374,
} as const;

export const savedTemplateTheme = {
  width: 170.667, height: 221, radius: 25.5, pillRadius: 14, buttonRadius: 18,
  pill: '#fcfcfc', pillShadow: '0px 6px 20px #141e3c04', buttonShadow: '0px 6px 20px #171b2605',
} as const;

// Нижний лист выбора emoji059/060.
export const sessionIconTheme = {
  surface: '#f7f8fa', backdrop: 'rgba(0,0,0,.12)', handle: '#d7d9dc',
  focusOutline: 'transparent', searchBorder: '#dedfe2', placeholder: '#b9bdc3', searchIcon: '#c2c5c9',
  sheetTopRadius: 52, sheetBottomRadius: 64, searchRadius: 30, tileRadius: 16,
} as const;

// Настройки перед открытием080–082/084.
export const unlockMethodTheme = {
  backdrop: '#c4c6c8',
  surface: '#f6f8fa', backSheet: '#dadbdd', handle: '#dcdfe2', radioBorder: '#e5e8eb',
  grid: '#f7f8fa', line: '#f0f0f2', stepper: '#e9eaed', stepperLine: '#c6c8cc',
  value: '#7c8797', note: '#858d97', deviceLabel: '#949494', deviceIntent: '#94bff6',
  copyFade: 'rgba(255,255,255,0)', surfaceFade: 'rgba(246,248,250,0)',
  copyBorder: '#e7e8eb', copyAction: '#4f91ce', copyPlaceholder: '#b0b5bd', copyRadius: 25,
  scanGrid: '#f5f7f9', scanLine: '#eef0f2', scanValue: '#818d9f', scanChevron: '#c6ccd2',
  scanNote: '#7b8799', scanLink: '#91bffa', scanHint: '#a1a6ab', scanWarning: '#ef9c00', scanWarningFill: '#fff3d9',
  scanDisabled: '#b6b7b9', scanDisabledInk: '#d9dadd', scanMenu: '#fafbfbd9', scanMenuBorder: '#ffffffb0',
  scanMenuShadow: '0px 8px 26px #27334515', scanMenuRadius: 35, scanPillRadius: 14,
  panelRadius: 44, cardRadius: 21, gridRadius: 19, stepperRadius: 20,
} as const;

export const strictTheme = {
  surface: '#f6f8fa', backdrop: 'rgba(0,0,0,.13)', handle: '#dcdfe2', border: '#e3e5e8',
  secondary: '#7b8698', blue: '#4b83ed', note: '#7d8797', countFill: '#f4f5f7',
  gradient: ['#fa5851', '#ffaf46'], red: '#fb534b', orange: '#ffac49',
  radius: 34, cardRadius: 21, tabRadius: 23,
  surfaceFade: 'rgba(246,248,250,.9)',
  alertBackdrop: 'rgba(0,0,0,.2)', alertCopy: '#595959', alertCancel: '#d0d0d0', alertPrimary: '#0088ff',
  alertGradient: ['rgba(255,255,255,.46)', 'rgba(255,255,255,.82)'],
  alertShadow: 'inset 0px 0px 0px 1px #ffffffa8, 0px 10px 30px #0000000c',
} as const;

// Группа приложений063–069: app-groups.css и app-group-fixes.css.
export const appGroupTheme = {
  backdrop: '#777777', summaryBackdrop: '#c4c6c8', optionsBackdrop: '#e1e2e3', backSheet: '#e1e2e3',
  surface: '#f2f2f8', optionsSurface: '#f7f8fa', dim: 'rgba(0,0,0,.13)',
  handle: '#d9dadd', blue: '#3983ed', checkboxBlue: '#4285ed', title: '#8a9099',
  segment: '#e5e5eb', segmentShadow: '0px 2px 5px #10182818',
  summary: '#e6eaf8', summaryInk: '#4184e7', radio: '#d2d5da', optionRadio: '#d4d6da',
  divider: '#ededee', optionDivider: '#f0f0f2', chevron: '#c3c7cc', count: '#a9adb4', section: '#969da8',
  note: '#838b99', secondary: '#858d9a', placeholder: '#bec2c7', inputBorder: '#dedfe3',
  addDisabled: '#a8c6f5', badge: '#e9edef', error: '#b73d37', focusOutline: 'transparent',
  searchFill: 'rgba(255,255,255,.92)', searchShadow: '0px 5px 15px #12182714',
  extraShadow: '0px 2px 8px #1018280c', surfaceFade: 'rgba(242,242,248,0)',
  sheetRadius: 34, sheetBottomRadius: 40, segmentRadius: 18, segmentInnerRadius: 15,
  listRadius: 25, extraRadius: 20, searchRadius: 26, badgeRadius: 16,
  optionsTopRadius: 36, optionsBottomRadius: 52, inputRadius: 28, websiteRadius: 20,
} as const;
