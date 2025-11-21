export type Language = 'zh' | 'en'

export const translations = {
  zh: {
    // 侧边栏 & 标题
    appName: 'GeoTARS',
    appSubtitle: '多模态农业产量预测与灾害预警系统',
    inputPlaceholder: '描述你想了解的农业情况...',
    inputHint: '例如：2023年伊利诺伊州大豆产量如何？',
    submitBtn: '开始分析',
    historyTitle: '历史记录',
    
    // 地区选择器
    regionModeUS: '🇺🇸 美国各州',
    regionModeGlobal: '🌍 全球区域',
    selectState: '选择州',
    selectCounty: '选择县（或在地图上点击）',
    searchPlaceholder: '搜索县名或 FIPS 代码',
    searchGlobalPlaceholder: '搜索国家或地区...',
    globalModeTip: '💡 全球模式：支持东南亚台风区、南美粮仓、欧洲小麦带等重点农业区域。',
    interactiveMap: '📍 交互式地图',
    
    // 作物与年份
    selectCrop: '选择作物',
    targetYear: '预测年份',
    crops: {
      corn: '玉米',
      soybean: '大豆',
      winterwheat: '冬小麦',
      cotton: '棉花',
      rice: '水稻',
      wheat: '小麦',
    },

    // 结果页
    analyzing: 'GeoTARS 正在分析...',
    analyzingDesc: '正在检索多模态证据并生成预测报告',
    steps: {
      intent: '解析查询意图',
      retrieve: '检索相关证据',
      reason: 'MMST-ViT 模型推理',
      generate: '生成分析报告',
    },
    emptyState: '请在左侧输入问题并提交查询',
    agentThought: 'Agent 思考过程',
    toolCalls: '工具调用',
    predictionResults: '预测结果',
    detailedReport: '详细分析报告',
    evidence: '检索证据',
    confidence: '置信度',
    predictedYield: '预测单产',
    predictedProduction: '预测总产',
    riskSignal: '风险信号',
    adjustments: '调整依据',
    dataSource: '数据源',
  },
  en: {
    // Sidebar & Header
    appName: 'GeoTARS',
    appSubtitle: 'Multimodal Agriculture Analysis & Disaster Warning',
    inputPlaceholder: 'Describe the agricultural situation...',
    inputHint: 'E.g., How was the soybean yield in Illinois in 2023?',
    submitBtn: 'Analyze',
    historyTitle: 'History',

    // Region Selector
    regionModeUS: '🇺🇸 US States',
    regionModeGlobal: '🌍 Global Regions',
    selectState: 'Select State',
    selectCounty: 'Select County (or click on map)',
    searchPlaceholder: 'Search county or FIPS...',
    searchGlobalPlaceholder: 'Search country or region...',
    globalModeTip: '💡 Global Mode: Supports key regions like SE Asia (Typhoon), S. America, Europe, etc.',
    interactiveMap: '📍 Interactive Map',

    // Crops & Year
    selectCrop: 'Select Crop',
    targetYear: 'Target Year',
    crops: {
      corn: 'Corn',
      soybean: 'Soybean',
      winterwheat: 'Winter Wheat',
      cotton: 'Cotton',
      rice: 'Rice',
      wheat: 'Wheat',
    },

    // Results
    analyzing: 'GeoTARS is Analyzing...',
    analyzingDesc: 'Retrieving multimodal evidence and generating report',
    steps: {
      intent: 'Parsing Intent',
      retrieve: 'Retrieving Evidence',
      reason: 'Model Reasoning',
      generate: 'Generating Report',
    },
    emptyState: 'Please enter a query on the left to start.',
    agentThought: 'Agent Thought Process',
    toolCalls: 'Tool Calls',
    predictionResults: 'Prediction Results',
    detailedReport: 'Detailed Analysis Report',
    evidence: 'Retrieved Evidence',
    confidence: 'Confidence',
    predictedYield: 'Predicted Yield',
    predictedProduction: 'Total Production',
    riskSignal: 'Risk Signals',
    adjustments: 'Adjustments',
    dataSource: 'Source',
  },
}

