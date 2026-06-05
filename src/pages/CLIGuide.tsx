import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Terminal, Copy, CheckCircle2 } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"

export function CLIGuide() {
  const [copiedPython, setCopiedPython] = useState(false)
  const [copiedNode, setCopiedNode] = useState(false)

  const pythonCode = `import requests
import json

# Your StatToolkit ⭐ local server endpoint
url = "http://localhost:5173/api/upload"

# Read your dataset
with open('data.csv', 'rb') as f:
    files = {'file': ('data.csv', f, 'text/csv')}
    response = requests.post(url, files=files)

print("Upload Success:", response.json())`

  const nodeCode = `const FormData = require('form-data');
const fs = require('fs');
const axios = require('axios');

const form = new FormData();
form.append('file', fs.createReadStream('data.csv'));

axios.post('http://localhost:5173/api/upload', form, {
    headers: form.getHeaders(),
}).then(response => {
    console.log("Upload Success:", response.data);
}).catch(error => {
    console.error(error);
});`

  const handleCopy = (code: string, type: 'python' | 'node') => {
    navigator.clipboard.writeText(code)
    if (type === 'python') {
      setCopiedPython(true)
      setTimeout(() => setCopiedPython(false), 2000)
    } else {
      setCopiedNode(true)
      setTimeout(() => setCopiedNode(false), 2000)
    }
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto space-y-6"
    >
      <div>
        <h1 className="text-3xl font-bold tracking-tight">CLI & API Guide</h1>
        <p className="text-muted-foreground">
          Automate your data pipelines by uploading datasets directly from your terminal or scripts.
        </p>
      </div>

      <Card className="border-l-4 border-l-blue-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Terminal className="h-5 w-5 text-blue-500" />
            StatToolkit ⭐ Upload API
          </CardTitle>
          <CardDescription>
            The StatToolkit ⭐ local server listens for `multipart/form-data` POST requests. You can push datasets directly into your workspace from your external Python models or Node.js backends.
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Python</CardTitle>
              <CardDescription>Using the requests library</CardDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={() => handleCopy(pythonCode, 'python')}>
              {copiedPython ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
            </Button>
          </CardHeader>
          <CardContent>
            <div className="bg-[#0f111a] p-4 rounded-md overflow-x-auto text-sm font-mono text-green-400">
              <pre>{pythonCode}</pre>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Node.js</CardTitle>
              <CardDescription>Using axios and form-data</CardDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={() => handleCopy(nodeCode, 'node')}>
              {copiedNode ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
            </Button>
          </CardHeader>
          <CardContent>
            <div className="bg-[#0f111a] p-4 rounded-md overflow-x-auto text-sm font-mono text-blue-400">
              <pre>{nodeCode}</pre>
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  )
}
