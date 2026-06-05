import { useState } from "react"
import { motion } from "framer-motion"
import { useDatasetStore } from "@/store/datasetStore"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Lightbulb, Database, Sparkles, AlertTriangle, TrendingUp, Search } from "lucide-react"

export function AIInsights() {
  const dataset = useDatasetStore(state => state.getCurrentDataset())
  const [isGenerating, setIsGenerating] = useState(false)
  const [report, setReport] = useState<any>(null)

  const generateReport = () => {
    setIsGenerating(true)
    setReport(null)

    // Simulate AI generation time
    setTimeout(() => {
      const numericCols = dataset?.columnMetadata.filter(c => c.type === 'numeric') || []
      const catCols = dataset?.columnMetadata.filter(c => c.type === 'categorical') || []
      
      const anomalies = []
      if (dataset?.rows && dataset.rows > 1000) {
         anomalies.push(`Detected large scale dataset (${dataset.rows} rows). Consider random sampling for faster preliminary analysis.`)
      }
      dataset?.columnMetadata.forEach(c => {
         if (c.missingCount > 0) {
            anomalies.push(`Column "${c.name}" is missing ${c.missingCount} values (${((c.missingCount / (dataset.rows || 1)) * 100).toFixed(1)}%). Consider imputation.`)
         }
      })

      const simulatedReport = {
        summary: `The dataset "${dataset?.name}" contains ${dataset?.rows} rows and ${dataset?.columns} columns. We identified ${numericCols.length} continuous variables suitable for regression or clustering, and ${catCols.length} categorical variables for grouping or classification models.`,
        anomalies: anomalies.length > 0 ? anomalies : ["No significant anomalies or missing values detected. Data quality is excellent."],
        correlations: numericCols.length >= 2 
          ? [`Strong positive correlation predicted between "${numericCols[0].name}" and "${numericCols[1].name}".`]
          : ["Not enough numeric columns to run correlation analysis."],
        recommendations: [
          `Run a K-Means clustering algorithm on your numeric features to discover hidden customer segments.`,
          `Use the Visualization Center to plot a scatter matrix and visually verify these relationships.`
        ]
      }
      
      setReport(simulatedReport)
      setIsGenerating(false)
    }, 2500)
  }

  if (!dataset) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center">
        <Database className="h-16 w-16 text-muted-foreground mb-4 opacity-50" />
        <h2 className="text-2xl font-semibold tracking-tight mb-2">No Dataset Selected</h2>
        <p className="text-muted-foreground max-w-[500px]">
          Upload a dataset to generate automated AI insights.
        </p>
      </div>
    )
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto space-y-6"
    >
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">AI Insights</h1>
          <p className="text-muted-foreground">
            Automated intelligence reports for <span className="font-semibold text-primary">{dataset.name}</span>.
          </p>
        </div>
        <Button onClick={generateReport} disabled={isGenerating}>
          {isGenerating ? <><Sparkles className="mr-2 h-4 w-4 animate-spin" /> Analyzing...</> : <><Sparkles className="mr-2 h-4 w-4" /> Generate New Report</>}
        </Button>
      </div>

      {!report && !isGenerating && (
        <Card className="border-dashed border-2 bg-muted/10">
          <CardContent className="flex flex-col items-center justify-center p-16 text-center text-muted-foreground">
            <Lightbulb className="h-16 w-16 mb-4 opacity-20" />
            <h3 className="text-lg font-medium mb-1">Generate AI Report</h3>
            <p className="max-w-sm mb-6">Click the button above to let StatToolkit ⭐ scan your dataset and generate a comprehensive executive summary.</p>
          </CardContent>
        </Card>
      )}

      {isGenerating && (
        <div className="flex flex-col items-center justify-center py-20 text-primary">
          <div className="relative">
            <div className="absolute inset-0 rounded-full blur-xl bg-primary/30 animate-pulse"></div>
            <Search className="h-16 w-16 animate-bounce relative z-10" />
          </div>
          <h3 className="text-xl font-bold mt-6 mb-2">Scanning Data Topology</h3>
          <p className="text-muted-foreground animate-pulse">Running exploratory data analysis and anomaly detection...</p>
        </div>
      )}

      {report && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="grid gap-6"
        >
          <Card className="border-l-4 border-l-blue-500 shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5 text-blue-500" />
                Executive Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="leading-relaxed">{report.summary}</p>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-6">
            <Card className="border-t-4 border-t-orange-500 shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-orange-500" />
                  Data Quality & Anomalies
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 list-disc pl-5">
                  {report.anomalies.map((a: string, i: number) => (
                    <li key={i} className="text-sm">{a}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="border-t-4 border-t-green-500 shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                  Detected Patterns
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 list-disc pl-5">
                  {report.correlations.map((c: string, i: number) => (
                    <li key={i} className="text-sm">{c}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          <Card className="border-l-4 border-l-purple-500 shadow-md bg-purple-500/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-500" />
                Recommended Next Steps
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 list-disc pl-5">
                {report.recommendations.map((r: string, i: number) => (
                  <li key={i} className="font-medium text-sm text-foreground/90">{r}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </motion.div>
  )
}
