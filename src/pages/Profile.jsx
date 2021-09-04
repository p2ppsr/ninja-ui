import React, {useEffect, useState} from 'react'
import utxoninja from 'utxoninja'
import {Typography, TextField, Button} from '@material-ui/core'
import {makeStyles} from '@material-ui/core/styles'

const useStyles = makeStyles(
  {
    gap: {
      marginBottom: '1em'
    },
  },
  {name: 'Profile'}
)

const Profile = () => {
  const classes = useStyles()
  const [avatarName, setAvatarName] = useState('')
  const [photoURL, setPhotoURL] = useState('')
  const [paymail, setPaymail] = useState('')
  const [running, setRunning] = useState(false)

  useEffect(() => {
    handleGetAvatar()
    handleGetPaymail()
  }, [])

  const handleGetAvatar = async () => {
    try {
      setRunning(true)
      const runResult = await utxoninja['getAvatar']({
        xprivKey: window.localStorage.xprivKey,
        name: avatarName,
      })
      console.log('r', runResult)
      setAvatarName(runResult.name)
      setPhotoURL(runResult.photoURL)
    } catch (e) {
      console.error(e)
      setAvatarName('Error: ' + e.message)
    } finally {
      setRunning(false)
    }
  }

  const handleGetPaymail = async () => {
    try {
      setRunning(true)
      const runResult = await utxoninja['getPaymail']({
        xprivKey: window.localStorage.xprivKey,
        paymail: paymail,
      })
      console.log('p', runResult)
      setPaymail(runResult)
    } catch (e) {
      console.error(e)
      setPaymail('Error: ' + e.message)
    } finally {
      setRunning(false)
    }
  }

  const handleSetAvatar = async () => {
    try {
      setRunning(true)
      const runResult = await utxoninja['setAvatarl']({
        xprivKey: window.localStorage.xprivKey,
      })
      console.log('sa', runResult)
      //setPaymail(runResult)
    } catch (e) {
      console.error(e)
      //setAvatarName('Error: ' + e.message)
    } finally {
      setRunning(false)
    }
  }

  const handleSetPaymail = async () => {
    try {
      setRunning(true)
      const runResult = await utxoninja['setPaymail']({
        xprivKey: window.localStorage.xprivKey,
      })
      console.log('sp', runResult)
      //setPaymail(runResult)
    } catch (e) {
      console.error(e)
      //setPaymail('Error: ' + e.message)
    } finally {
      setRunning(false)
    }
  }

  return (
    <div>
      <Typography variant="h3" className={classes.gap}>Profile</Typography>

      <Typography variant="h5">Avatar</Typography>
      <Typography>Name: {avatarName}</Typography>
      <Typography className={classes.gap}>PhotoURL: {photoURL}</Typography>

      <Typography variant="h5">Paymail</Typography>
      <Typography className={classes.gap}>{paymail}</Typography>

      <TextField
        label="Change Avatar"
        fullWidth
        value={avatarName}
        onChange={e => setAvatarName(e.target.value)}
        variant="outlined"
        className={classes.gap}
      />

      <TextField
        label="Change PhotoURL"
        fullWidth
        value={photoURL}
        onChange={e => setPhotoURL(e.target.value)}
        variant="outlined"
        className={classes.gap}
      />

      <TextField
        label="Change Paymail"
        fullWidth
        value={paymail}
        onChange={e => setPaymail(e.target.value)}
        variant="outlined"
        className={classes.gap}
      />

      <Button
        className={classes.gap}
        color="primary"
        variant="contained"
        disabled={running}
        onClick={() => {
          handleSetAvatar()
          handleSetPaymail()
        }}>
        Save
      </Button>
    </div>
  )
}

export default Profile
