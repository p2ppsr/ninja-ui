import React, {useState} from 'react'
import {TextField, Button, Typography, IconButton} from '@material-ui/core'
import Casino from '@material-ui/icons/Casino'
import {makeStyles} from '@material-ui/core/styles'
import {Redirect} from 'react-router-dom'
import isKeyInvalid from '../utils/isKeyInvalid'
import Ninja from 'utxoninja'

const useStyles = makeStyles(
  {
    '@global': {
      '.MuiInputLabel-outlined': {
        lineHeight: '19px',
      },
    },
    content_wrap: {
      maxWidth: '1440px',
      margin: 'auto',
      marginTop: '5em',
      boxSizing: 'border-box',
      padding: '2em',
    },
    img: {
      width: '22em',
      marginBottom: '3em',
    },
    field_rand_grid: {
      display: 'grid',
      gridTemplateColumns: 'auto 1fr',
      gridGap: '0.5em',
      marginBottom: '3em',
    },
  },
  {name: 'Welcome'},
)

const Welcome = ({history}) => {
  const [privateKey, setPrivateKey] = useState(
    window.localStorage.privateKey || ''
  )
  const [server, setServer] = useState('https://dojo.babbage.systems')
  const classes = useStyles()

  const handleNewKeyClick = () => {
    setPrivateKey(require('crypto').randomBytes(32).toString('hex'))
  }

  const handleLogInClick = () => {
    if (isKeyInvalid(privateKey)) {
      return
    }
    window.localStorage.privateKey = privateKey
    window.localStorage.server = server
    window.Ninja = new Ninja({
      privateKey,
      config: { dojoURL: server }
    })
    history.push('/ninja/transactions')
  }

  if (!isKeyInvalid(window.localStorage.privateKey)) {
    window.Ninja = new Ninja({
      privateKey: window.localStorage.privateKey,
      config: { dojoURL: window.localStorage.server }
    })
    return <Redirect to="/ninja/transactions" />
  }

  return (
    <center className={classes.content_wrap}>
      <img
        src="/banner.png"
        className={classes.img}
        alt="Ninja Logo"
        title="Ninja Logo"
      />
      <Typography paragraph>
        Create a new private key by clicking the dice or enter an existing
        private key.
      </Typography>
      <div className={classes.field_rand_grid}>
        <IconButton onClick={handleNewKeyClick}>
          <Casino color="primary" />
        </IconButton>
        <TextField
          label="Enter private Key (hex)..."
          fullWidth
          value={privateKey}
          onChange={e => setPrivateKey(e.target.value)}
          variant="outlined"
        />
      </div>
      <TextField
        label="Dojo Server"
        fullWidth
        value={server}
        onChange={e => setServer(e.target.value)}
        variant="outlined"
      />
      <br />
      <br />
      <Typography paragraph>Save your key before you use it!</Typography>
      <Button
        variant="contained"
        size="large"
        color="primary"
        onClick={handleLogInClick}
        disabled={isKeyInvalid(privateKey)}
      >
        Saved, continue
      </Button>
    </center>
  )
}

export default Welcome
