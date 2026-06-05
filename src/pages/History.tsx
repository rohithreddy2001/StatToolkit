import { useDatasetStore } from "@/store/datasetStore"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { History as HistoryIcon, FileUp, Activity, Settings, BarChart } from "lucide-react"

export function History() {
  const activityLog = useDatasetStore(state => state.activityLog)

  const getIcon = (type: string) => {
    switch (type) {
      case 'upload': return <FileUp className="h-4 w-4" />
      case 'analysis': return <Activity className="h-4 w-4" />
      case 'ml': return <Settings className="h-4 w-4" />
      case 'visualization': return <BarChart className="h-4 w-4" />
      default: return <HistoryIcon className="h-4 w-4" />
    }
  }

  const getColor = (type: string) => {
    switch (type) {
      case 'upload': return 'bg-blue-500/10 text-blue-500'
      case 'analysis': return 'bg-purple-500/10 text-purple-500'
      case 'ml': return 'bg-orange-500/10 text-orange-500'
      case 'visualization': return 'bg-green-500/10 text-green-500'
      default: return 'bg-primary/10 text-primary'
    }
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto space-y-6"
    >
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analysis History</h1>
        <p className="text-muted-foreground">
          A complete timeline of your actions, dataset uploads, and executed tests.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Activity Timeline</CardTitle>
          <CardDescription>All recorded actions in your current workspace</CardDescription>
        </CardHeader>
        <CardContent>
          {activityLog.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground">
              <HistoryIcon className="h-16 w-16 mb-4 opacity-20" />
              <h3 className="text-lg font-medium mb-1">No History Yet</h3>
              <p className="max-w-sm">Upload a dataset and run some analyses to see your activity timeline here.</p>
            </div>
          ) : (
            <div className="space-y-8 pl-4 border-l-2 border-muted relative before:absolute before:inset-0 before:ml-[-1px]">
              {activityLog.map((log) => (
                <div key={log.id} className="relative">
                  <span className={`absolute -left-[35px] flex h-8 w-8 items-center justify-center rounded-full ring-8 ring-background ${getColor(log.type)}`}>
                    {getIcon(log.type)}
                  </span>
                  <div className="flex flex-col flex-1 pl-4 space-y-1">
                    <div className="flex items-center justify-between">
                      <h3 className="text-md font-semibold">{log.action}</h3>
                      <time className="text-xs text-muted-foreground">
                        {new Date(log.timestamp).toLocaleString(undefined, {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </time>
                    </div>
                    <p className="text-sm text-muted-foreground">{log.details}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
