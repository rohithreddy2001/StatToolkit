import { useState, useRef } from "react"
import { motion } from "framer-motion"
import { UploadCloud, FileType, CheckCircle2, AlertCircle } from "lucide-react"
import Papa from "papaparse"
import * as XLSX from "xlsx"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { useDatasetStore, type Dataset } from "@/store/datasetStore"
import { useNavigate } from "react-router-dom"

export function DataUpload() {
  const [isDragging, setIsDragging] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const { toast } = useToast()
  const addDataset = useDatasetStore(state => state.addDataset)
  const navigate = useNavigate()

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const droppedFile = e.dataTransfer.files[0]
    validateAndSetFile(droppedFile)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      validateAndSetFile(selectedFile)
    }
  }

  const validateAndSetFile = (file: File) => {
    const validTypes = ['text/csv', 'application/json', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'text/plain', 'text/tab-separated-values']
    const extension = file.name.split('.').pop()?.toLowerCase()
    
    if (!validTypes.includes(file.type) && !['csv', 'json', 'xlsx', 'txt', 'tsv'].includes(extension || '')) {
      toast({
        variant: "destructive",
        title: "Invalid file type",
        description: "Please upload a CSV, XLSX, JSON, TSV, or TXT file."
      })
      return
    }
    
    setFile(file)
  }

  const processParsedData = (data: any[], fileName: string, fileSize: number) => {
    // Basic Data Cleaning: remove entirely empty rows
    const cleanData = data.filter((row: any) => {
      return Object.values(row).some(val => val !== null && val !== "" && val !== undefined)
    })

    if (cleanData.length === 0) {
       toast({ title: "Error", description: "File is empty or invalid.", variant: "destructive" })
       setIsProcessing(false)
       return
    }

    // Dynamically build column metadata
    const columns = Object.keys(cleanData[0] as object)
    const columnMetadata = columns.map(col => {
      let missingCount = 0
      const values = new Set()
      let isNumeric = true

      cleanData.forEach((row: any) => {
        const val = row[col]
        if (val === null || val === "" || val === undefined) {
          missingCount++
        } else {
          values.add(val)
          if (typeof val !== 'number') {
             isNumeric = false
          }
        }
      })

      return {
        name: col,
        type: (isNumeric ? 'numeric' : 'categorical') as "numeric" | "categorical",
        missingCount,
        uniqueValues: values.size
      }
    })

    const parsedDataset: Dataset = {
      id: crypto.randomUUID(),
      name: fileName,
      rows: cleanData.length,
      columns: columns.length,
      fileSize: fileSize,
      fileType: fileName.split('.').pop() || 'unknown',
      uploadDate: new Date().toISOString(),
      columnMetadata,
      previewData: cleanData.slice(0, 20) as any[],
      fullData: cleanData
    }
    
    addDataset(parsedDataset)
    setIsProcessing(false)
    
    toast({
      title: "Upload Successful",
      description: `${fileName} has been parsed and processed successfully.`,
    })
    
    navigate("/overview")
  }

  const handleProcessFile = async () => {
    if (!file) return
    setIsProcessing(true)
    
    const extension = file.name.split('.').pop()?.toLowerCase()
    
    if (extension === 'xlsx') {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const data = e.target?.result
          const workbook = XLSX.read(data, { type: 'binary' })
          const sheetName = workbook.SheetNames[0]
          const sheet = workbook.Sheets[sheetName]
          const jsonData = XLSX.utils.sheet_to_json(sheet)
          processParsedData(jsonData, file.name, file.size)
        } catch (error: any) {
          toast({ variant: "destructive", title: "Error Parsing Excel", description: error.message })
          setIsProcessing(false)
        }
      }
      reader.onerror = () => {
        toast({ variant: "destructive", title: "File Read Error", description: "Could not read the file." })
        setIsProcessing(false)
      }
      reader.readAsBinaryString(file)
    } else if (extension === 'json') {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
           const jsonData = JSON.parse(e.target?.result as string)
           processParsedData(Array.isArray(jsonData) ? jsonData : [jsonData], file.name, file.size)
        } catch(error: any) {
           toast({ variant: "destructive", title: "JSON Parse Error", description: error.message })
           setIsProcessing(false)
        }
      }
      reader.readAsText(file)
    } else {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: true, // Automatically converts numbers
        complete: (results) => {
          processParsedData(results.data, file.name, file.size)
        },
        error: (error) => {
          toast({
            variant: "destructive",
            title: "Error Parsing File",
            description: error.message,
          })
          setIsProcessing(false)
        }
      })
    }
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto space-y-6"
    >
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Data Upload</h1>
        <p className="text-muted-foreground">
          Upload your dataset to begin analysis. We support CSV, Excel, and JSON formats.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upload File</CardTitle>
          <CardDescription>Drag and drop your file here or click to browse.</CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className={`
              relative flex flex-col items-center justify-center p-12 mt-4 
              border-2 border-dashed rounded-xl transition-all
              ${isDragging 
                ? 'border-primary bg-primary/5' 
                : 'border-border hover:border-primary/50 hover:bg-muted/50'
              }
              ${file ? 'border-green-500/50 bg-green-500/5' : ''}
            `}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden" 
              accept=".csv,.xlsx,.json,.txt,.tsv"
            />
            
            {file ? (
              <div className="flex flex-col items-center space-y-4 text-center">
                <div className="p-4 bg-green-500/10 rounded-full">
                  <CheckCircle2 className="h-10 w-10 text-green-500" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{file.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setFile(null)}>
                    Remove
                  </Button>
                  <Button onClick={handleProcessFile} disabled={isProcessing}>
                    {isProcessing ? "Processing..." : "Process Dataset"}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center space-y-4 text-center">
                <div className="p-4 bg-primary/10 rounded-full">
                  <UploadCloud className="h-10 w-10 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Drop your file here</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    or click below to browse your files
                  </p>
                  <Button onClick={() => fileInputRef.current?.click()}>
                    Browse Files
                  </Button>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
            <div className="flex items-start space-x-3 p-4 rounded-lg bg-muted/50">
              <FileType className="h-5 w-5 text-blue-500 mt-0.5" />
              <div>
                <h4 className="font-medium text-sm">Supported Formats</h4>
                <p className="text-xs text-muted-foreground mt-1">CSV, TSV, TXT, JSON, XLSX</p>
              </div>
            </div>
            <div className="flex items-start space-x-3 p-4 rounded-lg bg-muted/50">
              <AlertCircle className="h-5 w-5 text-orange-500 mt-0.5" />
              <div>
                <h4 className="font-medium text-sm">File Size Limit</h4>
                <p className="text-xs text-muted-foreground mt-1">Up to 500MB per dataset</p>
              </div>
            </div>
            <div className="flex items-start space-x-3 p-4 rounded-lg bg-muted/50">
              <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <h4 className="font-medium text-sm">Secure Processing</h4>
                <p className="text-xs text-muted-foreground mt-1">Files are processed securely</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
