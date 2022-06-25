import React, {useState} from 'react'
import { Button, Typography, TextField } from '@material-ui/core'
import {makeStyles} from '@material-ui/core/styles'
import atfinder from 'atfinder'
import bsv from 'bsv'
import { getPaymentAddress } from 'sendover'

const useStyles = makeStyles(
  theme => ({
  }),
  {name: 'Sweep'},
)

const Sweep = () => {
  const classes = useStyles()
  const [paymail, setPaymail] = useState('')
  const [amount, setAmount] = useState('')

  const handleSend = async () => {
    const client = window.Ninja.authriteClient
    const { identityKey } = await atfinder.getCertifiedKey(paymail, client)
    console.log(identityKey)
    const ourPaymail = await window.Ninja.getPaymail()
    const derivationPrefix = require('crypto')
      .randomBytes(10)
      .toString('base64')
     const suffix = require('crypto')
      .randomBytes(10)
       .toString('base64')
    const invoiceNumber = `3241645161d8 ${paymail} ${derivationPrefix} ${suffix}`
      // Derive the public key used for creating the output script
      const derivedAddress = getPaymentAddress({
        senderPrivateKey: client.clientPrivateKey,
        recipientPublicKey: identityKey,
        invoiceNumber,
        returnType: 'address'
      })
      // Create an output script that can only be unlocked with the corresponding derived private key
    const script = new bsv.Script(
          bsv.Script.fromAddress(derivedAddress)
        ).toHex()
    const tx = await window.Ninja.getTransactionWithOutputs({
      outputs: [{
        script,
        satoshis: parseInt(amount)
      }]
    })
    tx.outputs = {
      0: {
        suffix
      }
    }
    const request = {
      protocol: '3241645161d8',
      senderPaymail: ourPaymail,
      note: 'Payment sent with Ninja UI',
      transactions: [tx],
      derivationPrefix
    }
    const result = await atfinder.submitType42Payment(paymail, request, client)
    console.log('final result', result)
  }

  return (
    <div>
      <Typography variant="h3">Send</Typography>
      <TextField
        label='Paymail'
        onChange={e => setPaymail(e.target.value)}
      />
      <TextField
        label='Amount'
        onChange={e => setAmount(e.target.value)}
      />
      <Button onClick={handleSend}>Send</Button>
    </div>
  )
}

export default Sweep
