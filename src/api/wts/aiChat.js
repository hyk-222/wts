import request from '@/utils/request';
import { streamRequest } from '@/utils/streamRequest';
import { getToken } from '@/utils/auth';

// 发送聊天请求 (旧版非流式，可保留备用)
export function sendAiQuery(data) {
  return request({ 
    url: '/wts/chat/wtsAIQuery', 
    method: 'post', 
    data: data,
    timeout: 120000 
  })
}

/**
 * 原生 Fetch 解析 SSE 流式请求，支持拦截自定义事件 (ref_sync / finish)
 */
export async function sendAiQueryStream(data, onMessage, onFinish, onError, onRefSync) {
  const { signal, ...requestData } = data; 
  try {
    const response = await fetch(import.meta.env.VITE_APP_BASE_API + '/wts/chat/wtsAIQueryStream', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + getToken() 
      },
      body: JSON.stringify(requestData),
      signal: signal
    });

    if (!response.ok) {
      throw new Error(`HTTP 连接失败: ${response.status}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let buffer = '';
    
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      buffer += decoder.decode(value, { stream: true });
      const blocks = buffer.split('\n\n');
      buffer = blocks.pop();
      
      for (const block of blocks) {
        if (!block.trim()) continue;
        let eventType = 'message';
        let eventData = '';
        
        const lines = block.split('\n');
        for (const line of lines) {
          if (line.startsWith('event:')) {
            eventType = line.substring(6).trim();
          } else if (line.startsWith('data:')) {
            eventData = line.substring(5).trim();
          }
        }
        
        if (eventType === 'ref_sync') {
          if (typeof onRefSync === 'function') {
            try {
              onRefSync(JSON.parse(eventData));
            } catch (e) {
              console.error("解析 ref_sync 失败", e);
            }
          }
        } else if (eventType === 'finish') {
          if (typeof onFinish === 'function') {
            try {
              onFinish(JSON.parse(eventData));
            } catch (e) {
              console.error("解析 finish 失败", e);
            }
          }
        } else {
          if (eventData !== '[DONE]' && typeof onMessage === 'function') {
            let chunk = eventData;
            try {
              if (chunk.startsWith('"') && chunk.endsWith('"')) {
                chunk = JSON.parse(chunk);
              }
            } catch (e) {}
            onMessage(chunk);
          }
        }
      }
    }
  } catch (error) {
    if (error.name === 'AbortError') {
      console.log('请求已被用户主动取消');
    } else {
      if (typeof onError === 'function') {
        onError(error);
      }
    }
  }
}

// 提交评价
export function submitAiEvaluate(data) {
  return request({ url: '/wts/chat/evaluate', method: 'post', data: data })
}

// 获取左侧会话列表
export function getSessionList(query) {
  return request({ url: '/wts/chat/sessionList', method: 'get', params: query })
}

// 获取某个会话下的全部历史气泡
export function getSessionDetail(sessionId) {
  return request({ url: '/wts/chat/session/' + sessionId, method: 'get' })
}

// 重命名会话
export function updateSessionName(sessionId, sessionName) {
  return request({ 
    url: '/wts/chat/session/' + sessionId + '/rename', 
    method: 'put', 
    params: { sessionName: sessionName } 
  })
}

// 切换会话置顶状态
export function toggleSessionPin(sessionId, isPinned) {
  return request({ 
    url: '/wts/chat/session/' + sessionId + '/pin', 
    method: 'put', 
    params: { isPinned: isPinned } 
  })
}

// 删除整个会话
export function deleteSession(sessionId) {
  return request({ 
    url: '/wts/chat/session/' + sessionId, 
    method: 'delete' 
  })
}

// 截断历史会话
export function truncateSessionHistory(sessionId, logId) {
  return request({ 
    url: '/wts/chat/session/' + sessionId + '/after/' + logId, 
    method: 'delete' 
  })
}

// 提交征名投票
export function submitChatVote(data) {
  return request({
    url: '/wts/chat/vote/submit',
    method: 'post',
    data: data
  })
}

// 获取排行榜 Top 10
export function getTop10ChatVotes() {
  return request({
    url: '/wts/chat/vote/top10',
    method: 'get'
  })
}