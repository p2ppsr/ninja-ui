import React, {useState} from 'react'
import utxoninja from 'utxoninja'
import {makeStyles} from '@material-ui/core/styles'
import {
  Button,
  ListItem,
  ListItemIcon,
  ListItemText,
  Modal,
  TextField,
  Typography,
} from '@material-ui/core'
import AddCircleOutlineIcon from '@material-ui/icons/AddCircleOutline'

function getModalStyle() {
  const top = 50
  const left = 50

  return {
    top: `${top}%`,
    left: `${left}%`,
    transform: `translate(-${top}%, -${left}%)`,
  }
}

const useStyles = makeStyles(theme => ({
  list_item: {
    borderRadius: '2em',
  },
  paper: {
    position: 'absolute',
    width: 800,
    backgroundColor: theme.palette.background.paper,
    border: '2px solid #000',
    boxShadow: theme.shadows[5],
    padding: theme.spacing(2, 4, 3),
  },
  results: {
    boxShadow: theme.shadows[3],
    margin: '1em auto',
    minHeight: '5em',
    padding: '1em',
    boxSizing: 'border-box',
    overflow: 'scroll',
    borderRadius: '0.5em',
  },
  gap: {
    margin: '0.5em 0',
  },
}))

const NewTransactionModal = () => {
  const classes = useStyles()
  // getModalStyle is not a pure function, we roll the style only on the first render
  const [modalStyle] = React.useState(getModalStyle)
  const [open, setOpen] = React.useState(false)
  const [running, setRunning] = React.useState(false)
  const [, updateState] = React.useState()
  const forceUpdate = React.useCallback(() => updateState({}), [])
  const [outputs, setOutputs] = React.useState([{script: '', satoshis: 0}])
  const [results, setResults] = useState(
    'Press "Run Command" to see results...',
  )

  const getTransactionWithOutputsClick = async () => {
    try {
      setRunning(true)
      const runResult = await utxoninja['getTransactionWithOutputs']({
        xprivKey: window.localStorage.xprivKey,
        outputs: [
          {
            script: '76a914284cc46442db77856e2126e32168e8a1f4b8028b88ac',
            satoshis: 1000,
          },
        ],
      })
      const processResult = await utxoninja.processTransaction({
        xprivKey: localStorage.xprivKey,
        submittedTransaction: runResult.rawTx,
        reference: runResult.referenceNumber,
        //note: noteTextFieldValue,
      });

      console.log('processResult', processResult);
      console.log('runResult', runResult);

      //setResults(runResult)
    } catch (e) {
      console.error(e)
      setResults('Error: ' + e.message)
    } finally {
      setRunning(false)
    }
  }

  const addOutput = () => {
    const addedOutput = outputs
    addedOutput.push({script: '', satoshis: 1000})
    setOutputs(addedOutput)
    forceUpdate()
    //console.log('outputs', outputs)
  }

  const setAnOutput = (value, i) => {
    const changeOutput = outputs
    changeOutput[i].script = value
    setOutputs(changeOutput)
    //console.log('value', value)
    //console.log('xoutputs', outputs[i].script)
    forceUpdate()
  }

  const handleOpen = () => {
    setOpen(true)
  }

  const handleClose = () => {
    setOpen(false)
  }

  const body = (
    <div style={modalStyle} className={classes.paper}>
      <Typography variant="h4" id="simple-modal-title" paragraph>
        New Transaction
      </Typography>
      {outputs.map((x, i) => (
        <TextField
          key={i}
          label={`Output #${i}`}
          fullWidth
          value={x.script}
          onChange={e => setAnOutput(e.target.value, i)}
          variant="outlined"
          className={classes.gap}
        />
      ))}
      <Button
        className={classes.run}
        disabled={running}
        onClick={addOutput}
        color="secondary"
        variant="contained"
        className={classes.gap}>
        Add Output
      </Button>
      <br />
      <Button
        className={classes.run}
        disabled={running}
        onClick={getTransactionWithOutputsClick}
        color="primary"
        variant="contained">
        Run Command
      </Button>
      <pre className={classes.results}>{results}</pre>
    </div>
  )

  return (
    <div>
      <ListItem button className={classes.list_item} onClick={handleOpen}>
        <ListItemIcon>
          <AddCircleOutlineIcon />
        </ListItemIcon>
        <ListItemText>New Transaction</ListItemText>
      </ListItem>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="simple-modal-title"
        aria-describedby="simple-modal-description">
        {body}
      </Modal>
    </div>
  )
}

export default NewTransactionModal
