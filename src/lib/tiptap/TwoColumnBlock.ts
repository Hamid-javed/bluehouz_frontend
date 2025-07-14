import { Node, mergeAttributes } from '@tiptap/core'
import { Node as ProseMirrorNode } from 'prosemirror-model'

export const TwoColumnBlock = Node.create({
  name: 'twoColumnBlock',
  group: 'block',
  content: 'block block',
  defining: true,
  isolating: true,

  parseHTML() {
    return [{ tag: 'div[data-type="two-column-block"]' }]
  },

  renderHTML({ HTMLAttributes }) {
    // The '0's are holes that represent where the content of the two 'block' content slots will be rendered.
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'two-column-block', class: 'flex gap-4' }), 
      ['div', { class: 'flex-1 min-w-0' }, 0], 
      ['div', { class: 'flex-1 min-w-0' }, 0]
    ]
  },
})

export default TwoColumnBlock 