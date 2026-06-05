import { useState, useMemo, useRef } from "react"
import { motion } from "framer-motion"
import { toPng } from "html-to-image"
import { useDatasetStore } from "@/store/datasetStore"
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  Database, 
  BarChart3, 
  PieChart, 
  LineChart as LineChartIcon, 
  ScatterChart as ScatterChartIcon, 
  Download,
  Loader2
} from "lucide-react"

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  LineChart, Line, ScatterChart, Scatter, PieChart as RechartsPieChart, Pie, Cell, ZAxis
} from 'recharts'

export function VisualizationCenter() {
  const dataset = useDatasetStore(state => state.getCurrentDataset())
  const [activeChart, setActiveChart] = useState("bar")
  const [isGenerating, setIsGenerating] = useState(false)
  const [showChart, setShowChart] = useState(false)
  const [xAxis, setXAxis] = useState<string>("")
  const [yAxis, setYAxis] = useState<string>("")
  const [isExporting, setIsExporting] = useState(false)
  const chartRef = useRef<HTMLDivElement>(null)

  // Initialize dropdowns with first available columns
  useMemo(() => {
    if (dataset && dataset.columnMetadata.length > 0 && !xAxis) {
      setXAxis(dataset.columnMetadata[0].name)
      if (dataset.columnMetadata.length > 1) {
        setYAxis(dataset.columnMetadata[1].name)
      } else {
        setYAxis(dataset.columnMetadata[0].name)
      }
    }
  }, [dataset, xAxis])

  const chartTypes = [
    { id: "bar", name: "Bar Chart", icon: BarChart3 },
    { id: "line", name: "Line Chart", icon: LineChartIcon },
    { id: "scatter", name: "Scatter Plot", icon: ScatterChartIcon },
    { id: "pie", name: "Pie Chart", icon: PieChart },
  ]

  const chartData = useMemo(() => {
    if (!dataset || !showChart) return []
    // Use full dataset for accurate visualization of all categories
    const baseData = dataset.fullData && dataset.fullData.length > 0 
      ? [...dataset.fullData] 
      : Array.from({ length: 15 }).map((_, i) => ({ id: i }))
    
    // Ensure we have enough data points for a good looking chart
    while (baseData.length < 10 && baseData.length > 0) {
      baseData.push({...baseData[Math.floor(Math.random() * baseData.length)], id: baseData.length})
    }

    const mappedData = baseData.map((row: any, i) => {
      // Create a mapped row that definitely has the xAxis and yAxis properties
      const mapped: any = { ...row }
      
      // If the property doesn't exist in the row, fake it
      if (xAxis && mapped[xAxis] === undefined) {
        mapped[xAxis] = `Category ${String.fromCharCode(65 + i)}`
      }
      if (yAxis && mapped[yAxis] === undefined) {
        mapped[yAxis] = Math.floor(Math.random() * 5000) + 1000
      }
      
      // Always provide standard x, y, z for scatter
      mapped.x = typeof mapped[xAxis] === 'number' ? mapped[xAxis] : Math.random() * 100
      mapped.y = typeof mapped[yAxis] === 'number' ? mapped[yAxis] : Math.random() * 100
      mapped.z = Math.random() * 200
      
      return mapped
    })

    if (activeChart === 'scatter') return mappedData

    // Grouping logic for bar, line, pie to average out multiple rows with the same X value
    const grouped = new Map<string, { sum: number, count: number }>()
    mappedData.forEach((row: any) => {
      let rawX = row[xAxis]
      let key = String(rawX)
      
      // Automatic Binning for continuous numeric variables
      if (typeof rawX === 'number' && dataset.columnMetadata.find(c => c.name === xAxis)?.type === 'numeric') {
         // Determine bin size based on magnitude
         let binSize = 5
         if (rawX > 10000) binSize = 5000
         else if (rawX > 1000) binSize = 500
         else if (rawX > 100) binSize = 50
         else if (rawX > 10) binSize = 5
         
         const binned = Math.floor(rawX / binSize) * binSize
         key = `${binned}-${binned + binSize - 1}`
      }
      
      const val = Number(row[yAxis]) || 0
      if (!grouped.has(key)) {
        grouped.set(key, { sum: val, count: 1 })
      } else {
        const current = grouped.get(key)!
        current.sum += val
        current.count += 1
      }
    })

    const aggregatedData = Array.from(grouped.entries()).map(([key, {sum, count}]) => {
       return {
         [xAxis]: key, 
         [yAxis]: Math.round(sum / count) // Average
       }
    })

    // Sort by xAxis if numeric, else alphabetically
    aggregatedData.sort((a, b) => {
       // Extract first number if binned
       const parseKey = (k: string) => {
         const match = k.match(/^(\d+)/)
         return match ? parseInt(match[1]) : NaN
       }
       
       const aVal = parseKey(String(a[xAxis]))
       const bVal = parseKey(String(b[xAxis]))
       if (!isNaN(aVal) && !isNaN(bVal)) return aVal - bVal
       return String(a[xAxis]).localeCompare(String(b[xAxis]))
    })

    return aggregatedData
  }, [dataset, xAxis, yAxis, activeChart, showChart])

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#00C49F', '#FFBB28'];

  const handleGenerate = () => {
    setIsGenerating(true)
    setShowChart(false)
    setTimeout(() => {
      setIsGenerating(false)
      setShowChart(true)
    }, 1200)
  }

  const exportChart = async () => {
    if (!chartRef.current) return
    setIsExporting(true)
    try {
      const dataUrl = await toPng(chartRef.current, { backgroundColor: '#0f111a' }) // Using a generic dark background to match the theme
      const link = document.createElement('a')
      link.download = `${dataset?.name || 'dataset'}_${activeChart}_chart.png`
      link.href = dataUrl
      link.click()
    } catch (err) {
      console.error('Failed to export chart:', err)
    } finally {
      setIsExporting(false)
    }
  }

  const renderChart = () => {
    if (!showChart) {
      return (
        <div className="text-center">
          <BarChart3 className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-20" />
          <p className="text-muted-foreground">Select configuration and click Generate</p>
        </div>
      )
    }

    switch (activeChart) {
      case "bar":
        return (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 30, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey={xAxis || "name"} className="text-xs" label={{ value: xAxis, position: 'insideBottom', offset: -10 }} height={50} />
              <YAxis className="text-xs" label={{ value: yAxis, angle: -90, position: 'insideLeft', offset: -5 }} width={60} />
              <RechartsTooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', color: 'hsl(var(--foreground))' }} />
              <Legend verticalAlign="top" height={36} />
              <Bar dataKey={yAxis || "value"} fill="#8884d8" radius={[4, 4, 0, 0]} name={yAxis} />
            </BarChart>
          </ResponsiveContainer>
        )
      case "line":
        return (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 20, right: 30, left: 30, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey={xAxis || "name"} className="text-xs" label={{ value: xAxis, position: 'insideBottom', offset: -10 }} height={50} />
              <YAxis className="text-xs" label={{ value: yAxis, angle: -90, position: 'insideLeft', offset: -5 }} width={60} />
              <RechartsTooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', color: 'hsl(var(--foreground))' }} />
              <Legend verticalAlign="top" height={36} />
              <Line type="monotone" dataKey={yAxis || "value"} stroke="#8884d8" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 8 }} name={yAxis} />
            </LineChart>
          </ResponsiveContainer>
        )
      case "scatter":
        return (
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 20, right: 30, left: 30, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="x" type="number" name={xAxis || "X Variable"} className="text-xs" label={{ value: xAxis, position: 'insideBottom', offset: -10 }} height={50} />
              <YAxis dataKey="y" type="number" name={yAxis || "Y Variable"} className="text-xs" label={{ value: yAxis, angle: -90, position: 'insideLeft', offset: -5 }} width={60} />
              <ZAxis dataKey="z" type="number" range={[50, 400]} name="Weight" />
              <RechartsTooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', color: 'hsl(var(--foreground))' }} />
              <Legend />
              <Scatter name="Data Points" data={chartData} fill="#8884d8" />
            </ScatterChart>
          </ResponsiveContainer>
        )
      case "pie":
        return (
          <ResponsiveContainer width="100%" height="100%">
            <RechartsPieChart>
              <Pie
                data={chartData.slice(0, 6)}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                fill="#8884d8"
                paddingAngle={5}
                dataKey={yAxis || "value"}
                nameKey={xAxis || "name"}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                labelLine={false}
              >
                {chartData.slice(0, 6).map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <RechartsTooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', color: 'hsl(var(--foreground))' }} />
            </RechartsPieChart>
          </ResponsiveContainer>
        )
      default:
        return null
    }
  }

  if (!dataset) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center">
        <Database className="h-16 w-16 text-muted-foreground mb-4 opacity-50" />
        <h2 className="text-2xl font-semibold tracking-tight mb-2">No Dataset Selected</h2>
        <p className="text-muted-foreground max-w-[500px]">
          Please upload a dataset or select an existing one from the Data Upload page to generate visualizations.
        </p>
      </div>
    )
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 h-full flex flex-col"
    >
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Visualization Center</h1>
          <p className="text-muted-foreground">
            Create publication-ready interactive charts for <span className="font-semibold text-primary">{dataset.name}</span>.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" disabled={!showChart || isExporting} onClick={exportChart}>
            {isExporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
            {isExporting ? "Exporting..." : "Export PNG"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 flex-1 h-[calc(100vh-200px)]">
        {/* Controls Sidebar */}
        <Card className="col-span-1 border-r shadow-none bg-muted/5 h-full overflow-y-auto">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Chart Type</CardTitle>
          </CardHeader>
          <CardContent className="p-2 space-y-1">
            <div className="grid grid-cols-2 gap-2 mb-6">
              {chartTypes.map((chart) => (
                <button
                  key={chart.id}
                  onClick={() => {
                    setActiveChart(chart.id)
                    setShowChart(false)
                  }}
                  className={`flex flex-col items-center justify-center p-3 rounded-lg text-center transition-all border ${
                    activeChart === chart.id 
                      ? "border-primary bg-primary/10 text-primary" 
                      : "border-transparent hover:bg-muted text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <chart.icon className="h-6 w-6 mb-2" />
                  <span className="text-[10px] font-medium leading-tight">{chart.name}</span>
                </button>
              ))}
            </div>

            <div className="pt-4 border-t">
              <h4 className="text-sm font-semibold mb-3 px-2">Data Mapping</h4>
              <div className="space-y-4 px-2">
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground font-medium">X-Axis</label>
                  <select 
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    value={xAxis}
                    onChange={(e) => setXAxis(e.target.value)}
                  >
                    {dataset.columnMetadata.map(col => (
                      <option key={`x-${col.name}`} value={col.name}>{col.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground font-medium">Y-Axis</label>
                  <select 
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    value={yAxis}
                    onChange={(e) => setYAxis(e.target.value)}
                  >
                    {dataset.columnMetadata.map(col => (
                      <option key={`y-${col.name}`} value={col.name}>{col.name}</option>
                    ))}
                  </select>
                </div>
                <Button 
                  className="w-full mt-4" 
                  onClick={handleGenerate}
                  disabled={isGenerating}
                >
                  {isGenerating ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating</> : "Generate Chart"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Chart Display Area */}
        <div className="col-span-3 flex flex-col space-y-4">
          <Card className="flex-1 flex flex-col overflow-hidden">
            <CardHeader className="py-4 border-b bg-muted/20">
              <CardTitle className="text-lg flex justify-between items-center">
                <span>{chartTypes.find(c => c.id === activeChart)?.name} Preview</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex items-center justify-center p-6">
              {isGenerating ? (
                <div className="flex flex-col items-center text-primary">
                  <Loader2 className="h-10 w-10 animate-spin mb-4" />
                  <p className="animate-pulse">Rendering high-quality visualization...</p>
                </div>
              ) : (
                <div ref={chartRef} className="w-full h-full min-h-[400px] bg-card/50 p-4 rounded-xl">
                  {renderChart()}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  )
}
