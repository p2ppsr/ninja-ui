import React, { useState } from 'react'
import {
  Button,
  Typography,
  LinearProgress,
  TextField
} from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import atfinder from 'atfinder'
import bsv from 'babbage-bsv'
import { getPaymentAddress } from 'sendover'
import { isAuthenticated, createAction } from '@babbage/sdk'
import { toast } from 'react-toastify'

const useStyles = makeStyles(
  theme => ({
  }),
  { name: 'Sweep' }
)

const Send = () => {
  const classes = useStyles()
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSend = async () => {
    try {
      setLoading(true)
      const authenticated = await isAuthenticated()
      if (!authenticated) {
        throw new Error('No MetaNet user is authenticated!')
      }
      const intermediateKey = bsv.PrivateKey.fromRandom()
      const script = new bsv.Script(
        bsv.Script.fromAddress(bsv.Address.fromPrivateKey(intermediateKey))
      )
      const fundingTx = await window.Ninja.getTransactionWithOutputs({
        outputs: [{
          script: script.toHex(),
          satoshis: parseInt(amount)
        }]
      })
      const fundingTxid = new bsv.Transaction(fundingTx.rawTx).id
      const tx = new bsv.Transaction()
      tx.from(new bsv.Transaction.UnspentOutput({
        txid: fundingTxid,
        outputIndex: 0,
        script,
        satoshis: parseInt(amount)
      }))
      console.log('got tx', tx)
      let sighashType = bsv.crypto.Signature.SIGHASH_FORKID |
        bsv.crypto.Signature.SIGHASH_NONE |
        bsv.crypto.Signature.SIGHASH_ANYONECANPAY
      const signature = bsv.Transaction.Sighash.sign(
        tx,
        intermediateKey,
        sighashType,
        0, // input index
        script, // locking script
        new bsv.crypto.BN(parseInt(amount))
      )
      console.log('got sig', signature)
      const unlockingScript = bsv.Script.buildPublicKeyHashIn(
        intermediateKey.publicKey,
        signature,
        signature.nhashtype
      ).toHex()
      await createAction({
        description: 'Receive money from the Ninja UI',
        inputs: {
          [fundingTxid]: {
            ...fundingTx,
            outputsToRedeem: [{
              index: 0,
              unlockingScript
            }]
          }
        }
      })
      setSuccess(true)
      toast.success('Payment sent! Restart Babbage Desktop.')
    } catch (e) {
      toast.error(e.message)
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <Typography variant='h3' paragraph>Send</Typography>
      {!success ? (
        <>
          <Typography paragraph>
            Ensure Babbage Desktop is open, or it will not work.
          </Typography>
          <TextField
            label='Amount (satoshis)'
            type='number'
            onChange={e => setAmount(e.target.value)}
          />
          <br />
          <br />
          <Button
            disabled={loading}
            onClick={handleSend}
            variant='contained'
            color='primary'
          >
            Send
          </Button>
          <br />
          <br />
          {loading && <LinearProgress />}
        </>) : (
        <>
          <Typography paragraph>
            You sent <b>{amount} satoshis</b> to Babbage Desktop! Restart to see your balance.
          </Typography>
          <Button
            onClick={() => {
              setSuccess(false)
              setAmont('')
            }}
            variant='contained'
          >
            Done
          </Button>
        </>
      )}
    </div>
  )
}

export default Send
