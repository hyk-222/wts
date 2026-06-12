import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { 
  sendAiQuery, submitAiEvaluate, getSessionList, getSessionDetail,
  updateSessionName, toggleSessionPin, deleteSession, truncateSessionHistory, sendAiQueryStream,
  submitChatVote, getTop10ChatVotes
} from "@/api/wts/aiChat";
import MarkdownRenderer from '@/utils/markdownRenderer';

export const useChatStore = defineStore('chat', () => {
  // 状态集合
  const messages = ref([]);
  const inputQuery = ref('');
  const searchQuery = ref('');
  const loading = ref(false);
  const isGenerating = ref(false);
  const currentAgentType = ref('default');
  const currentSessionId = ref(null);
  const currentConversationId = ref(null);
  const currentInterruptEventId = ref(null);
  
  const abortController = ref(null);
  const isInputFocused = ref(false);
  const isUserScrolling = ref(false);
  const showScrollBottomBtn = ref(false);
  const lastScrollTop = ref(0);
  const ticking = ref(false);
  
  // 征名相关状态
  const isWaitingForCustomName = ref(false);
  const rankingDialogVisible = ref(false);
  const rankingHtml = ref('');
  const showNamingOptions = ref(false);
  const presetNames = ref(['小维', '小智', '小安', '星仔', '欧米', '贾维斯', '心之艾']);

  // 智能体类型配置
  const agentTypes = ref([
    { type: 'default', name: '通用大模型', icon: 'default', color: '#3b82f6', bgColor: 'rgba(59, 130, 246, 0.1)' },
    { type: 'device', name: '设备问答', icon: 'device', color: '#10b981', bgColor: 'rgba(16, 185, 129, 0.1)' },
    { type: 'fault', name: '故障诊断', icon: 'fault', color: '#f59e0b', bgColor: 'rgba(245, 158, 11, 0.1)' },
    { type: 'business', name: '业务问答', icon: 'business', color: '#8b5cf6', bgColor: 'rgba(139, 92, 246, 0.1)' }
  ]);
  
  // 真实历史列表
  const historyList = ref([]);

  const isNewSession = computed(() => !currentSessionId.value && messages.value.length === 0);

  const dynamicPlaceholder = computed(() => {
    if (currentAgentType.value === 'device') {
      return '在此输入设备相关问题... (当前设备专家, Enter 发送，Shift + Enter 换行)';
    }
    if (currentAgentType.value === 'fault') {
      return '在此输入异常现象或报错代码... (当前排障专家, Enter 发送，Shift + Enter 换行)';
    }
    if (currentAgentType.value === 'business') {
      return '在此输入业务流程相关问题... (当前业务专家, Enter 发送，Shift + Enter 换行)';
    }
    return '在此输入您的问题... (默认通用大模型, Enter 发送，Shift + Enter 换行)';
  });

  const filteredHistoryList = computed(() => {
    let list = [...historyList.value];
    if (searchQuery.value.trim()) {
      const query = searchQuery.value.toLowerCase();
      list = list.filter(item => {
        const nameMatch = item.sessionName && item.sessionName.toLowerCase().includes(query);
        const contentMatch = item.queryText && item.queryText.toLowerCase().includes(query);
        return nameMatch || contentMatch;
      });
    }
    return list.sort((a, b) => {
      if (a.isPinned !== b.isPinned) return b.isPinned - a.isPinned;
      return new Date(b.createTime) - new Date(a.createTime);
    });
  });

  // 获取历史记录
  async function fetchHistory() {
    try {
      const res = await getSessionList({ pageNum: 1, pageSize: 50 });
      if (res.code === 200) {
        historyList.value = res.rows;
      }
    } catch (error) {
      console.error("获取记录失败", error);
      loadMockHistory();
    }
  }

  function loadMockHistory() {
    historyList.value = [
      { sessionId: 'session_1', sessionName: '分析1号台架异常扭矩问题', queryText: '分析1号台架异常扭矩问题', isPinned: 1, createTime: '2024-01-15T10:00:00Z' },
      { sessionId: 'session_2', sessionName: '24L柴油机性能试验大纲', queryText: '24L柴油机性能试验大纲生成', isPinned: 0, createTime: '2024-01-14T15:30:00Z' },
      { sessionId: 'session_3', sessionName: '设备维保工装规范', queryText: '设备维保工装规范排查', isPinned: 0, createTime: '2024-01-13T09:15:00Z' }
    ];
  }

  // 开始新对话
  function startNewChat() {
    currentSessionId.value = null;
    currentInterruptEventId.value = null;
    currentConversationId.value = null;
    messages.value = [];
  }

  // 切换智能体
  function toggleAgent(type) {
    if (currentAgentType.value === type) {
      currentAgentType.value = '';
    } else {
      currentAgentType.value = type;
    }
    currentConversationId.value = null;
    currentInterruptEventId.value = null;
  }

  // 加载历史会话详情
  async function loadHistoryDetail(item) {
    currentSessionId.value = item.sessionId;
    currentConversationId.value = null;
    currentInterruptEventId.value = null;
    messages.value = [];
    try {
      const res = await getSessionDetail(item.sessionId);
      if (res.code === 200) {
        let lastUserMsg = null;
        let lastAiMsg = null;

        res.data.forEach(chat => {
          const formattedAns = MarkdownRenderer.formatSmartContent(chat.answerText);

          let parsedRefs = [];
          try {
            if (chat.referencesJson) {
              parsedRefs = JSON.parse(chat.referencesJson);
            }
          } catch (e) {
            console.error("引用文献解析失败");
          }

          if (lastUserMsg && lastUserMsg.content === chat.queryText) {
            lastAiMsg.answerVersions.push(formattedAns);
            lastAiMsg.currentVersionIndex = lastAiMsg.answerVersions.length - 1;
            lastAiMsg.content = formattedAns;
            lastAiMsg.renderedContent = renderMarkdown(formattedAns);
            lastAiMsg.logId = chat.logId;
            lastAiMsg.score = chat.evaluateStatus === 1 ? chat.evaluateScore : null;
            lastAiMsg.comment = chat.evaluateComment || '';
            lastAiMsg.references = parsedRefs;
          } else {
            lastUserMsg = { role: 'user', content: chat.queryText, showActions: false, isEditing: false, logId: chat.logId };
            messages.value.push(lastUserMsg);

            lastAiMsg = {
              role: 'ai', content: formattedAns, logId: chat.logId,
              renderedContent: renderMarkdown(formattedAns),
              score: chat.evaluateStatus === 1 ? chat.evaluateScore : null, comment: chat.evaluateComment || '',
              showCommentBox: false, isLoading: false,
              answerVersions: [formattedAns],
              isTyping: false,
              currentVersionIndex: 0,
              references: parsedRefs
            };
            messages.value.push(lastAiMsg);
          }
        });
      }
    } catch (e) {
      console.error("获取会话内容失败", e);
      loadMockSessionMessages(item.sessionId);
    }
  }

  function loadMockSessionMessages(sessionId) {
    messages.value = [
      { role: 'user', content: '请帮我分析这个问题', showActions: false, isEditing: false, logId: 'log_1' },
      { 
        role: 'ai', 
        content: '根据您的问题，我为您分析如下：\n\n**问题分析**\n这是一个模拟的AI回复内容。\n\n**解决方案**\n- 方案一\n- 方案二\n\n**参考文档**\n[1] 参考文档1\n[2] 参考文档2',
        renderedContent: renderMarkdown('根据您的问题，我为您分析如下：\n\n**问题分析**\n这是一个模拟的AI回复内容。\n\n**解决方案**\n- 方案一\n- 方案二\n\n**参考文档**\n[1] 参考文档1\n[2] 参考文档2'),
        logId: 'log_1',
        score: null,
        comment: '',
        showCommentBox: false,
        isLoading: false,
        answerVersions: ['根据您的问题，我为您分析如下：\n\n**问题分析**\n这是一个模拟的AI回复内容。\n\n**解决方案**\n- 方案一\n- 方案二\n\n**参考文档**\n[1] 参考文档1\n[2] 参考文档2'],
        isTyping: false,
        currentVersionIndex: 0,
        references: []
      }
    ];
  }

  // 停止生成
  async function stopGlobalGeneration() {
    try {
      if (abortController.value && typeof abortController.value.abort === 'function') {
        abortController.value.abort();
      }
    } catch (e) {
      console.error("流式请求中断异常:", e);
    } finally {
      abortController.value = null;
      loading.value = false;
      isGenerating.value = false;
    }
    
    const activeAiMsg = messages.value.find(m => m && m.role === 'ai' && (m.isLoading || m.isTyping));

    if (activeAiMsg) {
      if (activeAiMsg.timerId) {
        clearInterval(activeAiMsg.timerId);
      }
      activeAiMsg.isLoading = false;
      activeAiMsg.isTyping = false;
      activeAiMsg.thinkingText = '已停止回答';
      const abortMark = "> *用户中止生成*";
      activeAiMsg.content = activeAiMsg.content ? `${activeAiMsg.content}\n\n${abortMark}` : abortMark;
      activeAiMsg.renderedContent = renderMarkdown(activeAiMsg.content);
    }
    
    if (currentSessionId.value) {
      try {
        const lastValidMsg = [...messages.value].reverse().find(m => m && m.logId && m !== activeAiMsg);
        if (lastValidMsg) {
          await truncateSessionHistory(currentSessionId.value, lastValidMsg.logId);
        } else {
          await deleteSession(currentSessionId.value);
          currentSessionId.value = null;
          fetchHistory();
        }
      } catch (e) {
        console.error("同步清理后台会话失败:", e);
      }
    }
  }

  // 复制文本
  function copyText(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand('copy');
      console.log("内容已复制");
    } catch (err) {
      console.error("复制失败", err);
    }
    document.body.removeChild(textarea);
  }

  // 切换评分
  async function toggleScore(msg, targetScore) {
    if (msg.score === targetScore) {
      msg.score = null;
      msg.showCommentBox = false;
    } else {
      msg.score = targetScore;
      msg.showCommentBox = true;
    }
    try {
      await submitAiEvaluate({ logId: msg.logId, evaluateScore: msg.score, evaluateComment: msg.comment });
    } catch (error) {
      console.error("评价同步失败", error);
    }
  }

  // 提交反馈
  async function submitComment(msg) {
    if (!msg.logId) return;
    try {
      await submitAiEvaluate({ logId: msg.logId, evaluateScore: msg.score, evaluateComment: msg.comment });
      msg.showCommentBox = false;
      console.log("反馈已提交");
    } catch (error) {
      console.error("提交失败", error);
    }
  }

  // 编辑消息
  function startEdit(msg) {
    msg.isEditing = true;
    msg.tempContent = msg.content;
  }

  // 提交编辑
  async function submitEdit(msg, index) {
    const newQuery = msg.tempContent.trim();
    if (!newQuery) return;
    msg.isEditing = false;
    
    if (newQuery === msg.content) {
      resendQuery(msg, index);
      return;
    }
    
    try {
      if (msg.logId) {
        await truncateSessionHistory(currentSessionId.value, msg.logId);
      }
      messages.value.splice(index + 1);
      msg.content = newQuery;
      const newAiMsg = {
        role: 'ai', content: '', renderedContent: '', isLoading: true, answerVersions: [],
        currentVersionIndex: 0, score: null, comment: '', showCommentBox: false, isTyping: false
      };
      messages.value.push(newAiMsg);
      sendQuery(newAiMsg, msg);
    } catch (e) {
      console.error("请求失败", e);
    }
  }

  // 重新发送
  async function resendQuery(msg, index) {
    try {
      messages.value.splice(index + 2);
      let targetAiMsg = messages.value[index + 1];
      if (!targetAiMsg || targetAiMsg.role !== 'ai') {
        targetAiMsg = {
          role: 'ai', content: '', renderedContent: '', isLoading: true, answerVersions: [],
          currentVersionIndex: 0, score: null, comment: '', showCommentBox: false, isTyping: false
        };
        messages.value.push(targetAiMsg);
      } else {
        targetAiMsg.isLoading = true;
      }
      sendQuery(targetAiMsg, msg);
    } catch (e) {
      console.error("重发失败", e);
    }
  }

  // 发送消息（对外接口）
  async function sendMessage(message) {
    inputQuery.value = message;
    return sendQuery();
  }

  // 发送消息（内部实现）
  async function sendQuery(targetAiMsg = null, targetUserMsg = null) {
    if (targetAiMsg && targetAiMsg instanceof Event) targetAiMsg = null;
    if (loading.value) return;

    const userText = targetUserMsg ? targetUserMsg.content : inputQuery.value;
    const cleanText = userText.trim();
    if (!cleanText) return;
    
    if (isWaitingForCustomName.value) {
      isWaitingForCustomName.value = false;
      inputQuery.value = '';

      const safeName = cleanText.replace(/[\r\n]+/g, '');

      messages.value.push({ role: 'user', content: safeName, showActions: false, isEditing: false });
      const aiMsg = {
        role: 'ai', content: '', renderedContent: '', isLoading: true, answerVersions: [],
        thinkingText: '思考中...', elapsedTime: 0, timerId: null,
        currentVersionIndex: 0, score: null, comment: '', showCommentBox: false, isTyping: false
      };
      messages.value.push(aiMsg);
      aiMsg.timerId = setInterval(() => {
        if (aiMsg.isLoading) aiMsg.elapsedTime++;
        else clearInterval(aiMsg.timerId);
      }, 1000);

      setTimeout(async () => {
        const chartHtml = await getTop10ChartHtml(safeName);
        const aiResponse = `“${safeName}”！这个名字真的是独一无二呢，我很喜欢！<br><br>已经为您记录，感谢您的赐名！活动结束后我会通知您结果哦～<br><br>${chartHtml}`;

        aiMsg.isLoading = false;
        clearInterval(aiMsg.timerId);
        aiMsg.content = aiResponse;
        aiMsg.renderedContent = renderMarkdown(aiResponse);
        aiMsg.answerVersions = [aiResponse];

        saveChatVoteData(safeName);
      }, 2000);
      return;
    }
    
    let aiMsgRef, userMsgRef;

    abortController.value = new AbortController();
    const currentSignal = abortController.value.signal;
    
    if (!targetAiMsg) {
      userMsgRef = { role: 'user', content: userText, showActions: false, isEditing: false };
      messages.value.push(userMsgRef);
      inputQuery.value = '';
      loading.value = true;
      isGenerating.value = true;

      aiMsgRef = {
        role: 'ai', content: '', renderedContent: '', isLoading: true, answerVersions: [],
        thinkingText: '分析问题...', elapsedTime: 0, timerId: null,
        currentVersionIndex: 0, score: null, comment: '', showCommentBox: false, isTyping: false
      };
      messages.value.push(aiMsgRef);

      aiMsgRef.timerId = setInterval(() => {
        if (aiMsgRef.isLoading) aiMsgRef.elapsedTime++;
        else clearInterval(aiMsgRef.timerId);
      }, 1000);

      setTimeout(() => { if (aiMsgRef.isLoading) aiMsgRef.thinkingText = '检索知识库...'; }, 2000);
      setTimeout(() => { if (aiMsgRef.isLoading) aiMsgRef.thinkingText = '正在组织回答...'; }, 5000);

    } else {
      userMsgRef = targetUserMsg;
      aiMsgRef = targetAiMsg;

      aiMsgRef.content = '';
      aiMsgRef.renderedContent = '';
      aiMsgRef.isLoading = true;
      aiMsgRef.isTyping = false;
      aiMsgRef.elapsedTime = 0;
      aiMsgRef.thinkingText = '重新分析...';

      if (aiMsgRef.timerId) clearInterval(aiMsgRef.timerId);

      aiMsgRef.timerId = setInterval(() => {
        if (aiMsgRef.isLoading) aiMsgRef.elapsedTime++;
        else clearInterval(aiMsgRef.timerId);
      }, 1000);

      setTimeout(() => { if (aiMsgRef.isLoading) aiMsgRef.thinkingText = '检索知识库...'; }, 2000);
      setTimeout(() => { if (aiMsgRef.isLoading) aiMsgRef.thinkingText = '正在组织回答...'; }, 5000);

      loading.value = true;
      isGenerating.value = true;
    }

    const payload = {
      query: userText,
      sessionId: currentSessionId.value,
      conversationId: currentConversationId.value,
      interruptEventId: currentInterruptEventId.value,
      agentType: currentAgentType.value === 'default' ? '' : currentAgentType.value,
      signal: currentSignal
    };
    
    let currentVersionContent = '';
    
    try {
      await sendAiQueryStream(
        payload,
        (chunk) => {
          if (currentSignal.aborted) return;
          if (chunk === '') return;
          if (aiMsgRef.isLoading && chunk.length > 0) {
            aiMsgRef.isLoading = false;
            aiMsgRef.isTyping = true;
            clearInterval(aiMsgRef.timerId);
          }
          const realChunk = chunk.replace(/__NEWLINE__/g, '\n');
          currentVersionContent += realChunk;
          aiMsgRef.content = MarkdownRenderer.formatSmartContent(currentVersionContent);
        },
        (finishData) => {
          if (currentSignal.aborted) return;
          loading.value = false;
          isGenerating.value = false;
          aiMsgRef.isLoading = false;
          aiMsgRef.isTyping = false;
          clearInterval(aiMsgRef.timerId);
          if (finishData) {
            if (finishData.logId) { aiMsgRef.logId = finishData.logId; userMsgRef.logId = finishData.logId; }
            if (!currentSessionId.value && finishData.sessionId) currentSessionId.value = finishData.sessionId;
            if (finishData.conversationId) {
              currentConversationId.value = finishData.conversationId;
            }
            if (finishData.references && finishData.references.length > 0) {
              aiMsgRef.references = finishData.references;
            }
            if (finishData.interruptEventId) {
              currentInterruptEventId.value = finishData.interruptEventId;
            } else {
              currentInterruptEventId.value = null;
            }
          }
          if (!aiMsgRef.answerVersions) aiMsgRef.answerVersions = [];
          aiMsgRef.answerVersions.push(aiMsgRef.content);
          aiMsgRef.currentVersionIndex = aiMsgRef.answerVersions.length - 1;
          aiMsgRef.renderedContent = renderMarkdown(aiMsgRef.content);
          fetchHistory();
        },
        (err) => {
          if (currentSignal.aborted) return;
          loading.value = false;
          isGenerating.value = false;
          aiMsgRef.isLoading = false;
          aiMsgRef.isTyping = false;
          clearInterval(aiMsgRef.timerId);
          if (err && err.name === 'AbortError') {
            console.log('用户手动停止了请求');
          } else {
            console.error('SSE 流式请求异常:', err);
            aiMsgRef.content += `\n\n**【网络连接异常，诊断未能完成】**`;
            aiMsgRef.renderedContent = renderMarkdown(aiMsgRef.content);
          }
        },
        (syncRef) => {
          if (currentSignal.aborted) return;
          if (!aiMsgRef.references) {
            aiMsgRef.references = [];
          }
          const isExist = aiMsgRef.references.some(r => String(r.id) === String(syncRef.id));
          if (!isExist) aiMsgRef.references.push(syncRef);
        },
        currentSignal
      );
    } catch (error) {
      if (currentSignal.aborted || (error && error.name === 'AbortError')) {
        return;
      }
      loading.value = false;
      isGenerating.value = false;
      aiMsgRef.isLoading = false;
      aiMsgRef.isTyping = false;
      clearInterval(aiMsgRef.timerId);
      if (error && error.name === 'AbortError') {
        console.log('用户手动停止了请求');
      } else {
        console.error('Payload 序列化或请求发起前异常:', error);
        aiMsgRef.content = `**【请求发送失败】**`;
        aiMsgRef.renderedContent = renderMarkdown(aiMsgRef.content);
      }
    }
  }

  // 切换版本
  function switchVersion(msg, direction) {
    const newIndex = msg.currentVersionIndex + direction;
    if (newIndex >= 0 && newIndex < msg.answerVersions.length) {
      msg.currentVersionIndex = newIndex;
      msg.content = msg.answerVersions[newIndex];
      msg.renderedContent = renderMarkdown(msg.content);
    }
  }

  // 渲染Markdown
  function renderMarkdown(text) {
    return MarkdownRenderer.render(text);
  }

  // 重命名会话
  async function confirmRename(item) {
    if (!item.isRenaming) return;
    item.isRenaming = false;
    const newName = item.tempName.trim();
    if (newName && newName !== item.sessionName) {
      try {
        await updateSessionName(item.sessionId, newName);
        item.sessionName = newName;
        console.log("重命名成功");
      } catch (e) {
        console.error("重命名失败", e);
      }
    }
  }

  // 切换固定状态
  async function togglePin(item) {
    const newPinStatus = item.isPinned === 1 ? 0 : 1;
    try {
      await toggleSessionPin(item.sessionId, newPinStatus);
      item.isPinned = newPinStatus;
      console.log(newPinStatus === 1 ? "已固定" : "已取消固定");
    } catch (e) {
      console.error("操作失败", e);
    }
  }

  // 删除会话
  async function handleDeleteSession(item) {
    try {
      await deleteSession(item.sessionId);
      historyList.value = historyList.value.filter(h => h.sessionId !== item.sessionId);
      if (currentSessionId.value === item.sessionId) {
        startNewChat();
      }
      console.log("删除成功");
    } catch (e) {
      console.error("删除失败", e);
    }
  }

  // 征名投票相关
  async function saveChatVoteData(nameStr) {
    try {
      await submitChatVote({ voteName: nameStr });
    } catch (error) {
      console.error("提交投票信息失败", error);
    }
  }

  async function getTop10ChartHtml(currentChoice) {
    let topNames = [];
    try {
      const res = await getTop10ChatVotes();
      if (res.code === 200 && res.data.length > 0) {
        topNames = res.data.map(item => ({
          name: item.voteName,
          votes: item.votes
        }));
      }
    } catch (e) {
      console.error("获取排行榜失败", e);
    }

    if (topNames.length === 0) {
      topNames = [
        { name: '零一', votes: 120 },
        { name: '星枢', votes: 98 },
        { name: '简一', votes: 85 },
        { name: '塔塔', votes: 76 },
        { name: '曜', votes: 62 },
        { name: 'Kiko', votes: 45 },
        { name: '微光', votes: 38 },
        { name: '引力', votes: 29 },
        { name: '欧米', votes: 15 },
        { name: '知了', votes: 8 }
      ];
    }
    
    const existIndex = topNames.findIndex(item => item.name === currentChoice);
    if (existIndex === -1 && currentChoice) {
      if (topNames.length >= 10) topNames[9] = { name: currentChoice, votes: 1 };
      else topNames.push({ name: currentChoice, votes: 1 });
    }

    let html = `<div class="hot-names-board">`;
    html += `<div class="board-list">`;

    const maxVotes = topNames[0].votes;

    topNames.forEach((item, index) => {
      const percent = (item.votes / maxVotes) * 100;
      const isUserChoice = item.name === currentChoice;
      const highlightClass = isUserChoice ? 'is-highlight' : '';
      const rankClass = index < 3 ? `rank-top${index + 1}` : '';
      let itemHtml = `
        <div class="board-item ${highlightClass}">
          <div class="item-rank ${rankClass}">${index + 1}</div>
          <div class="item-name" title="${item.name}">${item.name}</div>
          <div class="item-bar-wrapper">
            <div class="item-bar" style="width: ${percent}%;"></div>
          </div>
          <div class="item-votes">${item.votes} 票</div>
        </div>
      `.replace(/^\s+/gm, '');

      html += itemHtml;
    });

    html += `</div></div>`;
    return html;
  }

  function openRankingDialog() {
    rankingDialogVisible.value = true;
    showNamingOptions.value = false;
    rankingHtml.value = '';
    getTop10ChartHtml(null).then(html => {
      rankingHtml.value = html;
    });
  }

  function handleSelectName(selection) {
    rankingDialogVisible.value = false;
    showNamingOptions.value = false;
    startNamingCampaign(selection);
  }

  function startNamingCampaign(selection) {
    startNewChat();

    setTimeout(() => {
      if (selection === 'custom') {
        isWaitingForCustomName.value = true;
        messages.value.push({ role: 'user', content: "我想给你取个新名字！", showActions: false, isEditing: false });
        const aiMsg = {
          role: 'ai', content: '', renderedContent: '', isLoading: true, answerVersions: [],
          thinkingText: '思考中...', elapsedTime: 0, timerId: null,
          currentVersionIndex: 0, score: null, comment: '', showCommentBox: false, isTyping: false
        };
        messages.value.push(aiMsg);

        setTimeout(() => {
          const aiResponse = "太好了！你觉得我长得像什么？想给我取个什么名字呢？（可以直接在下方输入框告诉我哦👇）";
          aiMsg.isLoading = false;
          aiMsg.content = aiResponse;
          aiMsg.renderedContent = renderMarkdown(aiResponse);
          aiMsg.answerVersions = [aiResponse];
        }, 1500);

      } else {
        messages.value.push({ role: 'user', content: `我觉得你应该叫"${selection}"，这个名字很适合你。`, showActions: false, isEditing: false });
        const aiMsg = {
          role: 'ai', content: '', renderedContent: '', isLoading: true, answerVersions: [],
          thinkingText: '思考中...', elapsedTime: 0, timerId: null,
          currentVersionIndex: 0, score: null, comment: '', showCommentBox: false, isTyping: false
        };
        messages.value.push(aiMsg);

        setTimeout(async () => {
          const chartHtml = await getTop10ChartHtml(selection);
          const aiResponse = `“${selection}”！听起来非常有科技感和行动力，我很喜欢！<br><br>已经为您记录，感谢您的赐名！活动结束后我会通知您结果哦～<br><br>${chartHtml}`;

          aiMsg.isLoading = false;
          aiMsg.content = aiResponse;
          aiMsg.renderedContent = renderMarkdown(aiResponse);
          aiMsg.answerVersions = [aiResponse];
          saveChatVoteData(selection);
        }, 1500);
      }
    }, 300);
  }

  return {
    // 状态
    messages,
    inputQuery,
    searchQuery,
    loading,
    isGenerating,
    currentAgentType,
    currentSessionId,
    currentConversationId,
    currentInterruptEventId,
    isInputFocused,
    isUserScrolling,
    showScrollBottomBtn,
    lastScrollTop,
    ticking,
    isWaitingForCustomName,
    rankingDialogVisible,
    rankingHtml,
    showNamingOptions,
    presetNames,
    agentTypes,
    historyList,
    
    // 计算属性
    isNewSession,
    dynamicPlaceholder,
    filteredHistoryList,
    
    // 方法
    fetchHistory,
    startNewChat,
    toggleAgent,
    loadHistoryDetail,
    stopGlobalGeneration,
    copyText,
    toggleScore,
    submitComment,
    startEdit,
    submitEdit,
    resendQuery,
    sendQuery,
    sendMessage,
    switchVersion,
    renderMarkdown,
    confirmRename,
    togglePin,
    handleDeleteSession,
    openRankingDialog,
    handleSelectName,
    
    // 工具方法
    setInputFocused: (val) => { isInputFocused.value = val },
    setShowScrollBottomBtn: (val) => { showScrollBottomBtn.value = val },
    setLastScrollTop: (val) => { lastScrollTop.value = val },
    setTicking: (val) => { ticking.value = val },
    setIsUserScrolling: (val) => { isUserScrolling.value = val }
  };
});