'use client'

import React, { useCallback } from 'react'
import { useEditor, EditorContent, BubbleMenu } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import Link from '@tiptap/extension-link'
import Strike from '@tiptap/extension-strike'

import { 
  TwoColumnBlock, 
  ThreeColumnBlock,
  HeaderBlock,
  FooterBlock,
  AddressBlock,
  TemplateVariable 
} from '@/lib/tiptap'
import { 
  IconBold, IconItalic, IconUnderline, IconH1, IconH2, IconList, IconListNumbers, 
  IconAlignCenter, IconAlignLeft, IconAlignRight, IconStrikethrough, IconLink,
  IconAlignJustified
} from '@tabler/icons-react'

const EditorToolbar = ({ editor }: { editor: any }) => {
  if (!editor) {
    return null
  }

  const setLink = useCallback(() => {
    const previousUrl = editor.getAttributes('link').href
    const url = window.prompt('URL', previousUrl)

    if (url === null) return
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
  }, [editor])

  return (
    <BubbleMenu 
        editor={editor} 
        tippyOptions={{ duration: 100 }} 
        className="bg-gray-800 w-[800px] text-white p-2 rounded-lg flex flex-wrap items-center gap-1"
        shouldShow={({ editor, view, state }) => {
            const { selection } = state
            const { empty } = selection

            // don't show bubble menu for custom nodes
            if (editor.isActive('templateVariable') || editor.isActive('twoColumnBlock')) {
              return false
            }

            return view.hasFocus() && !empty
        }}
    >
      {/* Formatting */}
      <button onClick={() => editor.chain().focus().toggleBold().run()} className={`p-2 rounded ${editor.isActive('bold') ? 'bg-gray-600' : 'hover:bg-gray-700'}`}>
        <IconBold size={16} />
      </button>
      <button onClick={() => editor.chain().focus().toggleItalic().run()} className={`p-2 rounded ${editor.isActive('italic') ? 'bg-gray-600' : 'hover:bg-gray-700'}`}>
        <IconItalic size={16} />
      </button>
      <button onClick={() => editor.chain().focus().toggleUnderline().run()} className={`p-2 rounded ${editor.isActive('underline') ? 'bg-gray-600' : 'hover:bg-gray-700'}`}>
        <IconUnderline size={16} />
      </button>
      <button onClick={() => editor.chain().focus().toggleStrike().run()} className={`p-2 rounded ${editor.isActive('strike') ? 'bg-gray-600' : 'hover:bg-gray-700'}`}>
        <IconStrikethrough size={16} />
      </button>
      <button onClick={setLink} className={`p-2 rounded ${editor.isActive('link') ? 'bg-gray-600' : 'hover:bg-gray-700'}`}>
        <IconLink size={16} />
      </button>
      <div className="w-[1px] h-5 bg-gray-500 mx-1" />
      {/* Lists */}
      <button onClick={() => editor.chain().focus().toggleBulletList().run()} className={`p-2 rounded ${editor.isActive('bulletList') ? 'bg-gray-600' : 'hover:bg-gray-700'}`}>
        <IconList size={16} />
      </button>
      <button onClick={() => editor.chain().focus().toggleOrderedList().run()} className={`p-2 rounded ${editor.isActive('orderedList') ? 'bg-gray-600' : 'hover:bg-gray-700'}`}>
        <IconListNumbers size={16} />
      </button>
      <div className="w-[1px] h-5 bg-gray-500 mx-1" />
      {/* Alignment */}
      <button onClick={() => editor.chain().focus().setTextAlign('left').run()} className={`p-2 rounded ${editor.isActive({ textAlign: 'left' }) ? 'bg-gray-600' : 'hover:bg-gray-700'}`}>
        <IconAlignLeft size={16} />
      </button>
      <button onClick={() => editor.chain().focus().setTextAlign('center').run()} className={`p-2 rounded ${editor.isActive({ textAlign: 'center' }) ? 'bg-gray-600' : 'hover:bg-gray-700'}`}>
        <IconAlignCenter size={16} />
      </button>
      <button onClick={() => editor.chain().focus().setTextAlign('right').run()} className={`p-2 rounded ${editor.isActive({ textAlign: 'right' }) ? 'bg-gray-600' : 'hover:bg-gray-700'}`}>
        <IconAlignRight size={16} />
      </button>
      <button onClick={() => editor.chain().focus().setTextAlign('justify').run()} className={`p-2 rounded ${editor.isActive({ textAlign: 'justify' }) ? 'bg-gray-600' : 'hover:bg-gray-700'}`}>
        <IconAlignJustified size={16} />
      </button>
    </BubbleMenu>
  )
}

