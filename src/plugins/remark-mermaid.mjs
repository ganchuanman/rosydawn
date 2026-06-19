import { visit } from 'unist-util-visit';

function encodeSource(source) {
  return Buffer.from(source, 'utf-8').toString('base64');
}

export default function remarkMermaid() {
  return (tree) => {
    visit(tree, 'code', (node) => {
      const lang = (node.lang || '').toLowerCase();
      if (lang !== 'mermaid' && lang !== 'mmd') {
        return;
      }

      node.type = 'html';
      node.value = `<div class="mermaid-diagram" data-mermaid-source="${encodeSource(node.value || '')}">
  <div class="mermaid-loading">渲染图表中...</div>
</div>`;
    });
  };
}
