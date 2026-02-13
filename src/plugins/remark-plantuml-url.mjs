/**
 * Remark PlantUML URL Plugin
 *
 * Transforms PlantUML code blocks in Markdown to HTML containers
 * with image and source code toggle functionality.
 */

import { visit } from 'unist-util-visit';
import { generatePlantUMLUrl, wrapPlantUMLCode } from './plantuml-encoder.mjs';

/**
 * Escapes HTML special characters
 * @param {string} str - The string to escape
 * @returns {string} - Escaped string
 */
function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Creates the HTML structure for a PlantUML diagram
 * @param {string} code - The PlantUML source code
 * @param {string} imageUrl - The generated PlantUML server URL
 * @returns {string} - HTML string
 */
function createPlantUMLHtml(code, imageUrl) {
  const escapedCode = escapeHtml(code);
  // Base64 encode the source code to preserve it safely
  const base64Code = Buffer.from(code, 'utf-8').toString('base64');

  // Image wrapper with floating toggle button (no border)
  // Store source code in a data attribute for JS to create code block dynamically
  return `<div class="plantuml-container" data-state="image" data-plantuml-source="${base64Code}">
  <div class="plantuml-image-wrapper">
    <img class="plantuml-image" src="${imageUrl}" alt="PlantUML Diagram" loading="lazy" />
    <button class="plantuml-toggle-to-code" type="button" title="查看源码">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>
    </button>
  </div>
  <div class="plantuml-code-placeholder"></div>
</div>`;
}

/**
 * Remark plugin to transform PlantUML code blocks to HTML with image/source toggle
 * @param {Object} options - Plugin options
 * @param {string} [options.server='https://www.plantuml.com/plantuml'] - PlantUML server URL
 * @param {'svg'|'png'} [options.format='svg'] - Output format
 * @returns {Function} - Transformer function
 */
export default function remarkPlantUMLUrl(options = {}) {
  const server = options.server || 'https://www.plantuml.com/plantuml';
  const format = options.format || 'svg';

  return function transformer(tree) {
    visit(tree, 'code', (node, index, parent) => {
      // Check if this is a plantuml code block
      if (node.lang !== 'plantuml') {
        return;
      }

      const code = node.value;
      const wrappedCode = wrapPlantUMLCode(code);
      const imageUrl = generatePlantUMLUrl(code, { server, format });
      const html = createPlantUMLHtml(wrappedCode, imageUrl);

      // Replace the code node with an HTML node
      const htmlNode = {
        type: 'html',
        value: html
      };

      parent.children.splice(index, 1, htmlNode);
    });
  };
}
