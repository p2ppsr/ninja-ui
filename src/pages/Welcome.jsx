import React, { useState, useEffect } from 'react'
import { TextField, Button, Typography, IconButton } from '@material-ui/core'
import Casino from '@material-ui/icons/Casino'
import { makeStyles } from '@material-ui/core/styles'
import isKeyInvalid from '../utils/isKeyInvalid'
import Ninja from 'utxoninja'
import { toast } from 'react-toastify'

const useStyles = makeStyles(
  {
    content_wrap: {
      maxWidth: '1440px',
      margin: 'auto',
      marginTop: '5em',
      boxSizing: 'border-box',
      padding: '2em'
    },
    img: {
      width: '22em',
      marginBottom: '3em'
    },
    field_rand_grid: {
      display: 'grid',
      gridTemplateColumns: 'auto 1fr',
      gridGap: '0.5em',
      marginBottom: '3em'
    }
  },
  { name: 'Welcome' }
)

const Welcome = ({ history }) => {
  const [privateKey, setPrivateKey] = useState(
    window.localStorage.privateKey || ''
  )
  const [server, setServer] = useState(
    window.localStorage.server || 'https://dojo.babbage.systems'
  )
  const classes = useStyles()

  const handleNewKeyClick = () => {
    setPrivateKey(require('crypto').randomBytes(32).toString('hex'))
  }

  const handleLogInClick = () => {
    if (isKeyInvalid(privateKey)) {
      toast.error(
        'Invalid private key! Check that it is a 64-character hex string.'
      )
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

  useEffect(() => {
    if (!isKeyInvalid(window.localStorage.privateKey)) {
      window.Ninja = new Ninja({
        privateKey: window.localStorage.privateKey,
        config: { dojoURL: window.localStorage.server }
      })
      history.push('/ninja/transactions')
    }
  }, [])

  return (
    <center className={classes.content_wrap}>
      <img
        src='/banner.png'
        className={classes.img}
        alt='Ninja Logo'
        title='Ninja Logo'
      />
      <Typography paragraph>
        Create a new private key by clicking the dice or enter an existing
        private key.
      </Typography>
      <div className={classes.field_rand_grid}>
        <IconButton onClick={handleNewKeyClick}>
          <Casino color='primary' />
        </IconButton>
        <TextField
          placeholder='Enter private Key (hex)...'
          fullWidth
          value={privateKey}
          onChange={e => setPrivateKey(e.target.value)}
          variant='outlined'
        />
      </div>
      <TextField
        placeholder='Dojo Server'
        fullWidth
        value={server}
        onChange={e => setServer(e.target.value)}
        variant='outlined'
      />
      <br />
      <br />
      <Typography paragraph>Save your key before you use it!</Typography>
      <Button
        variant='contained'
        size='large'
        color='primary'
        onClick={handleLogInClick}
        disabled={isKeyInvalid(privateKey)}
      >
        Saved, continue
      </Button>
    </center>
  )
}

export default Welcome
