import { Node, mergeAttributes } from '@tiptap/core'

export const HeaderBlock = Node.create({
  name: 'headerBlock',
  group: 'block',
  content: 'block*',
  defining: true,
  isolating: true,

  parseHTML() {
    return [{ tag: 'header[data-type="header-block"]' }]
  },

  renderHTML({ HTMLAttributes }) {
    return ['header', mergeAttributes(HTMLAttributes, { 
      'data-type': 'header-block',
      class: 'border-b-2 border-gray-300 pb-4 mb-6 flex justify-between items-center'
    }), 0]
  },
})

export default HeaderBlock
