import React, { useState, useEffect } from 'react'
import ninja from 'utxoninja'
import { Typography } from '@material-ui/core'

const Transactions = () => {
  const [tx, setTx] = useState([])

  useEffect(() => {
    (async () => {
      const result = await ninja.getTransactions({
        xprivKey: window.localStorage.xprivKey
      })
      setTx(result.transactions)
    })()
  }, [])

  return (
    <div>
      <Typography variant='h3'>Transactions</Typography>
      {tx.map((x, i) => (
        <div key={i}>
          {x.txid}
          <ul>
            {Object.entries(x).map(([k, v]) => (
              <li><b>{k}</b>: {v}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}

export default Transactions
