'use client'

import React from 'react'
import { NodeViewWrapper, NodeViewProps } from '@tiptap/react'

export const TemplateVariableComponent: React.FC<NodeViewProps> = ({ node }) => {
  const key = node.attrs.key || ''
  
  return (
    <NodeViewWrapper
      as="span"
      className="inline-block bg-blue-200 text-blue-800 px-2 py-1 rounded-md cursor-pointer text-sm font-mono"
      data-key={key}
      data-type="template-variable"
    >
      {`{{${key}}}`}
    </NodeViewWrapper>
  )
} 