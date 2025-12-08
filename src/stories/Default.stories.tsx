import { ReactSpreadsheetImport } from "../ReactSpreadsheetImport"
import { Box, Link, Code, Button, useDisclosure } from "@chakra-ui/react"
import { fields } from "./mockRsiValues"
import { useCallback, useEffect, useRef, useState } from "react"
import type { Result } from "src/types"

const MATCH_COLUMNS_STORAGE_KEY = "saved_match_columns"
const MATCH_COLUMNS_FILE_KEY = "saved_match_columns_file"

const getFileSignature = (rows: any[]) => {
  try {
    const str = JSON.stringify(rows)
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const chr = str.charCodeAt(i)
      hash = (hash << 5) - hash + chr
      hash |= 0 
    }
    return hash.toString()
  } catch {
    return ""
  }
}

export default {
  title: "React spreadsheet import",
}

export const Basic = () => {
  const [data, setData] = useState<Result<any> | null>(null)
  const { isOpen, onOpen, onClose } = useDisclosure()

  const [setChildColumns, setSetChildColumns] = useState<null | ((cols: any) => void)>(null)
  const hydratedRef = useRef(false)

  const handleRegister = useCallback((setter: (cols: any) => void) => {
    setSetChildColumns(() => setter)
  }, [])

  useEffect(() => {
    if (!setChildColumns || hydratedRef.current) return

    const saved = localStorage.getItem(MATCH_COLUMNS_STORAGE_KEY)

    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed)) {
          hydratedRef.current = true
          setChildColumns(parsed)
          return
        }
      } catch {}
    }

    hydratedRef.current = true
  }, [setChildColumns])

  return (
    <>
      <Box py={20} display="flex" gap="8px" alignItems="center">
        <Button onClick={onOpen} border="2px solid #7069FA" p="8px" borderRadius="8px">
          Open Flow
        </Button>
        (make sure you have a file to upload)
      </Box>
      <Link href="./exampleFile.csv" border="2px solid #718096" p="8px" borderRadius="8px" download="exampleCSV">
        Download example file
      </Link>
      <ReactSpreadsheetImport
        fields={fields}
        isOpen={true}
        onClose={onClose}
        onSubmit={setData}
        uploadStepHook={async (rawData) => {
          const newSignature = getFileSignature(rawData)
          const prevSignature = localStorage.getItem(MATCH_COLUMNS_FILE_KEY)

          if (newSignature && newSignature !== prevSignature) {
            localStorage.removeItem(MATCH_COLUMNS_STORAGE_KEY)
          }

          if (newSignature) {
            localStorage.setItem(MATCH_COLUMNS_FILE_KEY, newSignature)
          }

          return rawData
        }}
        matchColumnsRegisterSetColumns={handleRegister}
        matchColumnsOnColumnsChange={(cols) => {
          if (!hydratedRef.current) return
          localStorage.setItem(MATCH_COLUMNS_STORAGE_KEY, JSON.stringify(cols))
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
