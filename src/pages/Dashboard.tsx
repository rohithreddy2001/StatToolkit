import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card"
import { 
  Activity, 
  BarChart, 
  Database, 
  FileUp, 
  History,
  ArrowRight
} from "lucide-react"
import { motion } from "framer-motion"
import { useDatasetStore } from "@/store/datasetStore"
import { useNavigate } from "react-router-dom"
export function Dashboard() {
  const datasets = useDatasetStore(state => state.datasets)
  const activityLog = useDatasetStore(state => state.activityLog)
  const setCurrentDataset = useDatasetStore(state => state.setCurrentDataset)
  const navigate = useNavigate()
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  }

  return (
    <motion.div 
      className="space-y-6"
      variants={container}
      initial="hidden"
      animate="show"
    >
      <motion.div variants={item}>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Welcome to StatToolkit ⭐</h1>
        <p className="text-muted-foreground">
          Upload data or resume your recent analysis.
        </p>
      </motion.div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <motion.div variants={item}>
          <Card className="hover:shadow-lg transition-all border-l-4 border-l-blue-500 cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Upload Dataset
              </CardTitle>
              <FileUp className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">New</div>
              <p className="text-xs text-muted-foreground">
                CSV, XLSX, JSON supported
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="hover:shadow-lg transition-all border-l-4 border-l-purple-500 cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Run Analysis
              </CardTitle>
              <Activity className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">32+</div>
              <p className="text-xs text-muted-foreground">
                Statistical & ML tests available
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="hover:shadow-lg transition-all border-l-4 border-l-green-500 cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Visualize Data
              </CardTitle>
              <BarChart className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">14</div>
              <p className="text-xs text-muted-foreground">
                Interactive chart types
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="hover:shadow-lg transition-all border-l-4 border-l-orange-500 cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Recent History
              </CardTitle>
              <History className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activityLog.length}</div>
              <p className="text-xs text-muted-foreground">
                Activities logged
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <motion.div variants={item} className="col-span-4">
          <Card className="h-[400px]">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                {activityLog.length > 0 ? `You have ${activityLog.length} recent activities.` : 'Your recent analysis actions will appear here.'}
              </CardDescription>
            </CardHeader>
            <CardContent className={activityLog.length === 0 ? "flex items-center justify-center h-[300px]" : "h-[300px] overflow-y-auto pt-4"}>
              {activityLog.length === 0 ? (
                <div className="text-center text-muted-foreground">
                  <History className="h-12 w-12 mx-auto mb-4 opacity-20" />
                  No recent activities found.
                </div>
              ) : (
                <div className="space-y-4">
                  {activityLog.slice(0, 10).map((log) => (
                    <div key={log.id} className="flex items-start gap-4 pb-4 border-b last:border-0">
                      <div className={`p-2 rounded-full ${log.type === 'upload' ? 'bg-blue-500/10 text-blue-500' : log.type === 'analysis' ? 'bg-purple-500/10 text-purple-500' : 'bg-primary/10 text-primary'}`}>
                        {log.type === 'upload' ? <FileUp className="h-4 w-4" /> : <Activity className="h-4 w-4" />}
                      </div>
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium leading-none">{log.action}</p>
                        <p className="text-sm text-muted-foreground">{log.details}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(log.timestamp).toLocaleDateString()} {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item} className="col-span-3">
          <Card className="h-[400px]">
            <CardHeader>
              <CardTitle>Datasets</CardTitle>
              <CardDescription>
                Available datasets in your workspace.
              </CardDescription>
            </CardHeader>
            <CardContent className={datasets.length === 0 ? "flex items-center justify-center h-[300px]" : "h-[300px] overflow-y-auto pt-4"}>
              {datasets.length === 0 ? (
                <div className="text-center text-muted-foreground">
                  <Database className="h-12 w-12 mx-auto mb-4 opacity-20" />
                  Upload a dataset to get started.
                </div>
              ) : (
                <div className="space-y-4">
                  {datasets.map(dataset => (
                    <div 
                      key={dataset.id}
                      className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/50 cursor-pointer transition-colors"
                      onClick={() => {
                        setCurrentDataset(dataset.id)
                        navigate("/overview")
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-md">
                          <Database className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium leading-none">{dataset.name}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {dataset.rows} rows • {dataset.columns} columns
                          </p>
                        </div>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground opacity-50" />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  )
}
