import React, { useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import Input from '@/components/form/input/InputField';
import TextArea from '@/components/form/input/TextArea';
import Select from '@/components/form/input/Select';
import { EnumOption, useEnumOptions } from '@/hooks/useEnumOptions';
import { useAuth } from '@/context/AuthProvider';

type FieldConfig = {
    name: string;
    label?: string;
    readOnly?: boolean;
    defaultValue?: string;
    valueType?: string;
    helpText?: string;
    error?: boolean;
    texttype?: string;
    valueType?: string;
    errorMessage?: string;
    enumTypeKey?: string;
    required?: boolean;
    uiElement?: 'text' | 'textArea' | 'select';
    hidden?: boolean;
    defaultVisible?: boolean;
    isProperty?: boolean;
    validate?:(value: any) => string | null;
    displayOrder?: number;
    options: { label: string; value: string };
};

type Option = {
    label: string;
    value: string;
};

interface CreateModalProps {
    open: boolean;
    setOpen: (v: boolean) => void;
    isProperty: boolean;
    title: string;
    fieldConfig: FieldConfig[];
    options?: Option[];
    formValues: Record<string, any>;
    updatedData?: Record<string, any>;
    formeditValues?: Record<string, any>;
    setFormValues: (v: Record<string, any>) => void;
    setFormEditValues?: (v: Record<string, any>) => void;
    errors: Record<string, string>;
    setErrors: (e: Record<string, string>) => void;
    creating: boolean;
    isedit?: boolean;
    postEntity: (payload: Record<string, any>) => Promise<any>;
    replaceEntity?: (id: string, payload: Record<string, any>) => Promise<any>;
    setData: (cb: (prev: any[]) => any[]) => void;
    t: (key: string) => string;
}

export default function CreateModal({
    open,
    setOpen,
    title,
    fieldConfig,
    formValues,
    formeditValues,
    setFormValues,
    setFormEditValues,
    updatedData,
    errors,
    setErrors,
    creating,
    options = [],
    postEntity,
    replaceEntity,
    setData,
    isedit = false,
    isProperty = false,
    t,
}: CreateModalProps) {
    const currentValues = isedit ? formeditValues : formValues;
    const setCurrentValues = isedit ? setFormEditValues : setFormValues;
    const { user } = useAuth();

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="max-w-3xl radix-dialog-content">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                </DialogHeader>
                <form
                    onSubmit={async (e) => {
                        e.preventDefault();
                        const form = e.target as HTMLFormElement;
                        const formData = new FormData(form);
                        const payload = Object.fromEntries(formData.entries());

                        const newErrors: Record<string, string> = {};
                        fieldConfig
                            .some(field => {
                                const value = formValues[field.name] ?? formData.get(field.name);
                                if (field.required && (!value || value.toString().trim() === '')) {
                                    newErrors[field.name] = `${t(field.label || field.name)} is required.`;
                                    return true;
                                }
                                if (field.validate) {
                                    const error = field?.validate(value);
                                    if (error) {
                                        newErrors[field.name] = error;
                                        return true;
                                    }
                                }
                                return false;
                            });

                        setErrors(newErrors);
                        if (Object.keys(newErrors).length > 0) return;

                        // Example transformations
                        if (isProperty) {
                            (payload as any).renewalFundProperty = Number(payload.renewalFundProperty);
                            (payload as any).yearOfConstruction = Number(payload.yearOfConstruction);
                        }
                        (payload as any).organizationId = isedit ? formeditValues?.organizationId : user?.currentOrganizationId;

                        try {
                            let created: any
                            if (isedit && formeditValues?.id) {
                                created = await replaceEntity?.(formeditValues.id, payload)
                                setData(prev => prev.map(item => item.id === created?.id ? created : item));
                            } else {
                                created = await postEntity(payload as any);
                                setData(prev => [created, ...prev]);
                            }
                            if (created) {
                                setOpen(false);
                                setErrors({});
                                setCurrentValues?.({});
                            }
                        } catch (err) {
                            console.error('Failed to create entity', err);
                        }
                    }}
                >
                    <div className="grid grid-cols-2 gap-4">
                        {fieldConfig
                            .filter(field => !field.hidden && field.defaultVisible !== false)
                            .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0))
                            .map(field => {
                                const commonProps = {
                                    name: field.name,
                                    type: field.valueType,
                                    label: t(field.label || field.name),
                                    type: field.valueType,
                                    readOnly: field.readOnly ?? false,
                                    value: currentValues?.[field.name] ?? '',
                                    onChange: (val: any) => {
                                        const actualValue = val?.target?.value ?? val;
                                        setCurrentValues?.((prev: any) => ({
                                            ...prev,
                                            [field.name]: actualValue,
                                        }));
                                    },
                                    defaultValue: field.defaultValue ?? '',
                                    helpText: field.helpText ? t(field.helpText) : undefined,
                                    error: !!errors[field.name],
                                    errorMessage: errors[field.name],
                                };

                                let enumOptions: EnumOption[] = []

                                if (field.uiElement === 'select' && field.enumTypeKey) {
                                    const { options: enumHookOptions } = useEnumOptions(field.enumTypeKey)
                                    enumOptions = enumHookOptions
                                }

                                const isFullWidth = isProperty && ['notes', 'country'].includes(field.name);

                                let component: React.ReactNode;
                                switch (field.uiElement) {
                                    case 'textArea':
                                        component = <TextArea {...commonProps} />;
                                        break;
                                    case 'select':
                                        component = (
                                            <Select
                                                {...commonProps}
                                                required={field.required}
                                                options={Array.isArray(field.options) ? field.options : (enumOptions.length ? enumOptions : options)}
                                            />
                                        );
                                        break;
                                    case 'text':
                                    default:
                                        component = <Input {...commonProps} />;
                                }

                                return (
                                    <div key={field.name} className={isFullWidth ? 'col-span-2' : ''}>
                                        {component}
                                    </div>
                                );
                            })}
                    </div>

                    <div className="mt-6 flex justify-end gap-2">
                        <button
                            type="button"
                            onClick={() => setOpen(false)}
                            className="px-4 py-2 border border-gray-300 rounded"
                        >
                            Cancel
                        </button>
                        <button disabled={creating} type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
                            {creating ? (isedit ? 'Saving...' : 'Creating...') : (isedit ? 'Save' : 'Create')}
                        </button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
