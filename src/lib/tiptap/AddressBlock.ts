import { Node, mergeAttributes } from '@tiptap/core'
import { ReactNodeViewRenderer } from '@tiptap/react'
import { AddressBlockComponent } from '@/components/document-template-editor/AddressBlockComponent'

export const AddressBlock = Node.create({
  name: 'addressBlock',
  group: 'block',
  atom: true,

  addAttributes() {
    return {
      type: {
        default: 'billing',
        parseHTML: element => element.getAttribute('data-address-type'),
        renderHTML: attributes => ({ 'data-address-type': attributes.type }),
      },
    }
  },

  parseHTML() {
    return [{ tag: 'div[data-type="address-block"]' }]
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 
      'data-type': 'address-block',
      class: 'address-block border-l-4 border-blue-500 pl-4 py-2'
    }), `
      <div class="font-semibold text-gray-800 mb-2">{{${HTMLAttributes['data-address-type'] || 'billing'}Address.name}}</div>
      <div class="text-gray-600">
        <div>{{${HTMLAttributes['data-address-type'] || 'billing'}Address.street}}</div>
        <div>{{${HTMLAttributes['data-address-type'] || 'billing'}Address.city}}, {{${HTMLAttributes['data-address-type'] || 'billing'}Address.state}} {{${HTMLAttributes['data-address-type'] || 'billing'}Address.zip}}</div>
        <div>{{${HTMLAttributes['data-address-type'] || 'billing'}Address.country}}</div>
      </div>
    `]
  },

  addNodeView() {
    return ReactNodeViewRenderer(AddressBlockComponent)
  },
})

export default AddressBlock
