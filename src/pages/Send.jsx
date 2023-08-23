import React, { useState } from 'react'
import {
  Button,
  Typography,
  LinearProgress,
  TextField,
  Divider
} from '@mui/material'
import bsv from 'babbage-bsv'
import { getPaymentAddress } from 'sendover'
import { isAuthenticated, createAction } from '@babbage/sdk'
import { toast } from 'react-toastify'
import { Ninja } from 'ninja-base'

const Send = () => {
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const [ninjaLoading, setNinjaLoading] = useState(false)
  const [ninjaAmount, setNinjaAmount] = useState('')
  const [ninjaPrivateKey, setNinjaPrivateKey] = useState('')
  const [ninjaDojoURL, setNinjaDojoURL] = useState(
    window.localStorage.server || ''
  )
  const [ninjaSuccess, setNinjaSuccess] = useState(false)

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
      const sighashType = bsv.crypto.Signature.SIGHASH_FORKID |
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

  const handleNinjaSend = async () => {
    try {
      setNinjaLoading(true)
      // Create a derivation prefix and suffix to derive the public key
      const derivationPrefix = require('crypto')
        .randomBytes(10)
        .toString('base64')
      const derivationSuffix = require('crypto')
        .randomBytes(10)
        .toString('base64')
      // Derive the public key used for creating the output script
      const derivedPublicKey = getPaymentAddress({
        senderPrivateKey: window.localStorage.privateKey,
        recipientPublicKey: bsv.PrivateKey.fromHex(ninjaPrivateKey)
          .publicKey.toString(),
        invoiceNumber: `2-3241645161d8-${derivationPrefix} ${derivationSuffix}`,
        returnType: 'publicKey'
      })

      // Create an output script that can only be unlocked with the corresponding derived private key
      const script = new bsv.Script(
        bsv.Script.fromAddress(bsv.Address.fromPublicKey(
          bsv.PublicKey.fromString(derivedPublicKey)
        ))
      ).toHex()
      // Create a new output to spend
      const outputs = [{
        script,
        satoshis: ninjaAmount
      }]

      // Build a transaction for the foreign Nija
      const transaction = await window.Ninja.getTransactionWithOutputs({
        outputs,
        note: 'Outgoing payment from the Ninja UI to foreign Ninja'
      })

      transaction.outputs = [{
        vout: 0,
        satoshis: ninjaAmount,
        derivationSuffix
      }]

      // Create a foreign Ninja for processing the new payment
      const foreignNinja = new Ninja({
        privateKey: ninjaPrivateKey,
        config: {
          dojoURL: ninjaDojoURL
        }
      })

      console.log(JSON.stringify(transaction, null, 2))

      const directTransaction = {
        derivationPrefix,
        transaction,
        senderIdentityKey: bsv.PrivateKey.fromString(window.localStorage.privateKey)
          .publicKey.toString(),
        protocol: '3241645161d8',
        note: 'Incoming payment from Ninja UI'
      }

      console.log(JSON.stringify(directTransaction, null, 2))

      // Process the incoming transaction
      await foreignNinja.submitDirectTransaction(directTransaction)

      setNinjaSuccess(true)
      toast.success('Payment sent! Recipient Ninja has processed transaction.')
    } catch (e) {
      toast.error(e.message)
      console.error(e)
    } finally {
      setNinjaLoading(false)
    }
  }

  return (
    <div>
      <Typography variant='h3' paragraph>Send</Typography>
      <Divider />
      <br />
      <br />
      <Typography variant='h5' paragraph>MetaNet Client</Typography>
      {!success
        ? (
          <>
            <Typography paragraph>
              Ensure a MetaNet Client is open, or it will not work.
            </Typography>
            <TextField
              label='Amount (satoshis)'
              type='number'
              value={amount}
              fullWidth
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
              Send to Client
            </Button>
            <br />
            <br />
            {loading && <LinearProgress />}
          </>)
        : (
          <>
            <Typography paragraph>
              You sent <b>{amount} satoshis</b> to Babbage Desktop! Restart to see your balance.
            </Typography>
            <Button
              onClick={() => {
                setSuccess(false)
                setAmount('')
              }}
              variant='contained'
            >
              Done
            </Button>
          </>
          )}
      <Divider />
      <br />
      <br />
      <Typography variant='h5' paragraph>Another Ninja</Typography>
      {!ninjaSuccess
        ? (
          <>
            <Typography paragraph>
              Enter the other Ninja's private key and Dojo URL. Then enter the amount to send.
            </Typography>
            <TextField
              label='Amount (satoshis)'
              type='number'
              fullWidth
              value={ninjaAmount}
              onChange={e => setNinjaAmount(parseInt(e.target.value))}
            />
            <br />
            <br />
            <TextField
              label='External Ninja Private Key (hex)'
              value={ninjaPrivateKey}
              fullWidth
              onChange={e => setNinjaPrivateKey(e.target.value)}
            />
            <br />
            <br />
            <TextField
              label='External Dojo URL'
              value={ninjaDojoURL}
              fullWidth
              onChange={e => setNinjaDojoURL(e.target.value)}
            />
            <br />
            <br />
            <Button
              disabled={ninjaLoading}
              onClick={handleNinjaSend}
              variant='contained'
              color='primary'
            >
              Send to Ninja
            </Button>
            <br />
            <br />
            {ninjaLoading && <LinearProgress />}
          </>)
        : (
          <>
            <Typography paragraph>
              You sent <b>{ninjaAmount} satoshis</b> to an external Ninja! The money has been received and processed by the recipient.
            </Typography>
            <Button
              onClick={() => {
                setNinjaSuccess(false)
                setNinjaAmount('')
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
