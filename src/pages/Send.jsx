import React, {useState} from 'react'
import { Button, Typography, TextField } from '@material-ui/core'
import {makeStyles} from '@material-ui/core/styles'
import atfinder from 'atfinder'
import bsv from 'bsv'

const useStyles = makeStyles(
  theme => ({
  }),
  {name: 'Sweep'},
)

const Sweep = () => {
  const classes = useStyles()
  const [paymail, setPaymail] = useState('')
  const [amount, setAmount] = useState('')

  const handleSend = async () => {
    const client = window.Ninja.authriteClient
    const { identityKey } = await atfinder.getCertifiedKey(paymail, client)
    console.log(key)
  }

  return (
    <div>
      <Typography variant="h3">Send</Typography>
      <TextField
        label='Paymail'
        onChange={e => setPaymail(e.target.value)}
      />
      <TextField
        label='Amount'
        onChange={e => setAmount(e.target.value)}
      />
      <Button onClick={handleSend}>Send</Button>
    </div>
  )
}

export default Sweep
