//File: src\components\form\form-elements\FileInputExample.tsx

'use client';
import React from 'react';
import ComponentCard from '../../common/ComponentCard';
import FileInput from '../input/FileInput';
import Label from '../Label';

export default function FileInputExample() {
  const handleFileChange = (file: File | null) => {
    if (file) {
      console.log('Selected file:', file.name);
    }
  };

  return (
    <ComponentCard title="File Input">
      <div>
        <Label htmlFor="exampleFileUpload">Upload file</Label>
        <FileInput
          id="exampleFileUpload"
          onFileChange={handleFileChange}
          className="custom-class"
        />
      </div>
    </ComponentCard>
  );
}
