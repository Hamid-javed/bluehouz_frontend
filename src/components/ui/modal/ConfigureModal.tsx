'use client';

import { Dialog, DialogContent, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { DialogHeader } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import { useFieldHeader } from "@/hooks/useFieldHeader";
import { useState, useMemo, useEffect, use, useCallback, useRef } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DotsVerticalIcon, DoubleArrowRightIcon } from "@radix-ui/react-icons";
import { useEntityGetAll } from "@/hooks/useEntityGetAll";
import { useEntityPost } from "@/hooks/useEntityPost";
import { useEntityPatch } from "@/hooks/useEntityPatch";
import { useAuth } from "@/context/AuthProvider";
import { Pencil, Trash } from "lucide-react";
import { useEntityRelationships } from "@/hooks/useEntityRelationships";
import { fetchEntityGetAll } from "@/hooks/useEntitySubRelation";
import { fetchEntityData } from "@/hooks/useFetchEntityData";

export type DisplayField = {
    accessorKey: string;
    header: string;
    textType?: string;
    category?: string; // for grouping fields by entity/table
};

export type FieldConfig = {
    name: string;
    label: string;
};

export type SavedView = {
    id: string;
    name: string;
    visibility: 'user' | 'organization';
    fields: DisplayField[];
    relatedTables?: string[];
};

export type Preference = {
    id: string;
    userId: string;
    preferenceKey: string;
    preferenceValue: string;
    organizationId: string;
    params: string;
};

export type ConfigureColumnsModalProps = {
    tableId: string;
    entity: string;
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    setData: (entity: string, data: any[]) => void;
    allFields: DisplayField[];
    selectedFields: DisplayField[];
    onChangeSelectedFields: (fields: DisplayField[]) => void;
    fieldConfig: FieldConfig[];
    defaultFieldsArr: string[];
};

