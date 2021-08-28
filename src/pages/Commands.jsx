import { useState } from 'react'
import utxoninja from 'utxoninja'
import {
  Typography,
  TextField,
  Button,
  Select,
  MenuItem
} from '@material-ui/core'

const Commands = () => {
  const possibleCommands = Object.keys(utxoninja)
  const [command, setCommand] = useState(0)
  const [params, setParams] = useState('')
  const [results, setResults] = useState('')
  const [running, setRunning] = useState(false)

  const handleRunClick = async () => {
    try {
      setRunning(true)
      const parsedParams = params ? JSON.parse(params) : {}
      const runResult = await utxoninja[possibleCommands[command]]({
        xprivKey: window.localStorage.xprivKey,
        ...parsedParams
      })
      setResults(JSON.stringify(runResult, null, 2))
    } catch (e) {
      window.alert('Error: ' + e.message)
      console.error(e)
    } finally {
      setRunning(false)
    }
  }

  return (
    <div>
      <Typography variant='h3'>Commands</Typography>
      <Select
        onChange={(e, v) => setCommand(v)}
        value={command}
      >
        {possibleCommands.map((x, i) => (
          <MenuItem key={i} value={i}>{x}</MenuItem>
        ))}
      </Select>
      <TextField
        multiline
        label='Params (JSON)'
        lines={10}
        fullWidth
        placeholder='{"newPaymail":"who@johngalt.is"}'
        value={params}
        onChange={e => setParams(e.target.value)}
      />
      <Button disabled={running} onClick={handleRunClick}>Run</Button>
      <pre>
        {results}
      </pre>
    </div>
  )
}

export default Commands
