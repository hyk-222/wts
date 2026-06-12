import MarkdownIt from 'markdown-it';
import hljs from 'highlight.js';

const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  highlight: function(str, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return hljs.highlight(str, { language: lang }).value;
      } catch (__) {}
    }
    return '';
  }
});

export const MarkdownRenderer = {
  render(text) {
    if (!text) return '';
    return md.render(text);
  },
  
  formatSmartContent(text) {
    if (!text) return '';
    let formatted = text;
    
    formatted = formatted.replace(/```(\w+)?\n/g, '<pre class="code-block-wrapper"><code class="language-$1">');
    formatted = formatted.replace(/```/g, '</code></pre>');
    
    formatted = formatted.replace(/\[(\d+)\]/g, '<span class="citation-badge" data-ref="$1">[$1]</span>');
    
    return formatted;
  },
  
  escapeHtml(text) {
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
  }
};

export default MarkdownRenderer;