export function ConfigureColumnsModal({
    tableId,
    entity,
    isOpen,
    onOpenChange,
    allFields,
    selectedFields,
    setData,
    onChangeSelectedFields,
    fieldConfig,
    defaultFieldsArr,
}: ConfigureColumnsModalProps) {
    const { getFieldHeader } = useFieldHeader(fieldConfig);
    const [search, setSearch] = useState('');
    const [isSaveSetModalOpen, setIsSaveSetModalOpen] = useState({modal: false, loading: false});
    const [setName, setSetName] = useState('');
    const [visibility, setVisibility] = useState<'user' | 'organization'>('user');
    const [savedViews, setSavedViews] = useState<SavedView[]>([]);
    const [activeView, setActiveView] = useState<string | null>(null);
    const [allrelatefields, setAllFields] = useState(allFields);
    const [relationsMap, setRelationsMap] = useState<Record<string, any[]>>({});
    const [prefData, setPrefData] = useState<Preference[]>([]);
    const [relatedDataMap, setRelatedDataMap] = useState<Record<string, any[]>>({});
    const { user, setFetchEntityLoading } = useAuth();
    const [deletingView, setDeletingView] = useState<string | null>(null);
    const [manualSelectedFields, setManualSelectedFields] = useState<string[]>([]);
    // related other tables
    const tableConfigMap = (configFileName: string) => {
        return import(`@shared/config/${configFileName}`)
            .then(mod => mod[configFileName]);
    };

    // custom hooks
    const { patchEntity, data: patchData, error: patchError, loading: patchLoading } = useEntityPatch('userPreference');
    const { patchEntity: orgPatchEntity, data: orgpatchData, error: orgpatchError, loading: orgpatchLoading } = useEntityPatch('organizationPreference');
    const { postEntity: postuserPreferences, data, error, loading } = useEntityPost('userPreference');
    const { postEntity: postorgPreferences, data: orgData, error: orgError, loading: orgLoading } = useEntityPost('organizationPreference');

    const { data: preferencesData = [], refetch: refetchUserPref } = useEntityGetAll<Preference>('userPreference', {
        preferenceKey: `table.${tableId}.columnViews`,
        userId: user?.id,
    });
    const { data: orgpreferencesData = [], refetch: refetchOrgPref } = useEntityGetAll<Preference>('organizationPreference', {
        preferenceKey: `table.${tableId}.columnViews`,
        organizationId: user?.currentOrganizationId,
    });
    const { data: relations = [], loading: relationLoading } = useEntityRelationships(entity);

    // 2. Fetch relations for the main entity
    useEffect(() => {
        fetchEntityGetAll('entityRelationship', { sourceEntity: entity })
            .then((data) => setRelationsMap({ [entity]: data }));
    }, [entity]);

    // 3. Load preferences and set saved views
    useEffect(() => {
        const combinedPrefs: Preference[] = [
            ...(preferencesData ?? []),
            ...(orgpreferencesData ?? []),
        ].filter((p): p is Preference => p && typeof p === 'object' && 'id' in p && 'preferenceKey' in p);
        if ((data && typeof data === 'object' && 'id' in data) || (orgData && typeof orgData === 'object' && 'id' in orgData)) {
            const newPrefs: Preference[] = [
                ...(data && typeof data === 'object' && 'id' in data ? [data as Preference] : []),
                ...(orgData && typeof orgData === 'object' && 'id' in orgData ? [orgData as Preference] : []),
            ];
            setPrefData((prev) => [...prev, ...newPrefs]);
        } else if (combinedPrefs.length > 0) {
            setPrefData(combinedPrefs);
        }
    }, [preferencesData, orgpreferencesData, data, orgData]);

    // 4. Set active view and related tables on mount or when preferences change
    useEffect(() => {
        // Find last selected view from preferences
        let lastSelectedView: string | null = null;
        let views: SavedView[] = [];
        (prefData ?? []).forEach((pref) => {
            if (!pref.preferenceKey.startsWith(`table.${tableId}.columnViews`)) return;
            try {
                const parsedValue = JSON.parse(pref.preferenceValue || '{}');
                if (pref.userId && parsedValue.lastSelectedHeaderSet) {
                    lastSelectedView = parsedValue.lastSelectedHeaderSet;
                }
                if (Array.isArray(parsedValue.headerSets)) {
                    parsedValue.headerSets.forEach((set: any) => {
                        views.push({
                            id: pref.id,
                            name: set.name,
                            visibility: pref.userId ? 'user' : 'organization',
                            fields: allrelatefields.filter((f) => set.columns?.includes(f.accessorKey)),
                            relatedTables: set.relatedTables || [],
                        });
                    });
                }
            } catch { }
        });
        setSavedViews(views);
        // Only set activeView if it's not already set or if the currently active view is not found in the new views
        if (!activeView || !views.some(v => v.name === activeView)) {
            setActiveView(lastSelectedView);
        }
    }, [prefData, tableId, allrelatefields, activeView]);

    // 5. Fetch related table data when activeView or its relatedTables changes
    useEffect(() => {
        if (!activeView) return;
        const view = savedViews.find((v) => v.name === activeView);
        if (!view) return;
        const relatedTables = view.relatedTables || [];
        relatedTables.forEach(async (relatedEntity: string) => {
            if (!relatedEntity) return;
            if (!relatedDataMap[relatedEntity]) {
                // Fetch config and data for related entity
                const configLoader = await import(`@shared/config/${relatedEntity}FieldConfig`).then(mod => mod[`${relatedEntity}FieldConfig`] as any[]);
                setFetchEntityLoading(true)
                const data = await fetchEntityData<any>(relatedEntity);
                setFetchEntityLoading(false)
                if (data && Array.isArray(data)) {
                    setRelatedDataMap((prev) => ({ ...prev, [relatedEntity]: data }));
                    setAllFields((prev) => {
                        const seen = new Set(prev.map(f => f.accessorKey));
                        const mappedFields: DisplayField[] = (configLoader as any[]).map((field: any) => ({
                            accessorKey: `${relatedEntity}.${field.name}`,
                            header: `${relatedEntity}.${field.label}`,
                            category: relatedEntity,
                        }));
                        return [...prev, ...mappedFields.filter(f => !seen.has(f.accessorKey))];
                    });
                    setData(relatedEntity, data);
                }
            }
        });
    }, [activeView]);

    // 6. Update selected fields when activeView changes
    useEffect(() => {
        const view = savedViews.find((v) => v.name === activeView);
        if (view) {
            onChangeSelectedFields(view.fields);
        }
    }, [activeView, savedViews, onChangeSelectedFields]);

    // Optimistic delete with error handling
    const handleDelete = async (view: SavedView) => {
        if (!view.id) return;
        setDeletingView(view.id);
        try {
            const pref = prefData.find((p) => p.id === view.id);
            if (!pref?.id) return;
            const parsedValue = JSON.parse(pref.preferenceValue || '{}');
            parsedValue.headerSets = parsedValue.headerSets?.filter((set: any) => set.name !== view.name);
            if (parsedValue.lastSelectedHeaderSet === view.name) {
                parsedValue.lastSelectedHeaderSet = parsedValue.headerSets?.[0]?.name ?? null;
            }
            const payload = { preferenceValue: JSON.stringify(parsedValue) };
            if (view.visibility === 'user') {
                await patchEntity(pref.id, payload);
                await refetchUserPref();
            } else {
                await orgPatchEntity(pref.id, payload);
                await refetchOrgPref();
            }
            // Remove from UI only after backend confirms
            setSavedViews((prev) => prev.filter((v) => v.id !== view.id));
        } catch (err) {
            // Optionally show a toast/snackbar here
            console.error('Failed to update preference', err);
        } finally {
            setDeletingView(null);
        }
    };

    const normalizedFields = useMemo(() => {
        return allrelatefields.map(field => ({
            ...field,
            category: !field.category || field.category.toLowerCase() === 'ungrouped'
                ? entity
                : field.category,
        }));
    }, [allrelatefields, entity]);

    const groupedFields = useMemo(() => {
        const groups: Record<string, DisplayField[]> = {};
        for (const field of normalizedFields) {
            const category = field.category;
            if (!groups[category]) groups[category] = [];
            groups[category].push(field);
        }
        return groups;
    }, [normalizedFields]);

    // filter fields
    const filteredGroups = useMemo(() => {
        if (!search.trim() || search.trim().length < 3) return groupedFields;
        const lowerSearch = search.toLowerCase();
        const filtered: Record<string, DisplayField[]> = {};
        for (const [category, fields] of Object.entries(groupedFields)) {
            const filteredFields = fields.filter(f =>
                getFieldHeader(f.accessorKey).toLowerCase().includes(lowerSearch)
            );
            if (filteredFields.length > 0) {
                filtered[category] = filteredFields;
            }
        }
        return filtered;
    }, [search, groupedFields, getFieldHeader]);

    // filter views
    const filteredSavedViews = useMemo(() => {
        if (!search.trim() || search.trim().length < 3) return savedViews;
        const lowerSearch = search.toLowerCase();
        return savedViews.filter(view =>
          view.name.toLowerCase().includes(lowerSearch)
        );
      }, [search, savedViews]);

    const isSelected = (key: string) =>
        manualSelectedFields.includes(key) ||
        selectedFields.some((f) => f.accessorKey === key);

    const toggleField = (field: DisplayField) => {
        setManualSelectedFields((prev) => {
            if (prev.includes(field.accessorKey)) {
                return prev.filter((key) => key !== field.accessorKey);
            } else {
                return [...prev, field.accessorKey];
            }
        });
        if (isSelected(field.accessorKey)) {
            onChangeSelectedFields(
                selectedFields.filter((f) => f.accessorKey !== field.accessorKey)
            );
        } else {
            onChangeSelectedFields([...selectedFields, field]);
        }
    };

    // for track of parent's selected fields
    useEffect(() => {
        setManualSelectedFields(selectedFields.map(f => f.accessorKey));
      }, [selectedFields, isOpen]);

    const handleIncludeRelation = async (
        relatedEntity: string,
        depth = 1,
        parentPath = ''
    ) => {
        if (depth > 3) return;
        if (!relatedEntity) return;
        const configLoader = await tableConfigMap(`${relatedEntity}FieldConfig`);
        const contactdata = await fetchEntityData<any>(relatedEntity);
        if (!contactdata || !Array.isArray(contactdata) || !configLoader) return;
        // Add mapped fields from config
        const pathPrefix = parentPath && depth > 2 ? `${parentPath}.${relatedEntity}` : relatedEntity;
        const mappedFields: DisplayField[] = (configLoader as any[]).map((field: any) => ({
            accessorKey: `${relatedEntity}.${field.name}`,
            header: `${pathPrefix}.${field.label}`,
            category: pathPrefix,
        }));
        setAllFields?.(prev => {
            const seen = new Set();
            return [...prev, ...mappedFields].filter(f => {
                const key = f.accessorKey;
                if (seen.has(key)) return false;
                seen.add(key);
                return true;
            });
        });
        // update the parent state data
        setData?.(relatedEntity, contactdata);
        // Fetch sub-relations for nested includes
        if (!relationsMap[relatedEntity]) {
            const subRelations = await fetchEntityGetAll<Preference>('entityRelationship', {
                sourceEntity: relatedEntity,
            });
            setRelationsMap(prev => ({ ...prev, [relatedEntity]: subRelations }));
        }
    };

    const handleViewSelect = useCallback(async (viewName: string) => {
        setManualSelectedFields([]);
        const view = savedViews.find(v => v.name === viewName);
        if (!view) return;

        // Set active view immediately
        setActiveView(view.name);

        // Update selected fields based on the view
        onChangeSelectedFields(view.fields);

        // Fetch related data for all related tables in the selected view
        const relatedTablesToFetch = view.relatedTables || [];
        for (const relatedEntity of relatedTablesToFetch) {
            await handleIncludeRelation(relatedEntity);
        }

        const matchedUserPref = preferencesData.find(
            (p) => p.preferenceKey === `table.${tableId}.columnViews`
        );
        const newPreferenceValue = (() => {
            let parsed = { headerSets: [], lastSelectedHeaderSet: view.name };
            try {
                if (matchedUserPref?.preferenceValue) {
                    parsed = JSON.parse(matchedUserPref.preferenceValue);
                }
            } catch {
                console.warn("Invalid user preference JSON, resetting.");
            }
            parsed.lastSelectedHeaderSet = view.name;
            return JSON.stringify(parsed);
        })();
        if (matchedUserPref) {
            await patchEntity(matchedUserPref.id, {
                preferenceKey: matchedUserPref.preferenceKey,
                preferenceValue: newPreferenceValue,
            });
        } else {
            await postuserPreferences({
                preferenceKey: `table.${tableId}.columnViews`,
                preferenceValue: newPreferenceValue,
                user: { connect: { id: user?.id } },
            });
        }
    }, [
        savedViews,
        handleIncludeRelation,
        onChangeSelectedFields,
        preferencesData,
        tableId,
        user?.id,
        patchEntity,
        postuserPreferences,
    ]);

    return (
        <>
            <Dialog open={isOpen} onOpenChange={onOpenChange}>
                <DialogContent className="max-h-[80vh] overflow-hidden">
                    <DialogHeader>
                        <DialogTitle>Configure Visible Columns</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-2">
                        <Input
                            placeholder="Enter at least three letters to search"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        <ScrollArea className="h-[50vh] pr-2">
                            <div className="mt-2">
                                <p className="text-base my-2 font-medium text-muted-foreground">My Views</p>
                                {filteredSavedViews.filter((vie) => vie.visibility === 'user').length === 0 && !deletingView ? (
                                    <p className="text-sm text-muted-foreground italic ml-2">No user views available</p>
                                ) : (
                                    filteredSavedViews
                                        .filter((vie) => vie.visibility === 'user')
                                        .map((view) => {
                                            const isDeleting = deletingView === view.id;
                                            return (
                                                <div
                                                    key={view.name}
                                                    className={`cursor-pointer hover:bg-white flex items-center rounded-sm justify-between py-1 px-2 ${activeView === view.name ? 'bg-sky-100 border-sky-300 border' : ''} ${isDeleting ? 'opacity-50 pointer-events-none' : ''}`}
                                                    onClick={() => handleViewSelect(view.name)}
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <span>{view.name}</span>
                                                    </div>
                                                    <div>
                                                        <button
                                                            disabled={isDeleting}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleDelete(view);
                                                            }}
                                                            className={`text-red-600 hover:underline ${isDeleting ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                        >
                                                            <Trash className="w-4 h-4 inline" />
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })
                                )}

                                <p className="text-base my-2 font-medium text-muted-foreground">Organization Views</p>
                                {filteredSavedViews.filter((vie) => vie.visibility === 'organization').length === 0 && !deletingView ? (
                                    <p className="text-sm text-muted-foreground italic ml-2 mb-2">No organization views available</p>
                                ) : (filteredSavedViews.filter((vie) => vie.visibility === 'organization')
                                    .map((view) => {
                                        const isDeleting = deletingView === view.id;
                                        return (
                                            <div
                                                key={view.name}
                                                className={`cursor-pointer hover:bg-white flex items-center justify-between rounded-sm py-1 px-2 ${activeView === view.name ? 'bg-sky-100 border-sky-300 border' : ''} ${isDeleting ? 'opacity-50 pointer-events-none' : ''}`}
                                                onClick={() => handleViewSelect(view.name)}
                                            >
                                                <div className="flex items-center gap-2">
                                                    <span>{view.name}</span>
                                                </div>
                                                <div>
                                                    <button
                                                        disabled={isDeleting}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDelete(view);
                                                        }}
                                                        className={`text-red-600 hover:underline ${isDeleting ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                    >
                                                        <Trash className="w-4 h-4 inline" />
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>

                            {Object.entries(filteredGroups).map(([category, fields]) => (
                                <div key={category} className="mt-2">
                                    <p className="text-base mb-1 font-medium text-muted-foreground">{category}</p>
                                    {fields.map((field) => {
                                        return <div
                                            key={field.accessorKey}
                                            className="flex items-center justify-between p-1"
                                        >
                                            <div className="flex items-center gap-2">
                                                <Checkbox
                                                    checked={isSelected(field.accessorKey)}
                                                    onCheckedChange={() => toggleField(field)}
                                                />
                                                <span>{getFieldHeader(field.accessorKey)}</span>
                                            </div>
                                        </div>
                                    }
                                    )}
                                    <div>
                                        <hr className="w-full border-t border-gray-200 my-2" />
                                        {relationsMap?.[category]?.length > 0 && <p className="text-base my-1 font-medium text-muted-foreground">Related {relationsMap?.[category].length > 1 ? 'Entities' : 'Entity'}</p>}
                                        {relationsMap[category]?.map((relation) => {
                                            return (
                                                <div key={relation.id}>
                                                    <div onClick={() => {
                                                        const isNested = category !== entity;
                                                        const parentPath = isNested ? `${category}` : '';
                                                        handleIncludeRelation(relation.relatedEntity, 1, parentPath);
                                                    }} className="cursor-pointer hover:bg-gray-25 flex items-center justify-between p-1">
                                                        <div className="flex items-center gap-2">
                                                            <span>{relation.relatedEntity}</span>
                                                        </div>
                                                        <button className="text-muted-foreground hover:text-foreground">
                                                            <DoubleArrowRightIcon />
                                                        </button>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            ))}
                            <Button
                                variant="outline"
                                className="text-sky-400 flex items-center w-full hover:text-sky-500"
                                onClick={() => setIsSaveSetModalOpen({ modal: true, loading: false })}
                            >
                                <span className="text-xl">+</span>SAVE COLUMN SET
                            </Button>
                        </ScrollArea>
                    </div>
                    <DialogFooter >
                        <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                        <Button onClick={() => onOpenChange(false)}>Save</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/*modal for create new view */}
            <Dialog open={isSaveSetModalOpen.modal} onOpenChange={open => setIsSaveSetModalOpen({ modal: open, loading: false })}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Save Column Set</DialogTitle>
                    </DialogHeader>

                    <div className="grid grid-cols-2 gap-4 space-y-4">
                        <Input
                            label="Set Name"
                            placeholder="Enter a name"
                            value={setName}
                            onChange={(e) => setSetName(e.target.value)}
                        />

                        <div>
                            <select
                                value={visibility}
                                onChange={(e) => setVisibility(e.target.value as 'user' | 'organization')}
                                className="w-full border px-3 py-2 rounded-md text-sm"
                            >
                                <option value="user">For Me Only</option>
                                <option value="organization">For the Organization</option>
                            </select>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                         disabled={patchLoading || orgLoading || loading || orgpatchLoading || !setName || isSaveSetModalOpen.loading}
                         variant="outline" onClick={() => setIsSaveSetModalOpen({ modal: false, loading: false })}>Cancel</Button>
                        <Button
                            disabled={patchLoading || orgLoading || loading || orgpatchLoading || !setName || isSaveSetModalOpen.loading}
                            onClick={async () => {
                                setIsSaveSetModalOpen({ modal: true, loading: true })
                                const preferenceKey = `table.${tableId}.columnViews`;
                                const preferenceOwnerId = visibility === 'user' ? user?.id : user?.currentOrganizationId;
                                const isUser = visibility === 'user';

                                // Find existing preference for this user or organization
                                const existingPref = prefData.find(
                                    (p) => (isUser ? p.userId === preferenceOwnerId : p.organizationId === preferenceOwnerId)
                                );

                                let parsedValue: any = {
                                    headerSets: [],
                                    // `lastSelectedHeaderSet` will be added only for user below
                                };

                                if (existingPref?.preferenceValue) {
                                    try {
                                        parsedValue = JSON.parse(existingPref.preferenceValue);
                                    } catch {
                                        console.warn('Invalid existing preference JSON, starting fresh.');
                                    }
                                }
                                // Create or update the header set
                                const newHeaderSet = {
                                    id: setName,
                                    name: setName,
                                    columns: selectedFields.map((f) => f.accessorKey),
                                    relatedTables: Array.from(new Set(selectedFields
                                        .filter(f => f.category && f.category !== entity)
                                        .map(f => f.category)
                                    )),
                                };

                                const existingIndex = parsedValue?.headerSets?.findIndex((v: any) => v.name === setName);
                                if (existingIndex > -1) {
                                    parsedValue.headerSets[existingIndex] = newHeaderSet;
                                } else {
                                    parsedValue.headerSets = [...(parsedValue.headerSets ?? []), newHeaderSet];
                                }
                                // Set lastSelectedHeaderSet only for user preference
                                if (isUser) {
                                    parsedValue.lastSelectedHeaderSet = setName;
                                }

                                const payload = {
                                    preferenceKey,
                                    preferenceValue: JSON.stringify(parsedValue),
                                };

                                // Save preference
                                if (existingPref) {
                                    if (isUser) {
                                        await patchEntity(existingPref.id, payload);
                                        await refetchUserPref()
                                    } else {
                                        await orgPatchEntity(existingPref.id, payload);
                                        await refetchOrgPref()
                                    }
                                } else {
                                    const fullPayload = {
                                        ...payload,
                                        ...(isUser
                                            ? { user: { connect: { id: user?.id } } }
                                            : { organization: { connect: { id: user?.currentOrganizationId } } }),
                                    };

                                    if (isUser) {
                                        await postuserPreferences(fullPayload);
                                    } else {
                                        await postorgPreferences(fullPayload);
                                    }
                                }

                                if (isUser) {
                                    const orgPref = prefData.find(
                                        (p) => p.preferenceKey === preferenceKey && p.organizationId === user?.currentOrganizationId
                                    );

                                    if (orgPref?.preferenceValue) {
                                        try {
                                            const orgParsed = JSON.parse(orgPref.preferenceValue);
                                            if ('lastSelectedHeaderSet' in orgParsed) {
                                                delete orgParsed.lastSelectedHeaderSet;
                                                await orgPatchEntity(orgPref.id, {
                                                    preferenceKey,
                                                    preferenceValue: JSON.stringify(orgParsed),
                                                });
                                            }
                                        } catch (err) {
                                            console.warn('Could not clean up orgPreference lastSelectedHeaderSet:', err);
                                        }
                                    }
                                }
                                // Update local state
                                const newView: SavedView = {
                                    id: prefData.find(p => p.preferenceKey === preferenceKey && p.userId === user?.id)?.id || '',
                                    name: setName,
                                    visibility,
                                    fields: [...selectedFields],
                                };

                                setSavedViews((prev) => [
                                    ...prev.filter((v) => v.name !== setName),
                                    newView,
                                ]);
                                setIsSaveSetModalOpen({ modal: false, loading: false });
                                setActiveView(setName);
                                setSetName('');
                            }}
                        >
                            {patchLoading || orgLoading || loading || orgpatchLoading || isSaveSetModalOpen.loading ? 'Saving...' : 'Save Set'}
                        </Button>

                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}