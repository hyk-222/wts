const { BrowserWindow, app } = require('electron');
const os = require('node:os');
const path = require('node:path');
const fs = require('node:fs/promises');

function getLocalIpAddress() {
  const interfaces = os.networkInterfaces();

  for (const addresses of Object.values(interfaces)) {
    for (const address of addresses || []) {
      if (address.family === 'IPv4' && !address.internal) {
        return address.address;
      }
    }
  }

  return '127.0.0.1';
}

async function fetchLatestOutlineMock() {
  return {
    title: '最新试验大纲',
    code: 'WTS-EXP-2026-001',
    version: 'V1.0',
    department: '试验管理部',
    owner: 'WTS',
    generatedAt: new Date().toLocaleString('zh-CN', { hour12: false }),
    objective:
      '验证关键总成在典型工况、边界工况与持续运行条件下的性能稳定性，形成可追溯的试验记录与结论。',
    scope: ['功能完整性验证', '性能指标达成验证', '异常工况响应验证', '数据采集与报告输出验证'],
    steps: [
      {
        name: '试验准备',
        content: '确认样件状态、传感器标定、台架环境、软件版本与安全检查项。',
      },
      {
        name: '基准工况运行',
        content: '按照标准工况运行 30 分钟，采集温度、压力、转速、电压与异常告警数据。',
      },
      {
        name: '边界工况验证',
        content: '逐步调整负载、环境温度与输入条件，观察系统响应并记录关键阈值。',
      },
      {
        name: '结果归档',
        content: '整理原始数据、曲线截图、异常说明和试验结论，输出正式报告。',
      },
    ],
    acceptance: ['关键指标满足设计目标', '试验过程无不可恢复故障', '数据记录完整且可追溯'],
  };
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function renderOutlineHtml(outline) {
  const scopeItems = outline.scope.map((item) => `<li>${escapeHtml(item)}</li>`).join('');
  const stepRows = outline.steps
    .map(
      (step, index) => `
        <tr>
          <td>${index + 1}</td>
          <td>${escapeHtml(step.name)}</td>
          <td>${escapeHtml(step.content)}</td>
        </tr>
      `
    )
    .join('');
  const acceptanceItems = outline.acceptance.map((item) => `<li>${escapeHtml(item)}</li>`).join('');

  return `
    <!doctype html>
    <html lang="zh-CN">
      <head>
        <meta charset="UTF-8" />
        <style>
          body {
            margin: 0;
            padding: 36px;
            color: #172033;
            font-family: "Microsoft YaHei", "Noto Sans CJK SC", Arial, sans-serif;
            line-height: 1.7;
          }
          .cover {
            padding-bottom: 20px;
            border-bottom: 3px solid #2563eb;
            margin-bottom: 28px;
          }
          h1 {
            margin: 0 0 12px;
            font-size: 30px;
            letter-spacing: 0;
          }
          .meta {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 8px 24px;
            color: #475569;
            font-size: 13px;
          }
          h2 {
            margin: 24px 0 10px;
            font-size: 18px;
            color: #1d4ed8;
          }
          .section {
            break-inside: avoid;
          }
          .summary {
            padding: 14px 16px;
            border-left: 4px solid #38bdf8;
            background: #f0f9ff;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
            font-size: 13px;
          }
          th, td {
            border: 1px solid #cbd5e1;
            padding: 9px 10px;
            vertical-align: top;
          }
          th {
            background: #eff6ff;
            color: #1e3a8a;
            text-align: left;
          }
          td:first-child {
            width: 42px;
            text-align: center;
            font-weight: 700;
          }
          ul {
            margin: 8px 0 0;
            padding-left: 20px;
          }
          .footer {
            margin-top: 32px;
            padding-top: 12px;
            border-top: 1px solid #e2e8f0;
            color: #64748b;
            font-size: 12px;
          }
        </style>
      </head>
      <body>
        <div class="cover">
          <h1>${escapeHtml(outline.title)}</h1>
          <div class="meta">
            <div>大纲编号：${escapeHtml(outline.code)}</div>
            <div>版本：${escapeHtml(outline.version)}</div>
            <div>责任部门：${escapeHtml(outline.department)}</div>
            <div>负责人：${escapeHtml(outline.owner)}</div>
            <div>生成时间：${escapeHtml(outline.generatedAt)}</div>
          </div>
        </div>

        <section class="section">
          <h2>一、试验目标</h2>
          <div class="summary">${escapeHtml(outline.objective)}</div>
        </section>

        <section class="section">
          <h2>二、适用范围</h2>
          <ul>${scopeItems}</ul>
        </section>

        <section class="section">
          <h2>三、试验步骤</h2>
          <table>
            <thead>
              <tr>
                <th>序号</th>
                <th>阶段</th>
                <th>内容</th>
              </tr>
            </thead>
            <tbody>${stepRows}</tbody>
          </table>
        </section>

        <section class="section">
          <h2>四、验收标准</h2>
          <ul>${acceptanceItems}</ul>
        </section>

        <div class="footer">由 WTS 桌面应用根据最新试验大纲数据生成。</div>
      </body>
    </html>
  `;
}

async function generateLatestOutlinePdf() {
  const outline = await fetchLatestOutlineMock();
  const ipAddress = getLocalIpAddress();
  const fileName = `${ipAddress}试验大纲.pdf`;
  const filePath = path.join(app.getPath('downloads'), fileName);

  const pdfWindow = new BrowserWindow({
    show: false,
    webPreferences: {
      offscreen: true,
      sandbox: true,
    },
  });

  try {
    const html = renderOutlineHtml(outline);
    await pdfWindow.loadURL(`data:text/html;charset=UTF-8,${encodeURIComponent(html)}`);
    const pdfBuffer = await pdfWindow.webContents.printToPDF({
      printBackground: true,
      pageSize: 'A4',
      margins: {
        marginType: 'custom',
        top: 0.4,
        bottom: 0.4,
        left: 0.35,
        right: 0.35,
      },
    });

    await fs.writeFile(filePath, pdfBuffer);

    return {
      ok: true,
      fileName,
      filePath,
      ipAddress,
      outline,
    };
  } finally {
    pdfWindow.destroy();
  }
}

module.exports = {
  generateLatestOutlinePdf,
};
