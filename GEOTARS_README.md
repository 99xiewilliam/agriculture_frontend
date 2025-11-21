# GeoTARS 前端系统使用说明

## 快速启动

### 1. 启动后端服务

**启动 vLLM（Qwen3-VL-8B）**：
```bash
conda activate mrag
CUDA_VISIBLE_DEVICES=3,4,5,6 python -m vllm.entrypoints.openai.api_server \
  --model /home/xwh/models/Qwen3-VL-8B-Instruct \
  --port 9000 \
  --tensor-parallel-size 4 \
  --trust-remote-code
```

**启动 MRAG 服务**：
```bash
cd /home/xwh/vlm_agriculture/mrag_service
conda activate mrag
uvicorn main:app --host 0.0.0.0 --port 8000
```

### 2. 启动前端

```bash
cd /home/xwh/vlm_agriculture/frontend
npm run dev
```

访问: http://localhost:3000

---

## 功能说明

### 左侧面板（输入区）
1. **州选择器**：选择目标州（IL/IA/MS/LA）
2. **县选择器**：通过搜索框或交互式地图选择县
3. **作物选择**：多选支持（玉米/大豆/冬小麦/棉花）
4. **问题输入**：自然语言描述预测需求
5. **图片/视频上传**：拖拽上传田间照片、遥感影像等
6. **新闻链接**：添加相关灾害/气候新闻
7. **预测年份**：设置目标年份（2024-2030）

### 中间主区（结果展示）
1. **预测摘要卡片**：
   - 预测单产、总产量
   - 置信度评分
   - 风险标签（干旱/高温/病虫害等）
   - 调整依据说明

2. **详细分析报告**：
   - LLM 生成的完整 Markdown 报告
   - 四部分结构：结论摘要、证据对齐、风险分析、后续建议
   - 支持证据引用点击跳转

3. **检索证据浏览**：
   - 多模态证据卡片（文本+图像）
   - 来源标注（USDA/HRRR/Sentinel-2/AMIS）
   - 相关度评分展示

### 右侧面板（可视化）
1. **气象时序图**：
   - 温度、降水、VPD 多变量折线
   - 交互式 tooltip

2. **历史产量对比**：
   - 柱状图展示多年产量趋势

3. **特征快照表格**：
   - 匹配到的地区-作物特征详情
   - 时间窗、数据源等元数据

---

## 使用示例

### 场景1：基础预测
1. 选择"Illinois" → "Sangamon County"
2. 勾选"大豆"
3. 输入："请基于 2023 年大豆产量预测 2024 年情况"
4. 点击"分析预测"
5. 查看右侧气象图表和历史趋势

### 场景2：上传图片分析
1. 选择地区和作物
2. 拖拽田间病害照片到上传区
3. 输入："分析此图像的病害风险并预测产量影响"
4. 提交查询

### 场景3：新闻辅助预测
1. 添加新闻链接（如干旱报道）
2. 输入："结合新闻信息预测玉米减产幅度"
3. 系统会整合新闻内容与 RAG 检索结果

---

## API 端点

前端调用以下后端接口：

- `POST /answer`：完整预测（检索 + 生成 + 预测）
- `POST /query`：仅检索，不生成报告
- `POST /index`：重建索引（管理员功能）

---

## 环境变量

在 `.env.local` 中配置：

```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
```

---

## 技术栈

- **框架**: Next.js 16 (React 19)
- **状态管理**: Zustand
- **数据获取**: TanStack Query (React Query)
- **地图**: Leaflet + React-Leaflet
- **图表**: Recharts
- **样式**: Tailwind CSS 4
- **图标**: Lucide React

---

## 下一步增强

1. **实时数据集成**：
   - 从 `data_store/features` 直接读取最新特征快照
   - 支持按月份/季度筛选 Sentinel-2 影像

2. **高级可视化**：
   - NDVI 热力图叠加到县级地图
   - 知识图谱 3D 可视化（Cytoscape.js）
   - 预测置信度分布图

3. **对比分析**：
   - 并排对比多个地区/年份
   - What-if 场景模拟（调整气温/降水参数）

4. **导出功能**：
   - PDF 报告生成（含图表截图）
   - Excel 导出预测数据表

5. **移动适配**：
   - 响应式布局优化
   - 底部抽屉式侧边栏

---

**当前状态**: ✅ 核心功能已实现，可直接使用

