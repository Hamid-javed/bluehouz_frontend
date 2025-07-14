import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DocumentTemplate } from '@shared/types/documentTemplate';
import { useEntityPost } from '@/hooks/useEntityPost';
import { useEntityPatch } from '@/hooks/useEntityPatch';
import { useEntityGetOne } from '@/hooks/useEntityGetOne';
import { useSnackbar } from '@/context/SnackbarContext';

interface DocumentTemplateFormProps {
  templateId?: string; // Optional, for editing existing templates
}

const DocumentTemplateForm: React.FC<DocumentTemplateFormProps> = ({ templateId }) => {
  const router = useRouter();
  const { showSnackbar } = useSnackbar();

  const [formData, setFormData] = useState<Partial<DocumentTemplate>>({
    name: '',
    description: '',
    templateContent: '',
    entityType: '',
    // organizationId will be handled on the backend or via context/auth
  });

  // For editing: fetch existing template data
  const { data: existingTemplate, loading: isFetchingTemplate } = useEntityGetOne<DocumentTemplate>(
    'document-templates', // entity
    templateId // id
  );

  useEffect(() => {
    if (existingTemplate) {
      setFormData(existingTemplate);
    }
  }, [existingTemplate]);

  // For submitting: create or update
  const { postEntity, loading: creating } = useEntityPost<DocumentTemplate>('document-templates', '/api');
  const { patchEntity, loading: updating } = useEntityPatch<DocumentTemplate>('document-templates', '/api');

  const isSubmitting = creating || updating;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (templateId) {
      // Update existing template
      await patchEntity(templateId, formData as DocumentTemplate);
      showSnackbar('Document Template updated successfully!', 'success');
    } else {
      // Create new template
      await postEntity(formData as DocumentTemplate);
      showSnackbar('Document Template created successfully!', 'success');
    }
    router.push('/admin/document-templates'); // Redirect after successful submission
  };

  if (templateId && isFetchingTemplate) {
    return <div>Loading template...</div>;
  }

  return (
    <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
      <div className="border-b border-stroke px-6.5 py-4 dark:border-strokedark">
        <h3 className="font-medium text-black dark:text-white">
          {templateId ? 'Edit Document Template' : 'Create Document Template'}
        </h3>
      </div>
      <form onSubmit={onSubmit}>
        <div className="p-6.5">
          <div className="mb-4.5 flex flex-col gap-6 xl:flex-row">
            <div className="w-full xl:w-1/2">
              <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                Template Name <span className="text-meta-1">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name || ''}
                onChange={handleChange}
                placeholder="Enter template name"
                className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                required
              />
            </div>

            <div className="w-full xl:w-1/2">
              <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                Applies To (Entity Type) <span className="text-meta-1">*</span>
              </label>
              <div className="relative z-20 bg-white dark:bg-form-input">
                <select
                  name="entityType"
                  value={formData.entityType || ''}
                  onChange={handleChange}
                  className="relative z-20 w-full appearance-none rounded border border-stroke bg-transparent px-5 py-3 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                  required
                >
                  <option value="">Select Entity Type</option>
                  <option value="Contact">Contact</option>
                  <option value="Invoice">Invoice</option>
                  <option value="Membership">Membership</option>
                  {/* Add more entity types as needed */}
                </select>
                <span className="absolute right-4 top-1/2 z-10 -translate-y-1/2">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <g opacity="0.8">
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M12.4325 15.4325C12.1625 15.7025 11.7325 15.7025 11.4625 15.4325L7.9325 11.9025C7.6625 11.6325 7.6625 11.2025 7.9325 10.9325L11.4625 7.4025C11.7325 7.1325 12.1625 7.1325 12.4325 7.4025L15.9625 10.9325C16.2325 11.2025 16.2325 11.6325 15.9625 11.9025L12.4325 15.4325Z"
                        fill=""
                      ></path>
                    </g>
                  </svg>
                </span>
              </div>
            </div>
          </div>

          <div className="mb-4.5">
            <label className="mb-3 block text-sm font-medium text-black dark:text-white">
              Description
            </label>
            <textarea
              rows={6}
              name="description"
              value={formData.description || ''}
              onChange={handleChange}
              placeholder="Enter template description"
              className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
            ></textarea>
          </div>

          <div className="mb-4.5">
            <label className="mb-3 block text-sm font-medium text-black dark:text-white">
              Template Content (Handlebars HTML) <span className="text-meta-1">*</span>
            </label>
            <textarea
              rows={15}
              name="templateContent"
              value={formData.templateContent || ''}
              onChange={handleChange}
              placeholder="Enter your Handlebars HTML template content here..."
              className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
              required
            ></textarea>
            {/* This will be replaced by the rich text editor */}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex w-full justify-center rounded bg-primary p-3 font-medium text-gray hover:bg-opacity-90 disabled:opacity-50"
          >
            {isSubmitting ? 'Saving...' : templateId ? 'Update Template' : 'Create Template'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default DocumentTemplateForm; 