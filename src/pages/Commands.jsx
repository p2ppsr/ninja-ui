import React, { useState } from 'react'
import {
  Typography,
  TextField,
  Button,
  Select,
  MenuItem
} from '@mui/material'
import makeStyles from '@mui/styles/makeStyles'

const useStyles = makeStyles(theme => ({
  params: {
    margin: '1em auto'
  },
  run: {
    marginBottom: '1em'
  },
  results: {
    boxShadow: theme.shadows[3],
    margin: '1em auto',
    minHeight: '5em',
    padding: '1em',
    boxSizing: 'border-box',
    overflow: 'scroll',
    borderRadius: '0.5em'
  }
}), { name: 'Commands' })

const Commands = () => {
  const possibleCommands = Object.getOwnPropertyNames(
    Object.getPrototypeOf(window.Ninja)
  ).filter(m =>
    typeof window.Ninja[m] === 'function' &&
    m !== 'constructor' &&
    m !== 'createAuthriteRequest'
  )
  const classes = useStyles()
  const [command, setCommand] = useState(possibleCommands[0])
  const [params, setParams] = useState('')
  const [results, setResults] = useState(
    'Press "Run Command" to see results...'
  )
  const [running, setRunning] = useState(false)

  const handleRunClick = async () => {
    try {
      setRunning(true)
      const parsedParams = params ? JSON.parse(params) : {}
      const runResult = await window.Ninja[command]({
        ...parsedParams
      })
      setResults(JSON.stringify(runResult, null, 2))
    } catch (e) {
      console.error(e)
      setResults('Error: ' + e.message)
    } finally {
      setRunning(false)
    }
  }

  return (
    <div>
      <Typography variant='h3' paragraph>Commands</Typography>
      <Select
        onChange={(e) => setCommand(e.target.value)}
        value={command}
        fullWidth
      >
        {possibleCommands.map((x, i) => (
          <MenuItem key={i} value={x}>{x}</MenuItem>
        ))}
      </Select>
      <TextField
        className={classes.params}
        multiline
        label='Params (JSON)'
        minRows={10}
        fullWidth
        placeholder='{"newPaymail":"who@johngalt.is"}'
        value={params}
        onChange={e => setParams(e.target.value)}
      />
      <Button
        className={classes.run}
        disabled={running}
        onClick={handleRunClick}
        color='primary'
        variant='contained'
      >
        Run Command
      </Button>
      <Typography variant='h4'>Results</Typography>
      <pre className={classes.results}>
        {results}
      </pre>
    </div>
  )
}

export default Commands
