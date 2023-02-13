import React, { useState } from 'react'
import { Checkbox, Button, Typography, TextField } from '@mui/material'
import makeStyles from '@mui/styles/makeStyles';
import boomerang from 'boomerang-http'
import bsv from 'babbage-bsv'
import hashwrap from 'hash-wrap'
import { toast } from 'react-toastify'
import SendIcon from '@mui/icons-material/Send'

const useStyles = makeStyles(
  theme => ({
    content_wrap: {
    maxWidth: '1440px',
    margin: 'auto',
    marginTop: '3em',
    boxSizing: 'border-box',
    padding: '2em',
    [theme.breakpoints.down('sm')]: {
      marginTop: '0.5em',
      padding: '0.5em'
    }
  },
  title_text: {
    [theme.breakpoints.down('sm')]: {
      fontSize: '2em'
    },
    [theme.breakpoints.down('xs')]: {
      fontSize: '1.6em'
    }
  },
  card_link: {
    textDecoration: 'none !important'
  },
  card_container: {
    margin: '1.5em auto'
  },
  card_grid: {
    display: 'grid',
    gridTemplateColumns: '4em 1fr',
    alignItems: 'center',
    [theme.breakpoints.down('md')]: {
      gridTemplateColumns: '3em 1fr'
    },
    [theme.breakpoints.down('sm')]: {
      gridTemplateColumns: '2.5em 1fr'
    }
  },
  link_text: {
    textAlign: 'left'
  },
  utxos_grid: {
    display: 'grid',
    gridTemplateColumns: 'auto 1fr auto auto',
    gridGap: theme.spacing(2)
  },
  spv_data_display: {
    overflow: 'scroll',
    width: '100%',
    maxHeight: '40vh',
    userSelect: 'all',
    boxSizing: 'border-box',
    border: '1px solid #999',
    padding: '0.5em'
  }
  }),
  { name: 'Sweep' }
)

const Sweep = () => {
  const classes = useStyles()
  const [utxos, setUtxos] = useState([])
  const [key, setKey] = useState('')
  const [network, setNetwork] = useState('mainnet')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleGetUtxos = async () => {
    try {
      setLoading(true)
      const add = bsv.Address.fromPrivateKey(bsv.PrivateKey.fromWIF(key))
      const addr = add.toString()
      const network = add.network.name
      setNetwork(network)
      const wocNet = network === 'testnet' ? 'test' : 'main'
      const got = await boomerang(
        'GET',
        `https://api.whatsonchain.com/v1/bsv/${wocNet}/address/${addr}/unspent`
      )
      setUtxos(got.map(x => ({
        txid: x.tx_hash,
        vout: x.tx_pos,
        satoshis: x.value,
        selected: true
      })))
    } catch (e) {
      toast.error(e.message)
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const handleSweep = async () => {
    try {
    const selectedUtxos = utxos.filter(x => x.selected)
    console.log('selected', selectedUtxos)
    const inputs = {}
    for (const i in selectedUtxos) {
      const utxo = selectedUtxos[i]
      if (!inputs[utxo.txid]) {
        inputs[utxo.txid] = await hashwrap(utxo.txid, {
          network,
          taalApiKey: network === 'testnet'
            ? 'testnet_ba132cc4d5b2ebde7ed0ee0f6ee3f678'
            : 'mainnet_6c8f8c37afd5c45e09f62d083288a181'
        })
        inputs[utxo.txid].outputsToRedeem = []
      }
      const tx = new bsv.Transaction()
      tx.from(new bsv.Transaction.UnspentOutput({
        txid: utxo.txid,
        outputIndex: utxo.vout,
        script: bsv.Script.fromAddress(bsv.Address.fromPrivateKey(
          bsv.PrivateKey.fromWIF(key)
        )),
        satoshis: utxo.satoshis
      }))
      const sig = bsv.Transaction.Sighash.sign(
        tx,
        bsv.PrivateKey.fromWIF(key),
        bsv.crypto.Signature.SIGHASH_FORKID |
        bsv.crypto.Signature.SIGHASH_NONE |
        bsv.crypto.Signature.SIGHASH_ANYONECANPAY,
        0, // Always 0
        bsv.Script.fromAddress(bsv.Address.fromPrivateKey(
          bsv.PrivateKey.fromWIF(key)
        )),
        new bsv.crypto.BN(utxo.satoshis)
      )
      const unlockingScript = bsv.Script.buildPublicKeyHashIn(
        bsv.PrivateKey.fromWIF(key).publicKey,
        sig,
        sig.nhashtype
      ).toHex()
      inputs[utxo.txid].outputsToRedeem.push({
        index: utxo.vout,
        unlockingScript
      })
    }
    console.log(inputs)
    // Create transaction redeeming selected UTXOs
    const result = await window.Ninja.getTransactionWithOutputs({
      inputs
    })
      console.log(result)
      setSuccess(true)
    } catch (e) {
      toast.error(e.message)
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <Typography variant='h3' paragraph>Sweep</Typography>
      <br />
      <br />
      {!success
        ? (
          <>
            <TextField
              fullWidth
              label='WIF key'
              onChange={e => setKey(e.target.value)}
            />
            <br />
            <br />
            <Button variant='contained' onClick={handleGetUtxos} disabled={loading}>Get UTXOs</Button>
            <br />
            <br />
            <div className={classes.utxos_grid}>
              <Typography><b>Sweep?</b></Typography>
              <Typography><b>txid</b></Typography>
              <Typography><b>vout</b></Typography>
              <Typography><b>amount</b></Typography>
              {utxos.map((x, i) => (
                <React.Fragment key={i}>
                  <Checkbox
                    checked={x.selected}
                    onChange={() => {
                      setUtxos(old => {
                        const n = [...old]
                        n[i].selected = !old[i].selected
                        return n
                      })
                    }}
                  />
                  <Typography>{x.txid}</Typography>
                  <Typography>{x.vout}</Typography>
                  <Typography>{x.satoshis / 100000000} BSV</Typography>
                </React.Fragment>
              ))}
            </div>
            <br />
            <br />
            <Button
              disabled={utxos.length < 1 || utxos.every(x => x.selected === false) || loading} onClick={handleSweep}
              variant='contained'
              color='primary'
              startIcon={<SendIcon />}
            >
              Sweep into Ninja
            </Button>
            <br />
            <br />
            {loading && <LinearProgress />}
          </>
          )
        : (
          <>
            <Typography paragraph>
              The coins have been successfully imported!
            </Typography>
            <Button
              variant='contained' onClick={() => {
                setSuccess(false)
                setUtxos([])
              }}
            >
              Done
            </Button>
          </>
          )}
    </div>
  )
}

export default Sweep
