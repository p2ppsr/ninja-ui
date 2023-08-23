import React, { useState, useEffect } from 'react'
import { TextField, Button, Typography, IconButton } from '@mui/material'
import Casino from '@mui/icons-material/Casino'
import makeStyles from '@mui/styles/makeStyles'
import isKeyInvalid from '../utils/isKeyInvalid'
import { Ninja } from 'ninja-base'
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
      <Typography paragraph>
        This is a management interface for the Dojo and Ninja system. <a href='https://projectbabbage.com/docs/dojo' target='_blank' rel='noreferrer'>Read the docs.</a>
      </Typography>
      <div className={classes.field_rand_grid}>
        <IconButton onClick={handleNewKeyClick} size='large'>
          <Casino color='primary' />
        </IconButton>
        <TextField
          label='Ninja private Key (hex)'
          fullWidth
          value={privateKey}
          onChange={e => setPrivateKey(e.target.value)}
          variant='outlined'
        />
      </div>
      <TextField
        label='Dojo Server URL'
        fullWidth
        value={server}
        onChange={e => setServer(e.target.value)}
        variant='outlined'
      />
      <div style={{ textAlign: 'left' }}>
        <br />
        <br />
        <ul>
          <li><Typography>Babbage runs <b>https://dojo.babbage.systems</b> for mainnet</Typography></li>
          <li><Typography>Babbage runs <b>https://staging-dojo.babbage.systems</b> for testnet</Typography></li>
        </ul>
        <br />
        <br />
      </div>
      <Typography paragraph>Save your key before you use it!</Typography>
      <Button
        variant='contained'
        size='large'
        color='secondary'
        onClick={handleLogInClick}
        disabled={isKeyInvalid(privateKey)}
      >
        Key Saved, continue
      </Button>
      <br />
      <br />
      <Typography paragraph>
        This website is open-source, and your private key never leaves your browser. <a href='https://github.com/p2ppsr/ninja-ui' target='_blank' rel='noreferrer'>Run it yourself!</a>
      </Typography>
    </center>
  )
}

export default Welcome
