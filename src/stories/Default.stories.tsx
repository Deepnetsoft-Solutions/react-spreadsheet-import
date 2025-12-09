import { ReactSpreadsheetImport } from "../ReactSpreadsheetImport"
import { Box, Link, Code, Button, useDisclosure } from "@chakra-ui/react"
import { mockRsiValues } from "./mockRsiValues"
import { useState, useEffect } from "react"
import type { Result } from "src/types"

export default {
  title: "React spreadsheet import",
}

const STORAGE_KEY = "rsi_persistent_fields"

const usePersistentFields = () => {
  const [fields, setFields] = useState<typeof mockRsiValues.fields>(mockRsiValues.fields)

  useEffect(() => {
    // Load from local storage on mount
    const storedFields = localStorage.getItem(STORAGE_KEY)
    if (storedFields) {
      try {
        const parsedFields = JSON.parse(storedFields)
        if (
          Array.isArray(parsedFields) &&
          parsedFields.every((f) => f && f.key && f.fieldType && f.fieldType.type)
        ) {
          setFields(parsedFields)
        } else {
          console.warn("Stored fields are invalid (missing fieldType or type), resetting to default")
          localStorage.removeItem(STORAGE_KEY)
          setFields(mockRsiValues.fields)
        }
      } catch (e) {
        console.error("Failed to parse stored fields", e)
        localStorage.removeItem(STORAGE_KEY)
        setFields(mockRsiValues.fields)
      }
    }
  }, [])

  const updateFieldsFromApi = () => {
    // Simulate fetching new fields from an API
    const newFields = [
      ...mockRsiValues.fields,
      {
        label: "New Persistent Field",
        key: "new_persistent_field",
        fieldType: { type: "input" } as const,
        example: "Persistent Value",
      },
    ] as typeof mockRsiValues.fields

    setFields(newFields)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newFields))
    alert("Fields updated from 'API' and saved to localStorage. Reload to verify persistence.")
  }

  const resetFields = () => {
    setFields(mockRsiValues.fields)
    localStorage.removeItem(STORAGE_KEY)
    // alert("Fields reset to default.")
  }

  const addMappedColumnsToFields = (columns: any[]) => {
    let hasChanges = false
    const newFields = fields.map((field) => {
      // Find a column that maps to this field
      const matchedColumn = columns.find((col) => "value" in col && col.value === field.key)
      if (matchedColumn && matchedColumn.header) {
        // If the header is not already in alternateMatches, add it
        const currentMatches = field.alternateMatches || []
        const alreadyMatches = currentMatches.some(
          (match: string) => match.toLowerCase() === matchedColumn.header.toLowerCase(),
        )
        // Also check if key matches (default logic)
        const keyMatches = field.key.toLowerCase() === matchedColumn.header.toLowerCase()

        if (!alreadyMatches && !keyMatches) {
          hasChanges = true
          return {
            ...field,
            defaultColumnIndex: matchedColumn.index,
          }
        }
      }
      return field
    })

    if (hasChanges) {
      setFields(newFields)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newFields))
    }
  }

  return { fields, updateFieldsFromApi, resetFields, addMappedColumnsToFields }
}

export const Basic = () => {
  const [data, setData] = useState<Result<any> | null>(null)
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { fields, updateFieldsFromApi, resetFields, addMappedColumnsToFields } = usePersistentFields()

  return (
    <>
      <Box py={20} display="flex" gap="16px" alignItems="center" flexWrap="wrap">
        <Button onClick={onOpen} border="2px solid #7069FA" p="8px" borderRadius="8px">
          Open Flow
        </Button>
        <Button onClick={updateFieldsFromApi} border="2px solid #38A169" p="8px" borderRadius="8px">
          Simulate API Update (Add Field)
        </Button>
        <Button onClick={resetFields} border="2px solid #E53E3E" p="8px" borderRadius="8px">
          Reset Fields
        </Button>
        <Box>(make sure you have a file to upload)</Box>
      </Box>
      <Link href="./exampleFile.csv" border="2px solid #718096" p="8px" borderRadius="8px" download="exampleCSV">
        Download example file
      </Link>
      <ReactSpreadsheetImport
        {...mockRsiValues}
        fields={fields}
        isOpen={isOpen}
        onClose={onClose}
        onSubmit={setData}
        matchColumnsStepHook={async (data, rawData, columns) => {
          addMappedColumnsToFields(columns)
          return data
        }}
      />
      {!!data && (
        <Box pt={64} display="flex" gap="8px" flexDirection="column">
          <b>Returned data (showing first 100 rows):</b>
          <Code
            display="flex"
            alignItems="center"
            borderRadius="16px"
            fontSize="12px"
            background="#4A5568"
            color="white"
            p={32}
          >
            <pre>
              {JSON.stringify(
                {
                  validData: data.validData.slice(0, 100),
                  invalidData: data.invalidData.slice(0, 100),
                  all: data.all.slice(0, 100),
                },
                undefined,
                4,
              )}
            </pre>
          </Code>
        </Box>
      )}
    </>
  )
}

Basic.parameters = {
  chromatic: { disableSnapshot: true },
}
