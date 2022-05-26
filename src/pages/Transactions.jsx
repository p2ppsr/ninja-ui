import React, {useState, useEffect} from 'react'
import {Typography} from '@material-ui/core'
import {makeStyles} from '@material-ui/core/styles'
import Accordion from '@material-ui/core/Accordion'
import AccordionDetails from '@material-ui/core/AccordionDetails'
import AccordionSummary from '@material-ui/core/AccordionSummary'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'

const useStyles = makeStyles(
  theme => ({
    '@global': {
      '.muiPaper-elevation1': {
        boxShadow:
          '0px 2px 1px -1px rgb(0 0 0 / 20%), 0px 1px 1px 0px rgb(0 0 0 / 14%), 0px 1px 3px 0px rgb(0 0 0 / 12%)',
      },
      '.accordionWrapper .MuiAccordionSummary-root': {
        background: 'rgba(0, 0, 0, 0.04)',
      },
      '.accordionWrapper:nth-of-type(2n) .MuiAccordionSummary-root': {
        background: 'rgba(0, 0, 0, 0.08)',
      },
    },
    transactionsWrapper: {
      margin: '1rem 0 0 0',
    },
    heading: {
      fontSize: theme.typography.pxToRem(15),
      margin: '0 .5em 0 0',
      flexShrink: 0,
    },
    secondaryHeading: {
      fontSize: theme.typography.pxToRem(15),
      color: theme.palette.text.secondary,
      wordBreak: 'break-all',
    },
    listsWrap: {
      display: 'flex',
      flexWrap: 'wrap',
    },
    entriesList: {
      flex: '0 0 100%',
      margin: '0',
      padding: '0',
      display: 'flex',
      flexWrap: 'wrap',
      listStyle: 'none',
      alignItems: 'flex-start',
      [theme.breakpoints.up('md')]: {
        flex: '0 0 50%',
        maxWidth: '50%',
      },
      '& li': {
        alignSelf: 'flex-start',
        width: '100%',
        wordBreak: 'break-all',
        display: 'block',
        maxWidth: '100%',
        margin: '0 1% 1rem 1%',
        [theme.breakpoints.up('md')]: {
          display: 'inline-flex',
        },
      },
    },
    entryLabel: {
      fontWeight: '600',
      margin: '0 2% 0 0',
      display: 'inline-flex',
      width: '35%',
      [theme.breakpoints.up('md')]: {
        flexDirection: 'row-reverse',
      },
    },
    entryValue: {
      [theme.breakpoints.up('md')]: {
        width: '63%',
      },
    },
  }),
  {name: 'Transactions'},
)

const Transactions = () => {
  const classes = useStyles()
  const [tx, setTx] = useState([])
  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    (async () => {
      const result = await window.Ninja.getTransactions()
      setTx(result.transactions)
    })()
  }, [])

  const handleChange = panel => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false)
  }

  return (
    <div>
      <Typography variant="h3">Transactions</Typography>
      <div className={classes.transactionsWrapper}>
        {tx.map((x, i) => (
          <div key={i} className="accordionWrapper">
            <Accordion
              expanded={expanded === `panel${i}`}
              onChange={handleChange(`panel${i}`)}>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel1bh-content"
                id="panel1bh-header">
                <Typography className={classes.heading}>#{i + 1} -</Typography>
                <Typography className={classes.secondaryHeading}>
                  {x.txid}
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <div className={classes.listsWrap}>
                  <ul className={classes.entriesList}>
                    {Object.entries(x).map(([k, v], index) => {
                      return (
                        index < Object.entries(x).length / 2 && (
                          <li key={index}>
                            <div className={classes.entryLabel}>{k}: </div>
                            <div className={classes.entryValue}>{v}</div>
                          </li>
                        )
                      )
                    })}
                  </ul>
                  <ul className={classes.entriesList}>
                    {Object.entries(x).map(([k, v], index) => {
                      return (
                        index >= Object.entries(x).length / 2 && (
                          <li key={index}>
                            <div className={classes.entryLabel}>{k}: </div>
                            <div className={classes.entryValue}>{v}</div>
                          </li>
                        )
                      )
                    })}
                  </ul>
                </div>
              </AccordionDetails>
            </Accordion>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Transactions
