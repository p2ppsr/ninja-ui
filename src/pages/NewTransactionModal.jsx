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
  const [running, setRunning] = useState(false)
  const [outputs, setOutputs] = useState([{ script: '', satoshis: 0 }])

  const getTransactionWithOutputsClick = async () => {
    try {
      setRunning(true)
      const runResult = await utxoninja.getTransactionWithOutputs({
        xprivKey: window.localStorage.xprivKey,
        outputs
      })
      const processResult = await utxoninja.processTransaction({
        xprivKey: window.localStorage.xprivKey,
        submittedTransaction: runResult.rawTx,
        reference: runResult.referenceNumber
        // note: noteTextFieldValue,
      })

      console.log('processResult', processResult)
      console.log('runResult', runResult)
      window.alert('success')
      setOpen(false)
    } catch (e) {
      console.error(e)
      window.alert('Error: ' + e.message)
    } finally {
      setRunning(false)
    }
  }

  const addOutput = () => {
    setOutputs(outputs => {
      outputs.push({ script: '', satoshis: 1000 })
      return outputs
    })
  }

  const setOutputScript = (value, i) => {
    setOutputs(outputs => {
      outputs[i].script = value
      return outputs
    })
  }

  const setOutputAmount = (value, i) => {
    setOutputs(outputs => {
      outputs[i].satoshis = value
      return outputs
    })
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
            className={classes.run}
            disabled={running}
            onClick={addOutput}
            color='primary'
            variant='outlined'
          >
            Add Output
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
