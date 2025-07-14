'use client'

import React from 'react'
import { 
  FaColumns, 
  FaRegCommentDots, 
  FaHeading, 
  // FaImage, 
  FaTable, 
  FaListUl, 
  FaListOl, 
  FaQuoteLeft, 
  // FaSeparator,
  FaRegFileAlt,
  FaSignature,
  FaCalendarAlt,
  FaBarcode,
  FaAddressCard,
  FaChartBar
} from 'react-icons/fa'

interface DraggableBlockProps {
  id: string
  label: string
  icon: React.ReactNode
  description?: string
  category: string
}

export const DraggableBlock: React.FC<DraggableBlockProps> = ({ id, label, icon, description, category }) => {
  const handleDragStart = (event: React.DragEvent<HTMLDivElement>) => {
    event.dataTransfer.setData('text/plain', id)
    event.dataTransfer.effectAllowed = 'copy'
    
    // Add visual feedback
    event.currentTarget.classList.add('opacity-50')
    setTimeout(() => {
      event.currentTarget.classList.remove('opacity-50')
    }, 100)
  }

  const handleDragEnd = (event: React.DragEvent<HTMLDivElement>) => {
    event.currentTarget.classList.remove('opacity-50')
  }

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      className="group p-3 border rounded-lg mb-2 bg-white cursor-move flex items-center gap-3 hover:border-blue-300 hover:shadow-md transition-all duration-200"
      title={description}
    >
      <div className="text-blue-600 group-hover:text-blue-700">
        {icon}
      </div>
      <div className="flex-1">
        <div className="font-medium text-sm text-gray-800">{label}</div>
        {description && (
          <div className="text-xs text-gray-500 mt-1">{description}</div>
        )}
      </div>
    </div>
  )
}

const BLOCK_CATEGORIES = [
  {
    name: 'Layout',
    blocks: [
      { 
        id: 'two-column-block', 
        label: 'Two Columns', 
        icon: <FaColumns size={16} />, 
        description: 'Split content into two equal columns',
        category: 'layout'
      },
      { 
        id: 'three-column-block', 
        label: 'Three Columns', 
        icon: <FaColumns size={16} />, 
        description: 'Split content into three equal columns',
        category: 'layout'
      },
      { 
        id: 'header-block', 
        label: 'Header Section', 
        icon: <FaRegFileAlt size={16} />, 
        description: 'Document header with logo and info',
        category: 'layout'
      },
      { 
        id: 'footer-block', 
        label: 'Footer Section', 
        icon: <FaRegFileAlt size={16} />, 
        description: 'Document footer with terms and contact',
        category: 'layout'
      },
    ]
  },
  {
    name: 'Content',
    blocks: [
      { 
        id: 'heading-block', 
        label: 'Heading', 
        icon: <FaHeading size={16} />, 
        description: 'Large heading text',
        category: 'content'
      },
      { 
        id: 'paragraph-block', 
        label: 'Paragraph', 
        icon: <FaRegFileAlt size={16} />, 
        description: 'Regular paragraph text',
        category: 'content'
      },
      { 
        id: 'quote-block', 
        label: 'Quote', 
        icon: <FaQuoteLeft size={16} />, 
        description: 'Blockquote for emphasis',
        category: 'content'
      },
      // { 
      //   id: 'divider-block', 
      //   label: 'Divider', 
      //   icon: <FaSeparator size={16} />, 
      //   description: 'Horizontal line separator',
      //   category: 'content'
      // },
    ]
  },
  {
    name: 'Data',
    blocks: [
      { 
        id: 'table-block', 
        label: 'Table', 
        icon: <FaTable size={16} />, 
        description: 'Data table with rows and columns',
        category: 'data'
      },
      { 
        id: 'list-block', 
        label: 'Bullet List', 
        icon: <FaListUl size={16} />, 
        description: 'Unordered list with bullet points',
        category: 'data'
      },
      { 
        id: 'numbered-list-block', 
        label: 'Numbered List', 
        icon: <FaListOl size={16} />, 
        description: 'Ordered list with numbers',
        category: 'data'
      },
      { 
        id: 'chart-block', 
        label: 'Chart', 
        icon: <FaChartBar size={16} />, 
        description: 'Data visualization chart',
        category: 'data'
      },
    ]
  },
  {
    name: 'Variables',
    blocks: [
      { 
        id: 'template-variable', 
        label: 'Template Variable', 
        icon: <FaRegCommentDots size={16} />, 
        description: 'Dynamic content placeholder',
        category: 'variables'
      },
      { 
        id: 'date-variable', 
        label: 'Date Variable', 
        icon: <FaCalendarAlt size={16} />, 
        description: 'Current date placeholder',
        category: 'variables'
      },
      { 
        id: 'signature-block', 
        label: 'Signature', 
        icon: <FaSignature size={16} />, 
        description: 'Digital signature placeholder',
        category: 'variables'
      },
    ]
  },
  {
    name: 'Business',
    blocks: [
      { 
        id: 'address-block', 
        label: 'Address Block', 
        icon: <FaAddressCard size={16} />, 
        description: 'Formatted address section',
        category: 'business'
      },
      { 
        id: 'invoice-items', 
        label: 'Invoice Items', 
        icon: <FaTable size={16} />, 
        description: 'Invoice line items table',
        category: 'business'
      },
      { 
        id: 'barcode-block', 
        label: 'Barcode', 
        icon: <FaBarcode size={16} />, 
        description: 'Barcode or QR code placeholder',
        category: 'business'
      },
    ]
  },
]

export const BlockSidebar = () => {
  return (
    <div className="w-72 p-4 border-r bg-gray-50 h-full overflow-y-auto">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Design Blocks</h3>
        <p className="text-sm text-gray-600">Drag and drop blocks into your template</p>
      </div>
      
      {BLOCK_CATEGORIES.map((category) => (
        <div key={category.name} className="mb-6">
          <h4 className="text-sm font-medium text-gray-700 mb-3 uppercase tracking-wide">
            {category.name}
          </h4>
          <div className="space-y-2">
            {category.blocks.map((block) => (
              <DraggableBlock
                key={block.id}
                id={block.id}
                label={block.label}
                icon={block.icon}
                description={block.description}
                category={block.category}
              />
            ))}
          </div>
        </div>
      ))}
      
      <div className="mt-8 p-3 bg-blue-50 rounded-lg border border-blue-200">
        <div className="text-sm text-blue-800">
          <strong>💡 Tip:</strong> Drag blocks into the editor to add them to your template. You can customize each block after adding it.
        </div>
      </div>
    </div>
  )
}
