import { useState } from "react"
import { motion } from "framer-motion"
import { useDatasetStore } from "@/store/datasetStore"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Database, Clock, Type, Loader2, CalendarRange, Network, Activity, BarChart2 } from "lucide-react"
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts'
import { linearRegression, mean, standardDeviation, min, max } from 'simple-statistics'

export function AdvancedAnalysis() {
  const dataset = useDatasetStore(state => state.getCurrentDataset())
  const [activeTab, setActiveTab] = useState<"timeseries" | "nlp" | "distributions" | "clt">("timeseries")
  const [isComputing, setIsComputing] = useState(false)
  const [results, setResults] = useState<any>(null)
  
  const [tsTimeVar, setTsTimeVar] = useState("")
  const [tsTargetVar, setTsTargetVar] = useState("")
  const [nlpTextVar, setNlpTextVar] = useState("")
  const [distVar, setDistVar] = useState("")
  const [cltVar, setCltVar] = useState("")
  const [cltSampleSize, setCltSampleSize] = useState("30")
  const [cltSimulations, setCltSimulations] = useState("1000")

  const runTimeSeries = () => {
    setIsComputing(true)
    setResults(null)
    
    const dataPoints = (dataset?.fullData || []).map((row: any, i: number) => [i, Number(row[tsTargetVar]) || 0])
    let trendStr = "Neutral"
    let chartData: any[] = []
    
    if (dataPoints.length > 0) {
      const regression = linearRegression(dataPoints)
      trendStr = regression.m > 0 ? `Positive (+${regression.m.toFixed(2)})` : `Negative (${regression.m.toFixed(2)})`
      chartData = (dataset?.fullData || []).map((row: any) => ({
        time: row[tsTimeVar],
        value: Number(row[tsTargetVar]) || 0
      }))
    }

    setTimeout(() => {
      setResults({
        type: 'timeseries',
        title: `Linear Trend Forecast: ${tsTargetVar} over ${tsTimeVar}`,
        chartData,
        data: [
          { metric: "Model Selected", value: "Linear Regression" },
          { metric: "Data Points", value: dataPoints.length },
          { metric: "Trend Detected", value: trendStr },
          { metric: "Target Variable", value: tsTargetVar }
        ]
      })
      setIsComputing(false)
    }, 1000)
  }

  const runNLP = () => {
    setIsComputing(true)
    setResults(null)
    
    const words = (dataset?.fullData || []).map((row: any) => String(row[nlpTextVar] || '').toLowerCase().trim())
    const frequencies: Record<string, number> = {}
    words.forEach(w => {
      if (w) frequencies[w] = (frequencies[w] || 0) + 1
    })
    
    const sortedWords = Object.entries(frequencies).sort((a,b) => b[1] - a[1])
    const topKeywords = sortedWords.slice(0, 4).map(e => e[0]).join(', ')
    const chartData = sortedWords.slice(0, 10).map(([word, count]) => ({ word, count }))

    setTimeout(() => {
      setResults({
        type: 'nlp',
        title: `Text/Categorical Analysis: ${nlpTextVar}`,
        chartData,
        data: [
          { metric: "Total Documents", value: words.length },
          { metric: "Unique Categories", value: sortedWords.length },
          { metric: "Top Keywords", value: topKeywords || "None" },
          { metric: "Dominant Category", value: sortedWords[0]?.[0] || "N/A" }
        ]
      })
      setIsComputing(false)
    }, 1000)
  }

  const runDistributions = () => {
    setIsComputing(true)
    setResults(null)
    
    setTimeout(() => {
      const isNumeric = dataset?.columnMetadata.find(c => c.name === distVar)?.type === 'numeric'
      
      let chartData: any[] = []
      let metrics: any[] = []
      let distType = ''

      if (isNumeric) {
        distType = 'Probability Density Function (PDF)'
        const values = (dataset?.fullData || []).map((r: any) => Number(r[distVar])).filter(v => !isNaN(v))
        if (values.length > 0) {
           const mu = mean(values)
           const sigma = standardDeviation(values) || 1
           
           const minVal = min(values)
           const maxVal = max(values)
           const step = (maxVal - minVal) / 50
           
           for(let x = minVal; x <= maxVal; x += step) {
             const exponent = Math.exp(-Math.pow(x - mu, 2) / (2 * Math.pow(sigma, 2)))
             const density = (1 / (sigma * Math.sqrt(2 * Math.PI))) * exponent
             chartData.push({ x: x.toFixed(2), value: density })
           }
           
           metrics = [
             { metric: "Distribution Type", value: "Continuous (PDF)" },
             { metric: "Mean (μ)", value: mu.toFixed(2) },
             { metric: "Std Dev (σ)", value: sigma.toFixed(2) }
           ]
        }
      } else {
        distType = 'Probability Mass Function (PMF)'
        const values = (dataset?.fullData || []).map((r: any) => String(r[distVar] || ''))
        const counts: Record<string, number> = {}
        values.forEach(v => counts[v] = (counts[v] || 0) + 1)
        
        const total = values.length
        chartData = Object.entries(counts).map(([cat, count]) => ({
          x: cat,
          value: count / total
        })).sort((a,b) => b.value - a.value).slice(0, 15)
        
        metrics = [
           { metric: "Distribution Type", value: "Discrete (PMF)" },
           { metric: "Total Categories", value: Object.keys(counts).length },
           { metric: "Highest Prob", value: `${((chartData[0]?.value || 0) * 100).toFixed(1)}%` }
        ]
      }

      setResults({
        type: 'distributions',
        isNumeric,
        title: `${distType}: ${distVar}`,
        chartData,
        data: metrics
      })
      setIsComputing(false)
    }, 1000)
  }

  const runCLT = () => {
    setIsComputing(true)
    setResults(null)
    
    setTimeout(() => {
      const values = (dataset?.fullData || []).map((r: any) => Number(r[cltVar])).filter(v => !isNaN(v))
      if (values.length === 0) {
         setIsComputing(false)
         return
      }

      const sampleSize = parseInt(cltSampleSize) || 30
      const simulations = parseInt(cltSimulations) || 1000
      
      const sampleMeans = []
      for(let i = 0; i < simulations; i++) {
         let sum = 0;
         for(let j = 0; j < sampleSize; j++) {
            sum += values[Math.floor(Math.random() * values.length)]
         }
         sampleMeans.push(sum / sampleSize)
      }
      
      const overallMean = mean(sampleMeans)
      const overallStd = standardDeviation(sampleMeans)
      
      const minM = min(sampleMeans)
      const maxM = max(sampleMeans)
      const numBins = 20
      const binWidth = (maxM - minM) / numBins
      
      const bins = Array.from({length: numBins}, (_, i) => ({
         x: (minM + i * binWidth).toFixed(2),
         value: 0
      }))
      
      sampleMeans.forEach(m => {
         let binIdx = Math.floor((m - minM) / binWidth)
         if (binIdx >= numBins) binIdx = numBins - 1
         bins[binIdx].value++
      })

      setResults({
        type: 'clt',
        title: `Central Limit Theorem: ${cltVar}`,
        chartData: bins,
        data: [
          { metric: "Simulations (M)", value: simulations },
          { metric: "Sample Size (N)", value: sampleSize },
          { metric: "Mean of Means (μ)", value: overallMean.toFixed(2) },
          { metric: "Standard Error", value: overallStd.toFixed(2) }
        ]
      })
      setIsComputing(false)
    }, 1500)
  }

  if (!dataset) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center">
        <Database className="h-16 w-16 text-muted-foreground mb-4 opacity-50" />
        <h2 className="text-2xl font-semibold tracking-tight mb-2">No Dataset Selected</h2>
        <p className="text-muted-foreground max-w-[500px]">
          Upload a dataset to run advanced analytical models.
        </p>
      </div>
    )
  }

  const numericCols = dataset.columnMetadata.filter(c => c.type === 'numeric')

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 h-full flex flex-col"
    >
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Advanced Analysis</h1>
        <p className="text-muted-foreground">
          Specialized modeling engines for complex data patterns.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 flex-1 h-[calc(100vh-200px)]">
        <Card className="col-span-1 border-r shadow-none bg-muted/10 h-full overflow-y-auto">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Models</CardTitle>
          </CardHeader>
          <CardContent className="p-2 space-y-1">
            <button
              onClick={() => { setActiveTab("timeseries"); setResults(null); }}
              className={`w-full flex items-start p-3 rounded-lg text-left transition-all ${
                activeTab === "timeseries" 
                  ? "bg-primary text-primary-foreground shadow-md" 
                  : "hover:bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              <Clock className={`h-5 w-5 mt-0.5 mr-3 ${activeTab === "timeseries" ? "opacity-100" : "opacity-70"}`} />
              <div>
                <div className="font-medium text-sm">Time Series</div>
                <div className={`text-xs mt-0.5 ${activeTab === "timeseries" ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                  Linear Forecast Trends
                </div>
              </div>
            </button>

            <button
              onClick={() => { setActiveTab("nlp"); setResults(null); }}
              className={`w-full flex items-start p-3 rounded-lg text-left transition-all ${
                activeTab === "nlp" 
                  ? "bg-primary text-primary-foreground shadow-md" 
                  : "hover:bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              <Type className={`h-5 w-5 mt-0.5 mr-3 ${activeTab === "nlp" ? "opacity-100" : "opacity-70"}`} />
              <div>
                <div className="font-medium text-sm">Text Analysis</div>
                <div className={`text-xs mt-0.5 ${activeTab === "nlp" ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                  Corpus Frequencies
                </div>
              </div>
            </button>

            <button
              onClick={() => { setActiveTab("distributions"); setResults(null); }}
              className={`w-full flex items-start p-3 rounded-lg text-left transition-all ${
                activeTab === "distributions" 
                  ? "bg-primary text-primary-foreground shadow-md" 
                  : "hover:bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              <BarChart2 className={`h-5 w-5 mt-0.5 mr-3 ${activeTab === "distributions" ? "opacity-100" : "opacity-70"}`} />
              <div>
                <div className="font-medium text-sm">Distributions</div>
                <div className={`text-xs mt-0.5 ${activeTab === "distributions" ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                  PDF & PMF Curves
                </div>
              </div>
            </button>

            <button
              onClick={() => { setActiveTab("clt"); setResults(null); }}
              className={`w-full flex items-start p-3 rounded-lg text-left transition-all ${
                activeTab === "clt" 
                  ? "bg-primary text-primary-foreground shadow-md" 
                  : "hover:bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              <Activity className={`h-5 w-5 mt-0.5 mr-3 ${activeTab === "clt" ? "opacity-100" : "opacity-70"}`} />
              <div>
                <div className="font-medium text-sm">Central Limit</div>
                <div className={`text-xs mt-0.5 ${activeTab === "clt" ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                  Monte Carlo Sampling
                </div>
              </div>
            </button>
          </CardContent>
        </Card>

        <div className="col-span-3 flex flex-col space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>
                {activeTab === 'timeseries' && 'Time Series Forecasting'}
                {activeTab === 'nlp' && 'Text & Categorical Analysis'}
                {activeTab === 'distributions' && 'Probability Distributions'}
                {activeTab === 'clt' && 'Central Limit Theorem Simulator'}
              </CardTitle>
              <CardDescription>Configure parameters for the model</CardDescription>
            </CardHeader>
            <CardContent>
              {activeTab === 'timeseries' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-medium">Time Variable (Index)</label>
                      <select 
                        className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
                        value={tsTimeVar}
                        onChange={(e) => setTsTimeVar(e.target.value)}
                      >
                        <option value="" disabled>Select time column...</option>
                        {dataset.columnMetadata.map(col => (
                          <option key={col.name} value={col.name}>{col.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium">Target Variable (Forecast)</label>
                      <select 
                        className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
                        value={tsTargetVar}
                        onChange={(e) => setTsTargetVar(e.target.value)}
                      >
                        <option value="" disabled>Select numeric target...</option>
                        {numericCols.map(col => (
                          <option key={col.name} value={col.name}>{col.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <Button className="w-full" onClick={runTimeSeries} disabled={isComputing || !tsTimeVar || !tsTargetVar}>
                    {isComputing ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Computing...</> : "Run Forecast Model"}
                  </Button>
                </div>
              )}

              {activeTab === 'nlp' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-medium">Text/Categorical Feature</label>
                      <select 
                        className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
                        value={nlpTextVar}
                        onChange={(e) => setNlpTextVar(e.target.value)}
                      >
                        <option value="" disabled>Select text column...</option>
                        {dataset.columnMetadata.map(col => (
                          <option key={col.name} value={col.name}>{col.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <Button className="w-full" onClick={runNLP} disabled={isComputing || !nlpTextVar}>
                    {isComputing ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyzing...</> : "Run Text Analysis"}
                  </Button>
                </div>
              )}

              {activeTab === 'distributions' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-medium">Select Variable</label>
                      <select 
                        className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
                        value={distVar}
                        onChange={(e) => setDistVar(e.target.value)}
                      >
                        <option value="" disabled>Select any column...</option>
                        {dataset.columnMetadata.map(col => (
                          <option key={col.name} value={col.name}>{col.name} ({col.type})</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <Button className="w-full" onClick={runDistributions} disabled={isComputing || !distVar}>
                    {isComputing ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Computing Probabilities...</> : "Generate Distribution Curve"}
                  </Button>
                </div>
              )}

              {activeTab === 'clt' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-medium">Numeric Variable</label>
                      <select 
                        className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
                        value={cltVar}
                        onChange={(e) => setCltVar(e.target.value)}
                      >
                        <option value="" disabled>Select numeric...</option>
                        {numericCols.map(col => (
                          <option key={col.name} value={col.name}>{col.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium">Sample Size (N)</label>
                      <input 
                        type="number"
                        className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
                        value={cltSampleSize}
                        onChange={(e) => setCltSampleSize(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium">Simulations (M)</label>
                      <input 
                        type="number"
                        className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
                        value={cltSimulations}
                        onChange={(e) => setCltSimulations(e.target.value)}
                      />
                    </div>
                  </div>
                  <Button className="w-full" onClick={runCLT} disabled={isComputing || !cltVar}>
                    {isComputing ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Simulating...</> : "Run Monte Carlo Simulation"}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="flex-1 overflow-hidden flex flex-col">
            <CardHeader className="py-4 border-b bg-muted/20">
              <CardTitle className="text-lg">Model Output</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 p-0 overflow-auto">
              {isComputing ? (
                <div className="h-full flex flex-col items-center justify-center text-primary p-8">
                  <Loader2 className="h-10 w-10 animate-spin mb-4" />
                  <p className="animate-pulse">Running advanced calculations...</p>
                </div>
              ) : results ? (
                <div className="p-6">
                  <h3 className="font-bold text-xl mb-6 flex items-center gap-2">
                    {results.type === 'timeseries' && <CalendarRange className="h-6 w-6 text-blue-500" />}
                    {results.type === 'nlp' && <Network className="h-6 w-6 text-purple-500" />}
                    {results.type === 'distributions' && <BarChart2 className="h-6 w-6 text-green-500" />}
                    {results.type === 'clt' && <Activity className="h-6 w-6 text-orange-500" />}
                    {results.title}
                  </h3>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    {results.data.map((item: any, i: number) => (
                      <div key={i} className="p-4 border rounded-lg bg-card">
                        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">{item.metric}</p>
                        <p className="text-lg font-semibold">{item.value}</p>
                      </div>
                    ))}
                  </div>
                  
                  <div className="h-64 mt-4 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      {results.type === 'timeseries' ? (
                        <LineChart data={results.chartData}>
                          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                          <XAxis dataKey="time" className="text-xs" />
                          <YAxis className="text-xs" width={40} />
                          <RechartsTooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', color: 'hsl(var(--foreground))' }} />
                          <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} dot={{ r: 2 }} name={results.data[3].value} />
                        </LineChart>
                      ) : results.type === 'nlp' ? (
                        <BarChart data={results.chartData}>
                          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                          <XAxis dataKey="word" className="text-xs" />
                          <YAxis className="text-xs" width={40} />
                          <RechartsTooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', color: 'hsl(var(--foreground))' }} />
                          <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Frequency" />
                        </BarChart>
                      ) : results.type === 'distributions' && results.isNumeric ? (
                        <LineChart data={results.chartData}>
                          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                          <XAxis dataKey="x" className="text-xs" />
                          <YAxis className="text-xs" width={40} />
                          <RechartsTooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', color: 'hsl(var(--foreground))' }} />
                          <Line type="monotone" dataKey="value" stroke="#10b981" strokeWidth={3} dot={false} name="Density (PDF)" fill="#10b981" fillOpacity={0.2} />
                        </LineChart>
                      ) : results.type === 'distributions' && !results.isNumeric ? (
                        <BarChart data={results.chartData}>
                          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                          <XAxis dataKey="x" className="text-xs" />
                          <YAxis className="text-xs" width={40} />
                          <RechartsTooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', color: 'hsl(var(--foreground))' }} />
                          <Bar dataKey="value" fill="#10b981" radius={[4, 4, 0, 0]} name="Probability (PMF)" />
                        </BarChart>
                      ) : (
                        <BarChart data={results.chartData}>
                          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                          <XAxis dataKey="x" className="text-xs" />
                          <YAxis className="text-xs" width={40} />
                          <RechartsTooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', color: 'hsl(var(--foreground))' }} />
                          <Bar dataKey="value" fill="#f97316" radius={[4, 4, 0, 0]} name="Sample Means Frequency" />
                        </BarChart>
                      )}
                    </ResponsiveContainer>
                  </div>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center p-8 text-muted-foreground">
                  <p>Configure and run a model to generate insights.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  )
}
