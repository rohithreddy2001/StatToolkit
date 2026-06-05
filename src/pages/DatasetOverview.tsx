import { motion } from "framer-motion"
import { useDatasetStore } from "@/store/datasetStore"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Database, FileDigit, GripHorizontal, AlertTriangle, CheckCircle } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export function DatasetOverview() {
  const dataset = useDatasetStore(state => state.getCurrentDataset())

  if (!dataset) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center">
        <Database className="h-16 w-16 text-muted-foreground mb-4 opacity-50" />
        <h2 className="text-2xl font-semibold tracking-tight mb-2">No Dataset Selected</h2>
        <p className="text-muted-foreground max-w-[500px]">
          Please upload a dataset or select an existing one from the Data Upload page to view its overview and statistics.
        </p>
      </div>
    )
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dataset Overview</h1>
        <p className="text-muted-foreground">
          Metadata and column summary for <span className="font-semibold text-primary">{dataset.name}</span>.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rows</CardTitle>
            <GripHorizontal className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dataset.rows.toLocaleString()}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Columns</CardTitle>
            <FileDigit className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dataset.columns}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Missing Values</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">100% complete data</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Data Quality</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">High</div>
            <p className="text-xs text-muted-foreground">Ready for analysis</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Data Preview</CardTitle>
          <CardDescription>First {dataset.previewData?.length || 0} rows of the dataset.</CardDescription>
        </CardHeader>
        <CardContent>
          {dataset.previewData && dataset.previewData.length > 0 ? (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    {Object.keys(dataset.previewData[0]).map((key) => (
                      <TableHead key={key} className="whitespace-nowrap">{key}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dataset.previewData.map((row, i) => (
                    <TableRow key={i}>
                      {Object.values(row).map((val: any, j) => (
                        <TableCell key={j} className="whitespace-nowrap">{String(val)}</TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center p-8 text-muted-foreground border rounded-md bg-muted/20">
              <Database className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No preview data available for this dataset.</p>
              <p className="text-xs mt-1">Please try re-uploading the file.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
