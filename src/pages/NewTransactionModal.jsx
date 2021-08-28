import React, { useState} from 'react';
import utxoninja from 'utxoninja';
import {makeStyles} from '@material-ui/core/styles';
import {
  Button,
  ListItem,
  ListItemIcon,
  ListItemText,
  Modal,
  TextField,
  Typography,
} from '@material-ui/core';
import AddCircleOutlineIcon from '@material-ui/icons/AddCircleOutline';

function getModalStyle() {
  const top = 50;
  const left = 50;

  return {
    top: `${top}%`,
    left: `${left}%`,
    transform: `translate(-${top}%, -${left}%)`,
  };
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
  textField: {
    margin: '0.5em 0',
  }
}));

const NewTransactionModal = () => {
  const classes = useStyles();
  // getModalStyle is not a pure function, we roll the style only on the first render
  const [modalStyle] = React.useState(getModalStyle);
  const [open, setOpen] = React.useState(false);
  const [xpriv, setXpriv] = React.useState(false);
  const [running, setRunning] = React.useState(false);
  const [results, setResults] = useState(
    'Press "Run Command" to see results...',
  );

  const getTransactionWithOutputsClick = async () => {
    try {
      setRunning(true);
      const runResult = await utxoninja['getTransactionWithOutputs']({
        xprivKey: window.localStorage.xprivKey,
      });
      console.log('runResult', runResult);
      setResults(runResult);
    } catch (e) {
      console.error(e);
      setResults('Error: ' + e.message);
    } finally {
      setRunning(false);
    }
  };

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const body = (
    <div style={modalStyle} className={classes.paper}>
      <Typography variant="h4" id="simple-modal-title" paragraph>
        New Transaction
      </Typography>
      <TextField
        label="XPRIV"
        fullWidth
        value={xpriv}
        onChange={e => setXpriv(e.target.value)}
        variant="outlined"
        className={classes.textField}
      />
      <TextField
        label="Parameter.."
        fullWidth
        //value={xpriv}
        //onChange={e => setXpriv(e.target.value)}
        variant="outlined"
        className={classes.textField}
      />
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
  );

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
  );
};

export default NewTransactionModal;
