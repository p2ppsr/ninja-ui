import React, {useEffect, useState} from 'react';
import utxoninja from 'utxoninja';
import {Typography, TextField, Button} from '@material-ui/core';

const Profile = () => {
  const [currentName, setCurrentName] = useState(false);
  const [avatar, setAvatar] = useState(false);
  const [paymail, setPaymail] = useState(false);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    handleGetAvatar();
    handleGetPaymail();
    handleSetAvatar();
    handleSetPaymail();
  }, []);

  const handleGetAvatar = async () => {
    try {
      setRunning(true);
      const runResult = await utxoninja['getAvatar']({
        xprivKey: window.localStorage.xprivKey,
      });
      console.log('r', runResult);
      setAvatar(runResult.photoURL);
    } catch (e) {
      console.error(e);
      setAvatar('Error: ' + e.message);
    } finally {
      setRunning(false);
    }
  };

  const handleGetPaymail = async () => {
    try {
      setRunning(true);
      const runResult = await utxoninja['getPaymail']({
        xprivKey: window.localStorage.xprivKey,
      });
      setPaymail(runResult);
    } catch (e) {
      console.error(e);
      setPaymail('Error: ' + e.message);
    } finally {
      setRunning(false);
    }
  };

  const handleSetAvatar =  () => {
  };

  const handleSetPaymail =  () => {
  };

  const handleNameChange = () => {
    alert();
  };

  return (
    <div>
      <Typography variant="h3">Profile</Typography>

      <Typography>{avatar}</Typography>
      <Typography>{paymail}</Typography>
      <TextField
        label="Enter XPRIV Key..."
        fullWidth
        value={currentName}
        onChange={e => setCurrentName(e.target.value)}
        variant="outlined"
      />

      <Button disabled={running} onClick={handleNameChange}>
        Change Name
      </Button>
    </div>
  );
};

export default Profile;
