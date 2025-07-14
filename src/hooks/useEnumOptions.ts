// File: bluehouz_frontend\src\hooks\useEnumOptions.ts

import { useEffect, useState } from 'react'
import apiHandler from '@/services/apihandler'
import { useAuth } from '@/context/AuthProvider'

export interface EnumOption {
  value: string
  label: string
}

function normalizeLabelToKey(label: string): string {
  return label.toLowerCase().replace(/\s+/g, '')
}

export function useEnumOptions(enumTypeKey: string) {
  const [options, setOptions] = useState<EnumOption[]>([])
  const [map, setMap] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {

    async function fetchEnum() {
      try {
        const data = await apiHandler<any[]>(
          'GET',
          `/api/enum/${enumTypeKey}`,
          undefined,
        )

        const mappedOptions: EnumOption[] = data.map((item) => ({
          value: item.id,
          label: item.label,
        }))

        const mappedMap: Record<string, string> = {}
        for (const item of mappedOptions) {
          mappedMap[item.value] = item.label
        }

        setOptions(mappedOptions)
        setMap(mappedMap)
      } catch (err) {
        console.error(`❌ Failed to load enum values for ${enumTypeKey}:`, err)
      } finally {
        setLoading(false)
      }
    }

    fetchEnum()
  }, [enumTypeKey])

  return { options, map, loading }
}

export function useEnumOptionsMap(enumKeys: string[]) {

  // ✅ Early exit if no keys to fetch
  if (!enumKeys || enumKeys.length === 0) {
    return {
      enumOptionsMap: new Proxy({}, { get: () => [] }),
      enumValueMap: new Proxy({}, { get: () => ({}) }),
      loading: false,
      loadingMap: {},
    }
  }

  const [optionsMap, setOptionsMap] = useState<Record<string, EnumOption[]>>(
    () => Object.fromEntries(enumKeys.map((k) => [k, []]))
  )
  const [valueMap, setValueMap] = useState<Record<string, Record<string, string>>>(
    () => Object.fromEntries(enumKeys.map((k) => [k, {}]))
  )
  const [loadingMap, setLoadingMap] = useState<Record<string, boolean>>({})
  const [globalLoading, setGlobalLoading] = useState<boolean>(true)

  useEffect(() => {

    let completed = 0
    const total = enumKeys.length

    enumKeys.forEach((key) => {
      setLoadingMap((prev) => ({ ...prev, [key]: true }))

      apiHandler<any[]>(
        'GET',
        `/api/enum/${key}`,
        undefined,
      )
        .then((data) => {
          const options: EnumOption[] = data.map((item) => ({
            value: item.id,
            label: item.label,
          }))

          const reverseMap: Record<string, string> = {}
          for (const item of options) {
            const normalizedKey = normalizeLabelToKey(item.label)
            reverseMap[normalizedKey] = item.value
          }

          setOptionsMap((prev) => ({ ...prev, [key]: options }))
          setValueMap((prev) => ({ ...prev, [key]: reverseMap }))
        })
        .catch((err) => {
          console.error(`❌ Failed to load enum values for ${key}:`, err)
        })
        .finally(() => {
          setLoadingMap((prev) => ({ ...prev, [key]: false }))
          completed += 1
          if (completed === total) {
            setGlobalLoading(false)
          }
        })
    })
  }, [enumKeys.join(',')])

  const safeOptionsMap = new Proxy(optionsMap, {
    get(target, prop: string) {
      return target[prop] ?? []
    },
  })

  const safeValueMap = new Proxy(valueMap, {
    get(target, prop: string) {
      return target[prop] ?? {}
    },
  })

  return {
    enumOptionsMap: safeOptionsMap,
    enumValueMap: safeValueMap,
    loading: globalLoading,
    loadingMap,
  }
}
