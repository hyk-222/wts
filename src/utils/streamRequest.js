/**
 * SSE 流式请求封装
 * 支持标准 SSE 格式和自定义事件解析
 */

import { getToken } from './auth';

/**
 * 使用 EventSource 进行 SSE 流式请求
 * @param {Object} options - 请求配置
 * @param {string} options.url - 请求地址
 * @param {Object} options.data - 请求体数据
 * @param {Function} options.onMessage - 消息回调
 * @param {Function} options.onError - 错误回调
 * @param {Function} options.onClose - 关闭回调
 * @returns {EventSource} - EventSource 实例
 */
export function createEventSource(options) {
  const { url, data, onMessage, onError, onClose } = options;
  
  const params = new URLSearchParams();
  Object.keys(data).forEach(key => {
    params.append(key, data[key]);
  });
  
  const fullUrl = url + '?' + params.toString();
  
  const eventSource = new EventSource(fullUrl, {
    headers: {
      'Authorization': 'Bearer ' + getToken()
    }
  });
  
  eventSource.onmessage = (event) => {
    if (typeof onMessage === 'function') {
      try {
        const data = JSON.parse(event.data);
        onMessage(data);
      } catch (e) {
        onMessage(event.data);
      }
    }
  };
  
  eventSource.onerror = (error) => {
    if (typeof onError === 'function') {
      onError(error);
    }
    eventSource.close();
  };
  
  eventSource.onclose = () => {
    if (typeof onClose === 'function') {
      onClose();
    }
  };
  
  return eventSource;
}

/**
 * 使用原生 fetch + ReadableStream 进行流式请求
 * 兼容更多场景，支持自定义事件类型
 */
export async function streamRequest(options) {
  const { url, data, onMessage, onError, onClose, signal } = options;
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + getToken()
      },
      body: JSON.stringify(data),
      signal: signal
    });
    
    if (!response.ok) {
      throw new Error(`HTTP 错误: ${response.status}`);
    }
    
    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let buffer = '';
    
    while (true) {
      const { done, value } = await reader.read();
      
      if (done) {
        if (typeof onClose === 'function') {
          onClose();
        }
        break;
      }
      
      buffer += decoder.decode(value, { stream: true });
      
      // 按换行符分割数据
      const lines = buffer.split('\n');
      buffer = lines.pop(); // 保留最后一行可能不完整的数据
      
      for (const line of lines) {
        if (line.trim()) {
          try {
            const data = JSON.parse(line);
            if (typeof onMessage === 'function') {
              onMessage(data);
            }
          } catch (e) {
            // 如果不是 JSON，直接传递原始数据
            if (typeof onMessage === 'function') {
              onMessage(line);
            }
          }
        }
      }
    }
  } catch (error) {
    if (error.name !== 'AbortError') {
      if (typeof onError === 'function') {
        onError(error);
      }
    }
  }
}

export default {
  createEventSource,
  streamRequest
};