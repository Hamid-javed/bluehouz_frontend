import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { useState } from 'react';

type ImportModalProps = {
    open: boolean;
    setOpen: (v: boolean) => void;
    title?: string;
    headers: string[];
    exampleRow: (string | number)[];
    onUpload: (file: File) => void;
    instructions?: string[];
};

export function ImportModal({
    open,
    setOpen,
    title = 'Import Data',
    headers,
    exampleRow,
    onUpload,
    instructions = [
        'Ensure dates are in the correct format.',
        'Ensure numbers are formatted correctly.',
        'Review select fields for valid options.',
        'Fill in all required fields.',
    ],
}: ImportModalProps) {
    const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
    const [uploadError, setUploadError] = useState<string | null>(null);

    const downloadTemplate = () => {
        const csvContent =
            headers.join(',') + '\n' + exampleRow.map((v) => `"${v}"`).join(',');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'import-template.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.name.endsWith('.csv')) {
            setUploadError('Only CSV files are accepted.');
            return;
        }

        setUploadError(null);
        setSelectedFileName(file.name);
        onUpload(file);
        setOpen(false);
    };
    
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="max-w-xl radix-dialog-content">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                </DialogHeader>

                <div className='max-h-[65vh] h-full overflow-y-auto mt-12'>
                    <div className="space-y-6 text-sm max-w-xl">
                        {/* Step 1: Download Template */}
                        <div>
                            <h3 className="font-semibold mb-1">Step 1: Download Template</h3>
                            <button
                                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100 text-sm"
                                onClick={downloadTemplate}
                                aria-label="Download CSV Template"
                            >
                                DOWNLOAD TEMPLATE
                            </button>

                            <div className="mt-2 overflow-auto border border-gray-200 rounded-md">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr>
                                            {headers.map((header, idx) => (
                                                <th key={idx} className="border p-2 bg-gray-100 font-medium">
                                                    {header}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            {exampleRow.map((val, idx) => (
                                                <td key={idx} className="border p-2">
                                                    {val}
                                                </td>
                                            ))}
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Step 2: Instructions */}
                        <div>
                            <h3 className="font-semibold mb-1">Step 2: Prepare Data</h3>
                            <ul className="list-disc list-inside text-gray-700 space-y-1">
                                {instructions.map((line, i) => (
                                    <li key={i}>{line}</li>
                                ))}
                            </ul>
                        </div>

                        {/* Step 3: Upload File */}
                        <div>
                            <h3 className="font-semibold mb-1">Step 3: Upload File</h3>
                            <label
                                htmlFor="csv-upload"
                                className="inline-block px-4 py-2 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-100"
                            >
                                UPLOAD FILE
                                <input
                                    id="csv-upload"
                                    type="file"
                                    accept=".csv"
                                    onChange={handleFileUpload}
                                    className="hidden"
                                />
                            </label>
                            <p className="mt-1 text-xs text-gray-500">Accepted format: .csv</p>

                            {selectedFileName ? (
                                <p className="text-sm text-gray-700 mt-1">{selectedFileName}</p>
                            ) : (
                                <p className="text-sm text-gray-500 mt-1">No file selected</p>
                            )}

                            {uploadError && (
                                <p className="text-sm text-red-600 mt-1">{uploadError}</p>
                            )}
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="mt-6 flex justify-end gap-2">
                        <button
                            onClick={() => setOpen(false)}
                            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100"
                        >
                            CANCEL
                        </button>
                        <button
                            onClick={() => alert('Preview feature coming soon.')}
                            disabled
                            className="px-4 py-2 bg-gray-300 text-white rounded-md cursor-not-allowed"
                            title="Coming soon"
                        >
                            PREVIEW
                        </button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
