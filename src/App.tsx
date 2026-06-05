import { BrowserRouter, Routes, Route } from "react-router-dom"
import { MainLayout } from "./layouts/MainLayout"
import { Dashboard } from "./pages/Dashboard"
import { DataUpload } from "./pages/DataUpload"
import { DatasetOverview } from "./pages/DatasetOverview"
import { Statistics } from "./pages/Statistics"
import { MachineLearning } from "./pages/MachineLearning"
import { VisualizationCenter } from "./pages/VisualizationCenter"
import { History } from "./pages/History"
import { CLIGuide } from "./pages/CLIGuide"
import { AIInsights } from "./pages/AIInsights"
import { AdvancedAnalysis } from "./pages/AdvancedAnalysis"
import { Toaster } from "@/components/ui/toaster"

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="upload" element={<DataUpload />} />
            <Route path="overview" element={<DatasetOverview />} />
            <Route path="statistics" element={<Statistics />} />
            <Route path="ml" element={<MachineLearning />} />
            <Route path="visualizations" element={<VisualizationCenter />} />
            <Route path="advanced" element={<AdvancedAnalysis />} />
            <Route path="insights" element={<AIInsights />} />
            <Route path="history" element={<History />} />
            <Route path="cli" element={<CLIGuide />} />
          </Route>
        </Routes>
      </BrowserRouter>
      <Toaster />
    </>
  )
}

export default App
