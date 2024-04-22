const express = require("express");
const app = express();
const { keccak256 } = require("ethereum-cryptography/keccak");

const cors = require("cors");
const { utf8ToBytes } = require("ethereum-cryptography/utils");
const port = 3042;

app.use(cors());
app.use(express.json());
const secp = require("ethereum-cryptography/secp256k1");

const balances = {
  "038886aa2b9f280d40997052893ed0c828ef2044e5772e83c884ce039d9ee963e2": 100,
  "037ca21eed7f8931ae71a3c76e876d7845b2d6942255eec749ed319cdc4f01b052": 50,
  "031931210f297935a639cad094f8a535f6762e6c6b6ba9f815d66ea3dec7862f2f": 75,
};

app.get("/balance/:address", (req, res) => {
  const { address } = req.params;
  const balance = balances[address] || 0;
  res.send({ balance });
});

app.post("/send",async (req, res) => {
  const { sender, recipient, amount, nonce, signTxn } = req.body;

  setInitialBalance(sender);
  setInitialBalance(recipient);

  const [signature,recoverybit]=signTxn
  const formattedSignature=Uint8Array.from(Object.values(signature))
  const msgToBytes=utf8ToBytes(recepient + amount + JSON.stringify(nonce))
  const msgHash=toHex(keccak256(msgToBytes))
  const publicKey=await secp.recoverPublicKey(msgHash,formattedSignature,recoverybit)
  const verifyTxn=secp.verify(formattedSignature,msgHash,recoverybit)

  if (!verifyTx) {
    res.status(400).send({ message: "Invalid Transection" });
  }
  
  if (balances[sender] < amount) {
    res.status(400).send({ message: "Not enough funds!" });
  } else {
    balances[sender] -= amount;
    balances[recipient] += amount;
    res.send({ balance: balances[sender] });
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});

function setInitialBalance(address) {
  if (!balances[address]) {
    balances[address] = 0;
  }
}