export const TemplateEditor = ({ onContentChange, onSelectionChange }: { onContentChange: (html: string) => void, onSelectionChange: (node: any) => void }) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Strike,
      Link.configure({
        openOnClick: false,
        autolink: true,
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      TwoColumnBlock,
      ThreeColumnBlock,
      HeaderBlock,
      FooterBlock,
      AddressBlock,
      TemplateVariable,
    ],
    content: '<p>Start building your template!</p>',
    onUpdate: ({ editor }) => {
      onContentChange(editor.getHTML())
    },
    onSelectionUpdate: ({ editor }) => {
      const { from, to } = editor.state.selection
      let selectedNode = null
      editor.state.doc.nodesBetween(from, to, (node, pos) => {
        if (node.type.name === 'templateVariable' || node.type.name === 'twoColumnBlock') {
          selectedNode = { ...node.attrs, type: node.type.name, pos }
        }
      })
      onSelectionChange(selectedNode)
    },
    editorProps: {
      handleDrop: (view, event, slice, moved) => {
        event.preventDefault()
        const blockId = event.dataTransfer?.getData('text/plain')
        const { schema } = view.state
        const coordinates = view.posAtCoords({ left: event.clientX, top: event.clientY })

        if (!coordinates) return false
        
        let newNode = null
        
        switch (blockId) {
          case 'two-column-block':
            newNode = schema.nodes.twoColumnBlock.create(null, [
              schema.nodes.paragraph.create(null, schema.text('Column 1')),
              schema.nodes.paragraph.create(null, schema.text('Column 2')),
            ])
            break
            
          case 'three-column-block':
            newNode = schema.nodes.threeColumnBlock.create(null, [
              schema.nodes.paragraph.create(null, schema.text('Column 1')),
              schema.nodes.paragraph.create(null, schema.text('Column 2')),
              schema.nodes.paragraph.create(null, schema.text('Column 3')),
            ])
            break
            
          case 'header-block':
            newNode = schema.nodes.headerBlock.create(null, [
              schema.nodes.heading.create({ level: 1 }, schema.text('Company Name')),
              schema.nodes.paragraph.create(null, schema.text('Document Header Section')),
            ])
            break
            
          case 'footer-block':
            newNode = schema.nodes.footerBlock.create(null, [
              schema.nodes.paragraph.create(null, schema.text('Terms and Conditions')),
              schema.nodes.paragraph.create(null, schema.text('Contact Information')),
            ])
            break
            
          case 'address-block':
            newNode = schema.nodes.addressBlock.create({ type: 'billing' })
            break
            
          case 'heading-block':
            newNode = schema.nodes.heading.create({ level: 2 }, schema.text('Enter your heading'))
            break
            
          case 'paragraph-block':
            newNode = schema.nodes.paragraph.create(null, schema.text('Enter your paragraph text here...'))
            break
            
          case 'quote-block':
            newNode = schema.nodes.blockquote.create(null, [
              schema.nodes.paragraph.create(null, schema.text('This is a quote block'))
            ])
            break
            
          case 'divider-block':
            newNode = schema.nodes.horizontalRule.create()
            break
            
          case 'table-block':
            // Create a simple 3x3 table
            const tableRows = []
            for (let i = 0; i < 3; i++) {
              const cells = []
              for (let j = 0; j < 3; j++) {
                cells.push(schema.nodes.tableCell.create(null, [
                  schema.nodes.paragraph.create(null, schema.text(`Cell ${i + 1},${j + 1}`))
                ]))
              }
              tableRows.push(schema.nodes.tableRow.create(null, cells))
            }
            newNode = schema.nodes.table.create(null, tableRows)
            break
            
          case 'list-block':
            newNode = schema.nodes.bulletList.create(null, [
              schema.nodes.listItem.create(null, [
                schema.nodes.paragraph.create(null, schema.text('List item 1'))
              ]),
              schema.nodes.listItem.create(null, [
                schema.nodes.paragraph.create(null, schema.text('List item 2'))
              ]),
              schema.nodes.listItem.create(null, [
                schema.nodes.paragraph.create(null, schema.text('List item 3'))
              ])
            ])
            break
            
          case 'numbered-list-block':
            newNode = schema.nodes.orderedList.create(null, [
              schema.nodes.listItem.create(null, [
                schema.nodes.paragraph.create(null, schema.text('Numbered item 1'))
              ]),
              schema.nodes.listItem.create(null, [
                schema.nodes.paragraph.create(null, schema.text('Numbered item 2'))
              ]),
              schema.nodes.listItem.create(null, [
                schema.nodes.paragraph.create(null, schema.text('Numbered item 3'))
              ])
            ])
            break
            
          case 'template-variable':
            const key = prompt('Enter the template variable key (e.g., invoiceNumber):')
            if (key) {
              newNode = schema.nodes.templateVariable.create({ key })
            }
            break
            
          case 'date-variable':
            newNode = schema.nodes.templateVariable.create({ key: 'currentDate' })
            break
            
          case 'signature-block':
            newNode = schema.nodes.templateVariable.create({ key: 'signature' })
            break
            
          case 'invoice-items':
            // Create a predefined invoice table structure
            const invoiceHeaders = [
              schema.nodes.tableCell.create(null, [
                schema.nodes.paragraph.create(null, schema.text('Description'))
              ]),
              schema.nodes.tableCell.create(null, [
                schema.nodes.paragraph.create(null, schema.text('Quantity'))
              ]),
              schema.nodes.tableCell.create(null, [
                schema.nodes.paragraph.create(null, schema.text('Unit Price'))
              ]),
              schema.nodes.tableCell.create(null, [
                schema.nodes.paragraph.create(null, schema.text('Total'))
              ])
            ]
            const invoiceHeaderRow = schema.nodes.tableRow.create(null, invoiceHeaders)
            
            const invoiceDataCells = [
              schema.nodes.tableCell.create(null, [
                schema.nodes.paragraph.create(null, schema.text('{{item.description}}'))
              ]),
              schema.nodes.tableCell.create(null, [
                schema.nodes.paragraph.create(null, schema.text('{{item.quantity}}'))
              ]),
              schema.nodes.tableCell.create(null, [
                schema.nodes.paragraph.create(null, schema.text('{{item.unitPrice}}'))
              ]),
              schema.nodes.tableCell.create(null, [
                schema.nodes.paragraph.create(null, schema.text('{{item.total}}'))
              ])
            ]
            const invoiceDataRow = schema.nodes.tableRow.create(null, invoiceDataCells)
            
            newNode = schema.nodes.table.create(null, [invoiceHeaderRow, invoiceDataRow])
            break
            
          case 'barcode-block':
            newNode = schema.nodes.templateVariable.create({ key: 'barcode' })
            break
            
          default:
            return false
        }
        
        if (newNode) {
          const transaction = view.state.tr.insert(coordinates.pos, newNode)
          view.dispatch(transaction)
          return true
        }
        
        return false
      },
    },
  })

  return (
    <div className="flex flex-col flex-1">
      {editor && <EditorToolbar editor={editor} />}
      <div 
        className="flex-1 bg-white border-2 border-dashed border-gray-200 m-4 rounded-lg relative overflow-hidden"
        onDragOver={(e) => {
          e.preventDefault()
          e.currentTarget.classList.add('border-blue-400', 'bg-blue-50')
        }}
        onDragLeave={(e) => {
          e.preventDefault()
          e.currentTarget.classList.remove('border-blue-400', 'bg-blue-50')
        }}
        onDrop={(e) => {
          e.currentTarget.classList.remove('border-blue-400', 'bg-blue-50')
        }}
      >
        <EditorContent 
          editor={editor} 
          className="p-6 h-full overflow-y-auto prose prose-lg max-w-none focus:outline-none"
          style={{
            minHeight: '500px'
          }}
        />
        {!editor?.getHTML().includes('<p>') || editor?.getHTML() === '<p></p>' ? (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center text-gray-400">
              <div className="text-xl mb-2">📄</div>
              <div className="text-lg font-medium mb-1">Start building your template</div>
              <div className="text-sm">Drag blocks from the sidebar or start typing</div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
} 