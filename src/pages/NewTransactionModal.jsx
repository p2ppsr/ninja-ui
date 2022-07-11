import React, { useState } from 'react'
import utxoninja from 'utxoninja'
import { makeStyles } from '@material-ui/core/styles'
import {
  Button,
  ListItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Divider
} from '@material-ui/core'
import AddCircleOutlineIcon from '@material-ui/icons/AddCircleOutline'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

const useStyles = makeStyles(theme => ({
  list_item: {
    borderRadius: '2em'
  },
  gap: {
    margin: '0.5em 0'
  }
}))

const NewTransactionDialog = () => {
  const classes = useStyles()
  const [open, setOpen] = useState(false)
  const [note, setNote] = useState('')
  const [feePerKb, setFeePerKb] = useState(500)
  const [rPuzzleInputSigningWIF, setRPuzzleInputSigningWIF] = useState('')
  const [running, setRunning] = useState(false)
  const [labels, setLabels] = useState([''])
  const [outputs, setOutputs] = useState([{ script: '', satoshis: 0 }])
  const [, updateState] = React.useState()
  const forceUpdate = React.useCallback(() => updateState({}), [])

  const getTransactionWithOutputsClick = async () => {
    try {
      setRunning(true)
      const runResult = await utxoninja.getTransactionWithOutputs({
        xprivKey: window.localStorage.xprivKey,
        outputs,
        feePerKb: feePerKb,
        rPuzzleInputSigningWIF: rPuzzleInputSigningWIF
      })
      const processResult = await utxoninja.processOutgoingTransaction({
        xprivKey: window.localStorage.xprivKey,
        submittedTransaction: runResult.rawTx,
        reference: runResult.referenceNumber,
        note: note
      })
      // console.log('runResult', runResult)
      console.log('processResult', processResult)
      toast('success')
    } catch (e) {
      console.error(e)
      toast('Error: ' + e.message)
    } finally {
      setRunning(false)
    }
  }

  const addOutput = () => {
    setOutputs(outputs => {
      outputs.push({ script: '', satoshis: 1000 })
      return outputs
    })
    forceUpdate()
  }

  const setOutputScript = (value, i) => {
    setOutputs(outputs => {
      outputs[i].script = value
      return outputs
    })
    // console.log('outputs', outputs);
    forceUpdate()
  }

  const setOutputAmount = (value, i) => {
    setOutputs(outputs => {
      outputs[i].satoshis = parseInt(value)
      return outputs
    })
    // console.log('Object.keys(utxoninja)', Object.keys(utxoninja))
    // console.log('outputs', outputs);
    forceUpdate()
  }

  const addLabel = () => {
    setLabels(labels => {
      labels.push('')
      return labels
    })
    forceUpdate()
  }
  const handleSetLabels = (value, i) => {
    setLabels(labels => {
      labels[i] = value
      return labels
    })
    forceUpdate()
  }

  const handleOpen = () => {
    setOpen(true)
  }

  const handleClose = () => {
    setOpen(false)
  }

  return (
    <div>
      <ListItem button className={classes.list_item} onClick={handleOpen}>
        <ListItemIcon>
          <AddCircleOutlineIcon />
        </ListItemIcon>
        <ListItemText>New Transaction</ListItemText>
      </ListItem>
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby='simple-modal-title'
        aria-describedby='simple-modal-description'
      >
        <DialogTitle id='simple-modal-title'>
          New Transaction
        </DialogTitle>
        <DialogContent>
          {outputs.map((x, i) => (
            <div key={i}>
              <TextField
                label={`Output #${i} script`}
                fullWidth
                value={x.script}
                onChange={e => setOutputScript(e.target.value, i)}
                variant='outlined'
                className={classes.gap}
              />
              <TextField
                label={`Output #${i} satoshis`}
                fullWidth
                value={x.satoshis}
                onChange={e => setOutputAmount(e.target.value, i)}
                variant='outlined'
                className={classes.gap}
              />
              <Divider />
            </div>
          ))}
          <Button
            className={`${classes.run} ${classes.gap}`}
            disabled={running}
            onClick={addOutput}
            color='primary'
            variant='outlined'
          >
            Add Output
          </Button>
          <TextField
            label="Transaction note (optional)"
            fullWidth
            value={note}
            onChange={e => setNote(e.target.value)}
            variant='outlined'
            className={classes.gap}
          />
          <TextField
            label="feePerKb (default 500)"
            fullWidth
            value={feePerKb}
            onChange={e => setFeePerKb(e.target.value)}
            variant='outlined'
            className={classes.gap}
          />
          <TextField
            label="rPuzzleInputSigningWIF"
            fullWidth
            value={rPuzzleInputSigningWIF}
            onChange={e => setRPuzzleInputSigningWIF(e.target.value)}
            variant='outlined'
            className={classes.gap}
          />
          {labels.map((x, i) => (
            <div key={i}>
              <TextField
                label={`Label #${i}`}
                fullWidth
                value={x}
                onChange={e => handleSetLabels(e.target.value, i)}
                variant='outlined'
                className={classes.gap}
              />
              <Divider />
            </div>
          ))}
          <Button
            className={`${classes.run} ${classes.gap}`}
            disabled={running}
            onClick={addLabel}
            color='primary'
            variant='outlined'
          >
            Add Label
          </Button>
        </DialogContent>
        <DialogActions>
          <Button
            className={classes.run}
            disabled={running}
            onClick={getTransactionWithOutputsClick}
            color='primary'
          >
            Send
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  )
}

export default NewTransactionDialog
