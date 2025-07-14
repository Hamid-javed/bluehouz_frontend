'use client'

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { BlockSidebar } from '@/components/document-template-editor/BlockSidebar'
import { TemplateEditor } from '@/components/document-template-editor/TemplateEditor'
import api from '@/services/apihandler' // Corrected import
import Button from '@/components/ui/button/Button'
import Input from '@/components/form/input/InputField'
import '@/styles/document-template-editor.css'

interface TemplateFormData {
  name: string
  type: string
  language: string
  country: string
}

export default function DocumentTemplateCreatePage() {
  const [templateContent, setTemplateContent] = useState('')
  const [selectedNode, setSelectedNode] = useState<any>(null)
  const { register, handleSubmit, formState: { errors } } = useForm<TemplateFormData>()

  const handleSave = async (data: TemplateFormData) => {
    console.log(data)
    if (!templateContent) {
      alert('Template content cannot be empty.')
      return
    }

    const payload = {
      name: data.name,
      type: data.type,
      templateContent: templateContent,
      // Hardcoding organizationId for now as it's required by the backend.
      // In a real app, this would come from the user's session or context.
      organizationId: '5aeae0c3-1810-40de-bf6e-f40652229184',
      language: data.language,
      country: data.country,
      isHidden: false,
    }

    try {
      await api('POST', 'http://localhost:5000/api/document-templates', payload)
      alert('Template saved successfully!')
    } catch (error) {
      console.error('Failed to save template:', error)
      alert('Failed to save template. Check console for details.')
    }
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <BlockSidebar />
      <div className="flex-1 flex flex-col">
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Document Template Editor</h1>
          <p className="text-sm text-gray-600 mt-1">Create and design your document templates with drag-and-drop blocks</p>
        </div>
        
        <TemplateEditor 
          onContentChange={setTemplateContent}
          onSelectionChange={setSelectedNode}
        />
        
        <div className="bg-white border-t border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-900">Template Settings</h3>
          <form onSubmit={handleSubmit(handleSave)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <Input 
                  label="Template Name"
                  placeholder="Enter template name"
                  {...register('name', { required: 'Name is required' })}
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
              </div>
              <div>
                <Input 
                  label="Template Type"
                  placeholder="e.g., Invoice, Contract"
                  {...register('type', { required: 'Type is required' })}
                />
                {errors.type && <p className="text-red-500 text-sm mt-1">{errors.type.message}</p>}
              </div>
              <div>
                <Input 
                  label="Language"
                  placeholder="e.g., English, Spanish"
                  {...register('language', { required: 'Language is required' })}
                />
                {errors.language && <p className="text-red-500 text-sm mt-1">{errors.language.message}</p>}
              </div>
              <div>
                <Input
                  label="Country"
                  placeholder="e.g., USA, Canada"
                  {...register('country', { required: 'Country is required' })}
                />
                {errors.country && <p className="text-red-500 text-sm mt-1">{errors.country.message}</p>}
              </div>
            </div>
            <div className="flex justify-end">
              <Button 
                type="submit" 
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
              >
                Save Template
              </Button>
            </div>
          </form>
        </div>
      </div>
      
      {/* Enhanced Properties Panel */}
      <div className="w-80 bg-white border-l border-gray-200 h-full overflow-y-auto">
        <div className="p-4 border-b border-gray-200">
          <h4 className="text-lg font-semibold text-gray-900">Properties</h4>
          <p className="text-sm text-gray-600 mt-1">Configure selected element</p>
        </div>
        
        <div className="p-4">
          {selectedNode ? (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="font-medium text-blue-900 mb-1">
                  Selected: {selectedNode.type}
                </div>
                <div className="text-sm text-blue-700">
                  Position: {selectedNode.pos}
                </div>
              </div>
              
              <div className="space-y-3">
                {Object.entries(selectedNode).map(([key, value]) => (
                  key !== 'type' && key !== 'pos' && (
                    <div key={key} className="border-b border-gray-100 pb-2">
                      <div className="text-sm font-medium text-gray-700 capitalize">{key}:</div>
                      <div className="text-sm text-gray-900 mt-1">{String(value)}</div>
                    </div>
                  )
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-gray-400 text-4xl mb-2">🎯</div>
              <p className="text-gray-500 text-sm">Select an element in the editor to configure its properties</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 