import { useState } from 'react'
import { TextField, Button, Typography, IconButton } from '@material-ui/core'
import Casino from '@material-ui/icons/Casino'
import bsv from 'bsv'
import { makeStyles } from '@material-ui/core/styles'
import { Redirect } from 'react-router-dom'
import isKeyInvalid from '../utils/isKeyInvalid'

const useStyles = makeStyles({
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
    gridTemplateColumns: '1fr auto',
    gridGap: '0.5em',
    marginBottom: '3em'
  }
}, { name: 'Welcome' })

const Welcome = ({ history }) => {
  const [xpriv, setXpriv] = useState(window.localStorage.xprivKey || '')
  const classes = useStyles()

  const handleNewKeyClick = () => {
    setXpriv(
      bsv.HDPrivateKey.fromRandom().toString()
    )
  }

  const handleLogInClick = () => {
    if (isKeyInvalid(xpriv)) {
      return
    }
    window.localStorage.xprivKey = xpriv
    history.push('/ninja/transactions')
  }

  if (!isKeyInvalid(window.localStorage.xprivKey)) {
    return <Redirect to='/ninja/transactions' />
  }

  return (
    <center className={classes.content_wrap}>
      <img
        src='/banner.png'
        className={classes.img}
        alt='Ninja Logo'
        title='Ninja Logo'
      />
      <div className={classes.field_rand_grid}>
        <TextField
          label='Enter XPRIV Key...'
          fullWidth
          value={xpriv}
          onChange={e => setXpriv(e.target.value)}
          variant='outlined'
        />
        <IconButton
          onClick={handleNewKeyClick}
        >
          <Casino color='primary' />
        </IconButton>
      </div>
      <Typography paragraph>
        Save your key before you use it!
      </Typography>
      <Button
        variant='contained'
        size='large'
        color='primary'
        onClick={handleLogInClick}
        disabled={isKeyInvalid(xpriv)}
      >
        Saved, continue
      </Button>
    </center>
  )
}

export default Welcome
