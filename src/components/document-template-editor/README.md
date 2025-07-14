# Document Template Editor

A powerful, drag-and-drop document template editor built with TipTap and React. This component allows users to create professional document templates with various design blocks and template variables.

## Features

### 🎨 Rich Block Library
- **Layout Blocks**: Two-column, three-column, header, and footer sections
- **Content Blocks**: Headings, paragraphs, quotes, and dividers
- **Data Blocks**: Tables, lists, and charts
- **Variable Blocks**: Template variables, date variables, and signatures
- **Business Blocks**: Address blocks, invoice items, and barcodes

### 🚀 Drag & Drop Interface
- Intuitive sidebar with categorized blocks
- Visual feedback during drag operations
- Easy block placement in the editor
- Smart drop zone detection

### ✨ Advanced Editor Features
- Rich text formatting toolbar (bold, italic, underline, etc.)
- Text alignment controls
- Link insertion and management
- List creation (bullet and numbered)
- Real-time content preview

### 🔧 Template Variables
- Dynamic content placeholders
- Customizable variable keys
- Handlebars-style syntax (`{{variableName}}`)
- Pre-built business variables

## Components

### BlockSidebar
The draggable block sidebar containing all available design elements.

```tsx
import { BlockSidebar } from '@/components/document-template-editor/BlockSidebar'

<BlockSidebar />
```

### TemplateEditor
The main editor component with TipTap integration.

```tsx
import { TemplateEditor } from '@/components/document-template-editor/TemplateEditor'

<TemplateEditor 
  onContentChange={(html) => setContent(html)}
  onSelectionChange={(node) => setSelectedNode(node)}
/>
```

### TemplateVariableComponent
React component for rendering template variables in the editor.

```tsx
import { TemplateVariableComponent } from '@/components/document-template-editor/TemplateVariableComponent'
```

### AddressBlockComponent
Specialized component for address blocks with type selection.

```tsx
import { AddressBlockComponent } from '@/components/document-template-editor/AddressBlockComponent'
```

## TipTap Extensions

### Core Extensions
- **TwoColumnBlock**: Creates a two-column layout
- **ThreeColumnBlock**: Creates a three-column layout
- **HeaderBlock**: Document header section
- **FooterBlock**: Document footer section
- **AddressBlock**: Formatted address with type selection
- **TemplateVariable**: Dynamic content variables

### Usage Example

```tsx
import { useEditor } from '@tiptap/react'
import { 
  TwoColumnBlock, 
  ThreeColumnBlock,
  HeaderBlock,
  FooterBlock,
  AddressBlock,
  TemplateVariable 
} from '@/lib/tiptap'

const editor = useEditor({
  extensions: [
    StarterKit,
    TwoColumnBlock,
    ThreeColumnBlock,
    HeaderBlock,
    FooterBlock,
    AddressBlock,
    TemplateVariable,
  ],
})
```

## Block Types

### Layout Blocks

#### Two Column Block
```html
<div data-type="two-column-block" class="flex gap-4">
  <div class="flex-1 min-w-0">Column 1</div>
  <div class="flex-1 min-w-0">Column 2</div>
</div>
```

#### Three Column Block
```html
<div data-type="three-column-block" class="flex gap-4">
  <div class="flex-1 min-w-0">Column 1</div>
  <div class="flex-1 min-w-0">Column 2</div>
  <div class="flex-1 min-w-0">Column 3</div>
</div>
```

#### Header Block
```html
<header data-type="header-block" class="border-b-2 border-gray-300 pb-4 mb-6">
  Header content
</header>
```

#### Footer Block
```html
<footer data-type="footer-block" class="border-t-2 border-gray-300 pt-4 mt-6">
  Footer content
</footer>
```

### Variable Blocks

#### Template Variable
```html
<span data-type="template-variable" data-key="variableName">
  {{variableName}}
</span>
```

#### Address Block
```html
<div data-type="address-block" data-address-type="billing">
  <div>{{billingAddress.name}}</div>
  <div>{{billingAddress.street}}</div>
  <div>{{billingAddress.city}}, {{billingAddress.state}} {{billingAddress.zip}}</div>
  <div>{{billingAddress.country}}</div>
</div>
```

## Styling

The editor includes comprehensive CSS styles for:
- Block visual feedback
- Drag and drop animations
- Responsive layouts
- Professional typography
- Hover effects and transitions

Import the styles in your component:
```tsx
import '@/styles/document-template-editor.css'
```

## Usage Example

```tsx
'use client'

import React, { useState } from 'react'
import { BlockSidebar } from '@/components/document-template-editor/BlockSidebar'
import { TemplateEditor } from '@/components/document-template-editor/TemplateEditor'
import '@/styles/document-template-editor.css'

export default function DocumentTemplateCreatePage() {
  const [templateContent, setTemplateContent] = useState('')
  const [selectedNode, setSelectedNode] = useState(null)

  return (
    <div className="flex h-screen bg-gray-100">
      <BlockSidebar />
      <div className="flex-1 flex flex-col">
        <TemplateEditor 
          onContentChange={setTemplateContent}
          onSelectionChange={setSelectedNode}
        />
      </div>
    </div>
  )
}
```

## Template Variable Examples

### Basic Variables
- `{{companyName}}` - Company name
- `{{currentDate}}` - Current date
- `{{invoiceNumber}}` - Invoice number
- `{{customerName}}` - Customer name

### Address Variables
- `{{billingAddress.name}}` - Billing contact name
- `{{billingAddress.street}}` - Street address
- `{{billingAddress.city}}` - City
- `{{billingAddress.state}}` - State/Province
- `{{billingAddress.zip}}` - ZIP/Postal code
- `{{billingAddress.country}}` - Country

### Invoice Variables
- `{{item.description}}` - Item description
- `{{item.quantity}}` - Quantity
- `{{item.unitPrice}}` - Unit price
- `{{item.total}}` - Line total
- `{{invoice.subtotal}}` - Subtotal
- `{{invoice.tax}}` - Tax amount
- `{{invoice.total}}` - Grand total

## Customization

### Adding New Blocks
1. Create a new TipTap extension in `src/lib/tiptap/`
2. Add the block to the sidebar in `BlockSidebar.tsx`
3. Handle the block creation in `TemplateEditor.tsx`
4. Add appropriate CSS styles

### Custom Variables
Template variables can be customized by modifying the variable key during creation:

```javascript
case 'template-variable':
  const key = prompt('Enter the template variable key:')
  if (key) {
    newNode = schema.nodes.templateVariable.create({ key })
  }
  break
```

## Browser Support

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## Dependencies

- @tiptap/react
- @tiptap/core
- @tiptap/starter-kit
- @tiptap/extension-underline
- @tiptap/extension-text-align
- @tiptap/extension-link
- @tiptap/extension-strike
- react-icons
- tailwindcss
