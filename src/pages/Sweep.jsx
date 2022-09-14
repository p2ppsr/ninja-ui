import React, { useState } from 'react'
import { Checkbox, Button, Typography, TextField } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import boomerang from 'boomerang-http'
import bsv from 'babbage-bsv'
import hashwrap from 'hash-wrap'

const useStyles = makeStyles(
  theme => ({
    utxos_grid: {
      display: 'grid',
      gridTemplateColumns: 'auto 1fr auto auto',
      gridGap: theme.spacing(2)
    }
  }),
  { name: 'Sweep' }
)

const Sweep = () => {
  const classes = useStyles()
  const [utxos, setUtxos] = useState([])
  const [key, setKey] = useState('')
  const [network, setNetwork] = useState('mainnet')

  const handleGetUtxos = async () => {
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
  }

  const handleSweep = async () => {
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
  }

  return (
    <div>
      <Typography variant='h3'>Sweep</Typography>
      <TextField
        label='WIF key'
        onChange={e => setKey(e.target.value)}
      />
      <Button onClick={handleGetUtxos}>Get UTXOs</Button>
      <div className={classes.utxos_grid}>
        <Typography><b>Sweep?</b></Typography>
        <Typography><b>txid</b></Typography>
        <Typography><b>vout</b></Typography>
        <Typography><b>amount</b></Typography>
        {utxos.map((x, i) => (
          <>
            <Checkbox
              key={`${x.txid}.${x.vout}-cb`}
              checked={x.selected}
              value={x.selected ? 'on' : 'off'}
              onChange={() => {
                setUtxos(old => {
                  old[i].selected = !old[i].selected
                  return old
                })
              }}
            />
            <Typography key={`${x.txid}.${x.vout}-t1`}>{x.txid}</Typography>
            <Typography key={`${x.txid}.${x.vout}-t2`}>{x.vout}</Typography>
            <Typography key={`${x.txid}.${x.vout}-t3`}>{x.satoshis / 100000000}</Typography>
          </>
        ))}
      </div>
      <Button disabled={utxos.length < 1} onClick={handleSweep}>Sweep</Button>
      <Button
        onClick={async () => {
          const result = await window.Ninja.getTransactionWithOutputs({
            outputs: [{ script: '006a', satoshis: 0 }]
          })
          console.log(result)
        }}
      >
        test
      </Button>
    </div>
  )
}

export default Sweep
