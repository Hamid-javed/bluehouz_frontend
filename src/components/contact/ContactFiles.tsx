// File: src/components/contact/ContactFiles.tsx
'use client'
import React, { useState } from 'react'
import DropZone from '@/components/form/input/DropZone'

interface ContactFilesProps {
  contactId: string
}

const ContactFiles: React.FC<ContactFilesProps> = ({ contactId }) => {
  const [selectedFile, setSelectedFile] = useState<string | null>(null)

  // Placeholder images for the thumbnails
  const mediaFiles = [
    '/placeholder1.jpg',
    '/placeholder2.jpg',
    '/placeholder3.jpg',
    '/placeholder4.jpg',
    '/placeholder5.jpg'
  ]

  return (
    <div className="min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
      {/* Media Library */}
      <div className="flex flex-wrap gap-3 justify-center mb-6">
        {mediaFiles.map((file, idx) => (
          <div
            key={idx}
            className={`w-20 h-20 border rounded overflow-hidden cursor-pointer ${
              selectedFile === file ? 'ring-2 ring-brand-500' : ''
            }`}
            onClick={() => setSelectedFile(file)}
          >
            <img
              src={file}
              alt={`File ${idx}`}
              className="object-cover w-full h-full"
            />
          </div>
        ))}
      </div>

      {/* Large Preview */}
      {selectedFile && (
        <div className="flex justify-center mb-6">
          <img
            src={selectedFile}
            alt="Selected preview"
            className="max-w-full max-h-96 border rounded shadow"
          />
        </div>
      )}

      {/* Drag & Drop Upload Zone */}
      <div className="mt-6">
        <DropZone
          onFileChange={(file) => {
            // Here, handle file upload logic
            console.log('Selected file for upload:', file)
          }}
        />
      </div>
    </div>
  )
}

export default ContactFiles
