import { Node, mergeAttributes } from '@tiptap/core'

export const FooterBlock = Node.create({
  name: 'footerBlock',
  group: 'block',
  content: 'block*',
  defining: true,
  isolating: true,

  parseHTML() {
    return [{ tag: 'footer[data-type="footer-block"]' }]
  },

  renderHTML({ HTMLAttributes }) {
    return ['footer', mergeAttributes(HTMLAttributes, { 
      'data-type': 'footer-block',
      class: 'border-t-2 border-gray-300 pt-4 mt-6 text-sm text-gray-600'
    }), 0]
  },
})

export default FooterBlock
