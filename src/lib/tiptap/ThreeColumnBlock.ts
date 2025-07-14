import { Node, mergeAttributes } from '@tiptap/core'

export const ThreeColumnBlock = Node.create({
  name: 'threeColumnBlock',
  group: 'block',
  content: 'block block block',
  defining: true,
  isolating: true,

  parseHTML() {
    return [{ tag: 'div[data-type="three-column-block"]' }]
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 
      'data-type': 'three-column-block', 
      class: 'flex gap-4' 
    }), 
      ['div', { class: 'flex-1 min-w-0' }, 0], 
      ['div', { class: 'flex-1 min-w-0' }, 0],
      ['div', { class: 'flex-1 min-w-0' }, 0]
    ]
  },
})

export default ThreeColumnBlock
