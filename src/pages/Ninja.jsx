import React, { useEffect, useState } from 'react'
import UTXONinja from 'utxoninja'
import {
  Typography,
  Button,
  CircularProgress
} from '@mui/material'
import makeStyles from '@mui/styles/makeStyles'
import RefreshIcon from '@mui/icons-material/Refresh'
import { Switch, Route, Link } from 'react-router-dom'
import Transactions from './Transactions'
import Sweep from './Sweep'
import Send from './Send'
import Commands from './Commands'
import Settings from './Settings'
import isKeyInvalid from '../utils/isKeyInvalid'
import SettingsIcon from '@mui/icons-material/Settings'
import CommandsIcon from '@mui/icons-material/Code'
import TransactionsIcon from '@mui/icons-material/ListAlt'

const useStyles = makeStyles(theme => ({
  child_wrap: theme.templates.page_wrap,
  logo_list_grid: {
    display: 'grid',
    gridTemplateColumns: '1fr auto auto auto auto auto auto auto',
    gridGap: '0.75em',
    alignItems: 'center',
    margin: '1em auto',
    maxWidth: '1440px',
    padding: '0px 1em',
    boxSizing: 'border-box',
    [theme.breakpoints.down('lg')]: {
      gridTemplateColumns: '1fr'
    }
  },
  img: {
    width: '8em',
    position: 'relative',
    top: '-8px'
  },
  list_item: {
    borderRadius: '2em'
  },
  refreshIcon: {
    position: 'relative',
    top: '16px',
    cursor: 'pointer',
    width: '40px',
    height: '40px',
    color: theme.palette.secondary.main,
    border: `1px solid ${theme.palette.primary.main}`,
    borderRadius: '2em',
    boxSizing: 'border-box',
    transition: 'all 0.3s',
    '&:hover': {
      color: theme.palette.secondary.dark,
      boxShadow: '2px 2px 3px 1px rgba(0,0,0,0.5)',
      transform: 'scale(1.1)'
    }
  },
  balance_display: {
    position: 'relative',
    top: '-8px',
    whiteSpace: 'nowrap !important'
  }
}), { name: 'Ninja' })

const Ninja = ({ history, location }) => {
  const [ninjaLoading, setNinjaLoading] = useState(true)
  const [running, setRunning] = useState(false)
  const [currentBalance, setCurrentBalance] = useState(0)
  const classes = useStyles()

  const getTotalValueRefreshClick = async () => {
    try {
      setRunning(true)
      const runResult = await window.Ninja.getTotalValue()
      setCurrentBalance(runResult.total)
    } catch (e) {
      console.error(e)
      setCurrentBalance('Error: ' + e.message)
    } finally {
      setRunning(false)
      setNinjaLoading(false)
    }
  }

  useEffect(() => {
    (async () => {
      if (isKeyInvalid(window.localStorage.privateKey)) {
        history.push('/')
        return
      }
      window.Ninja = new UTXONinja({
        privateKey: window.localStorage.privateKey,
        config: { dojoURL: window.localStorage.server }
      })
      await getTotalValueRefreshClick()
    })()
  }, [])

  const numberWithCommas = x => {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  }

  if (ninjaLoading) {
    return <div>loading...</div>
  }

  return (
    <div className={classes.content_wrap}>
      <div className={classes.logo_list_grid}>
        <img src='/banner.png' className={classes.img} alt='' />
        <Button
          variant={location.pathname === '/ninja/transactions' ? 'outlined' : undefined}
          className={classes.list_item}
          onClick={() => history.push('/ninja/transactions')}
        >
          <TransactionsIcon
            color={
                  location.pathname === '/ninja/transactions'
                    ? 'secondary'
                    : undefined
                }
          />
          Transactions
        </Button>
        <Button
          variant={location.pathname === '/ninja/sweep' ? 'outlined' : undefined}
          className={classes.list_item}
          onClick={() => history.push('/ninja/sweep')}
        >
          <TransactionsIcon
            color={
                  location.pathname === '/ninja/sweep'
                    ? 'secondary'
                    : undefined
                }
          />
          Sweep
        </Button>
        <Button
          variant={location.pathname === '/ninja/send' ? 'outlined' : undefined}
          className={classes.list_item}
          onClick={() => history.push('/ninja/send')}
        >
          <TransactionsIcon
            color={
                  location.pathname === '/ninja/send'
                    ? 'secondary'
                    : undefined
                }
          />
          Send
        </Button>
        <Button
          variant={location.pathname === '/ninja/commands' ? 'outlined' : undefined}
          className={classes.list_item}
          onClick={() => history.push('/ninja/commands')}
        >
          <CommandsIcon
            color={
                  location.pathname === '/ninja/commands'
                    ? 'secondary'
                    : undefined
                }
          />
          Commands
        </Button>

        <Button
          variant={location.pathname === '/ninja/settings' ? 'outlined' : undefined}
          className={classes.list_item}
          onClick={() => history.push('/ninja/settings')}
        >
          <SettingsIcon
            color={
                  location.pathname === '/ninja/settings'
                    ? 'secondary'
                    : undefined
                }
          />
          Settings
        </Button>
        <Typography className={classes.balance_display}>
          Balance:{' '}
          <b>{numberWithCommas(currentBalance)} sats</b> {!running
            ? (
              <RefreshIcon
                onClick={getTotalValueRefreshClick}
                className={classes.refreshIcon}
              />
              )
            : (
              <CircularProgress
                className={classes.refreshIcon}
              />
              )}
        </Typography>
      </div>
      <div className={classes.child_wrap}>
        <Switch>
          <Route exact path='/ninja/transactions' component={Transactions} />
          <Route exact path='/ninja/sweep' component={Sweep} />
          <Route exact path='/ninja/send' component={Send} />
          <Route exact path='/ninja/commands' component={Commands} />
          <Route exact path='/ninja/settings' component={Settings} />
          <Route
            default component={() => (
              <center style={{ marginTop: '2em' }}>
                <Typography align='center' variant='h4' paragraph>
                  Page Not Found
                </Typography>
                <Typography>
                  <Link to='/ninja/transactions'>Recent Transactions</Link>
                </Typography>
              </center>
            )}
          />
        </Switch>
      </div>
      <center>© P2PPSR — <a href='https://github.com/p2ppsr/ninja-ui' target='_blank' rel='noreferrer'>GitHub</a></center>
      <br />
      <br />
      <center style={{ userSelect: 'none' }}><i>you are a ninja!</i></center>
    </div>
  )
}

export default Ninja
