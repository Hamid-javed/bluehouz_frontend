import { Node, mergeAttributes } from '@tiptap/core'
import { ReactNodeViewRenderer } from '@tiptap/react'
import { TemplateVariableComponent } from '@/components/document-template-editor/TemplateVariableComponent'

export const TemplateVariable = Node.create({
  name: 'templateVariable',
  group: 'inline',
  inline: true,
  atom: true,

  addAttributes() {
    return {
      key: {
        default: null,
        parseHTML: element => element.getAttribute('data-key'),
        renderHTML: attributes => ({ 'data-key': attributes.key }),
      },
    }
  },

  parseHTML() {
    return [{ tag: 'span[data-type="template-variable"]' }]
  },

  renderHTML({ HTMLAttributes }) {
    // This renders the Handlebars-style variable in the final HTML output
    return ['span', mergeAttributes(HTMLAttributes), `{{${HTMLAttributes.key}}}`]
  },

  addNodeView() {
    // This renders a React component in the editor UI for a better user experience
    return ReactNodeViewRenderer(TemplateVariableComponent)
  },
})

export default TemplateVariable 