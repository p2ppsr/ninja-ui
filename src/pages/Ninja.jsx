import React, { useEffect, useState } from 'react'
import UTXONinja from 'utxoninja'
import {
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography
} from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import RefreshIcon from '@material-ui/icons/Refresh'
import { Switch, Route, Redirect } from 'react-router-dom'
import Transactions from './Transactions'
import Sweep from './Sweep'
import Commands from './Commands'
import Settings from './Settings'
import Profile from './Profile'
import isKeyInvalid from '../utils/isKeyInvalid'
import SettingsIcon from '@material-ui/icons/Settings'
import CommandsIcon from '@material-ui/icons/Code'
import TransactionsIcon from '@material-ui/icons/ListAlt'
import AccountCircleIcon from '@material-ui/icons/AccountCircle'

const useStyles = makeStyles(
  {
    content_wrap: {
      margin: 'auto',
      maxWidth: '1440px',
      padding: '1em',
      boxSizing: 'border-box',
      display: 'grid',
      gridTemplateColumns: 'auto 1fr',
      gridGap: '2em',
      '& > :first-child': {
        minWidth: '15em',
      },
    },
    logo_list_grid: {
      display: 'grid',
      gridTemplateRows: 'auto 1fr auto',
    },
    img: {
      width: '13em',
      margin: '1em auto',
      justifySelf: 'center',
    },
    list_item: {
      borderRadius: '2em',
    },
    refreshIcon: {
      cursor: 'pointer',
    },
  },
  {name: 'Ninja'},
);

const Ninja = ({history, location}) => {
  const [running, setRunning] = useState(false);
  const [currentBalance, setCurrentBalance] = useState(0);
  const classes = useStyles();

  const getTotalValueRefreshClick = async () => {
    try {
      setRunning(true)
      const runResult = await window.Ninja['getTotalValue']()
      setCurrentBalance(runResult.total)
    } catch (e) {
      console.error(e);
      setCurrentBalance('Error: ' + e.message)
    } finally {
      setRunning(false)
    }
  };

  useEffect(() => {
    getTotalValueRefreshClick();
  }, []);

  if (isKeyInvalid(window.localStorage.privateKey)) {
    return <Redirect to='/' />
  }

  const numberWithCommas = x => {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  if (!window.Ninja) {
    window.Ninja = new UTXONinja({
      privateKey: window.localStorage.privateKey,
      config: { dojoURL: window.localStorage.server }
    })
  }

  return (
    <div className={classes.content_wrap}>
      <div className={classes.logo_list_grid}>
        <img src='/banner.png' className={classes.img} alt='' />
        <List>
          <ListItem>
            <Typography>
              Current Balance:{' '}
              <b>{numberWithCommas(currentBalance)} Satoshis</b>
            </Typography>
            <RefreshIcon
              disabled={running}
              onClick={getTotalValueRefreshClick}
              className={classes.refreshIcon}
            />
          </ListItem>
          <ListItem
            button
            selected={location.pathname === '/ninja/transactions'}
            className={classes.list_item}
            onClick={() => history.push('/ninja/transactions')}>
            <ListItemIcon>
              <TransactionsIcon
                color={
                  location.pathname === '/ninja/transactions'
                    ? 'primary'
                    : undefined
                }
              />
            </ListItemIcon>
            <ListItemText>Transactions</ListItemText>
          </ListItem>
          <ListItem
            button
            selected={location.pathname === '/ninja/sweep'}
            className={classes.list_item}
            onClick={() => history.push('/ninja/sweep')}>
            <ListItemIcon>
              <TransactionsIcon
                color={
                  location.pathname === '/ninja/sweep'
                    ? 'primary'
                    : undefined
                }
              />
            </ListItemIcon>
            <ListItemText>Sweep</ListItemText>
          </ListItem>
          <ListItem
            button
            selected={location.pathname === '/ninja/commands'}
            className={classes.list_item}
            onClick={() => history.push('/ninja/commands')}>
            <ListItemIcon>
              <CommandsIcon
                color={
                  location.pathname === '/ninja/commands'
                    ? 'primary'
                    : undefined
                }
              />
            </ListItemIcon>
            <ListItemText>Commands</ListItemText>
          </ListItem>

          <ListItem
            button
            selected={location.pathname === '/ninja/profile'}
            className={classes.list_item}
            onClick={() => history.push('/ninja/profile')}>
            <ListItemIcon>
              <AccountCircleIcon
                color={
                  location.pathname === '/ninja/profile' ? 'primary' : undefined
                }
              />
            </ListItemIcon>
            <ListItemText>Profile</ListItemText>
          </ListItem>

          <ListItem
            button
            selected={location.pathname === '/ninja/settings'}
            className={classes.list_item}
            onClick={() => history.push('/ninja/settings')}>
            <ListItemIcon>
              <SettingsIcon
                color={
                  location.pathname === '/ninja/settings'
                    ? 'primary'
                    : undefined
                }
              />
            </ListItemIcon>
            <ListItemText>Settings</ListItemText>
          </ListItem>
        </List>
        <Typography color='textSecondary' align='center'>
          You are a ninja
        </Typography>
      </div>
      <Switch>
        <Route exact path='/ninja/transactions' component={Transactions} />
        <Route exact path='/ninja/sweep' component={Sweep} />
        <Route exact path='/ninja/commands' component={Commands} />
        <Route exact path='/ninja/profile' component={Profile} />
        <Route exact path='/ninja/settings' component={Settings} />
      </Switch>
    </div>
  );
};

export default Ninja;
