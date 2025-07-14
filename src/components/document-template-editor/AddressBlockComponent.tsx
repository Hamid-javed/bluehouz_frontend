'use client'

import React from 'react'
import { NodeViewWrapper, NodeViewProps } from '@tiptap/react'
import  FaAddressCard  from 'react-icons/fa'

export const AddressBlockComponent: React.FC<NodeViewProps> = ({ node, updateAttributes }) => {
  const addressType = node.attrs.type || 'billing'
  
  const handleTypeChange = (newType: string) => {
    updateAttributes({ type: newType })
  }
  
  return (
    <NodeViewWrapper
      as="div"
      className="address-block border-l-4 border-blue-500 pl-4 py-3 my-2 bg-blue-50 rounded-r-lg"
      data-type="address-block"
    >
      <div className="flex items-center gap-2 mb-2">
        <FaAddressCard className="text-blue-600" />
        <select 
          value={addressType}
          onChange={(e) => handleTypeChange(e.target.value)}
          className="bg-white border border-gray-300 rounded px-2 py-1 text-sm font-medium"
        >
          <option value="billing">Billing Address</option>
          <option value="shipping">Shipping Address</option>
          <option value="company">Company Address</option>
        </select>
      </div>
      
      <div className="text-sm text-gray-700 space-y-1">
        <div className="font-semibold">{'{{' + `${addressType}Address.name` + '}}'}</div>
        <div>{'{{' + `${addressType}Address.street` + '}}'}</div>
        <div>
          {'{{' + `${addressType}Address.city` + '}}'}, {'{{' + `${addressType}Address.state` + '}}'} {'{{' + `${addressType}Address.zip` + '}}'}
        </div>
        <div>{'{{' + `${addressType}Address.country` + '}}'}</div>
      </div>
    </NodeViewWrapper>
  )
}
