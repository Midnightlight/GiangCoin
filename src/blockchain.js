const SHA256 = require('crypto-js/sha256');  // install library in terminal: npm istall --save crypto-js
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');

class Transaction {
    constructor(fromAddress, toAddress, amount) {
        this.fromAddress = fromAddress;
        this.toAddress = toAddress;
        this.amount = amount;
    }

    // check if the signature on this transaction is indeed valid
    calculateHash() { // method to return the sha 256 hash of that transaction, we will sign this hash with our private key
        return SHA256(this.fromAddress + this.toAddress + this.amount).toString();
    } // we only sign the hash of the transaction, not all data of the transaction

    signTransaction(signingKey) { // method to receive a signing key (private and public key pair) to sign a transaction
        if (signingKey.getPublic('hex') !== this.fromAddress) {
            throw new Error('You cannot sign transactions for other wallets!');
        }

        const hashTx = this.calculateHash();
        const sig = signingKey.sign(hashTx, 'base64'); // sign the transaction in base 64
        this.signature = sig.toDER('hex'); // to store this signature into this transaction
    }

    isValid() { // method to verify if our transaction has been correctly signed
        if (this.fromAddress === null) return true;

        if (!this.signature || this.signature.length === 0) { // check if there isn't the signature or the signature is empty
            throw new Error('No signature in this transaction');
        }
        // if there is a signature, extract the public key from it and verify that this transaction has indeed been signed by that key
        const publicKey = ec.keyFromPublic(this.fromAddress, 'hex');
        return publicKey.verify(this.calculateHash(), this.signature);
    }
}

class Block {
    constructor(timestamp, transactions, previousHash = '') {
        this.timestamp = timestamp;
        this.transactions = transactions;
        this.previousHash = previousHash;
        this.nonce = 0;
        this.hash = this.calculateHash();
    }

    calculateHash() {
        return SHA256(this.previousHash + this.timestamp + JSON.stringify(this.transactions) + this.nonce).toString();
    }

    mineBlock(difficulty) { // using Proof-of-Work algorithm to secure blockchain
        while (this.hash.substring(0, difficulty) !== Array(difficulty + 1).join('0')) {
            this.nonce++;
            this.hash = this.calculateHash();
        }

        console.log("BLOCK MINED: " + this.hash);
    }

    hasValidTransactions() { // method to verify that all the transactions in the current block are valid
        for (const tx of this.transactions) {
            if (!tx.isValid()) {
                return false;
            }
        }

        return true;
    }
}


class Blockchain { // create a blockchain
    constructor() {
        this.chain = [this.createGenesisBlock()];
        this.difficulty = 2; // our blocks will start with 2 zeros
        this.pendingTransactions = [];
        this.miningReward = 100; // 100 coins if you successully mine a new block
    }

    createGenesisBlock() {
        return new Block(Date.parse('2017-01-01'), [], '0');
    }

    getLatestBlock() {
        return this.chain[this.chain.length - 1];
    }
    // add rewards for miners
    minePendingTransactions(miningRewardAddress) {  // in reality, adding all the pending transaction to a block is impossible
        const rewardTx = new Transaction(null, miningRewardAddress, this.miningReward);
        this.pendingTransactions.push(rewardTx);

        let block = new Block(Date.now(), this.pendingTransactions, this.getLatestBlock().hash);
        block.mineBlock(this.difficulty);

        console.log('Block successfully mined!');
        this.chain.push(block);

        this.pendingTransactions = []; // [new Transaction(null, miningRewardAddress, this.miningReward)]
    }

    addTransaction(transaction) {    // receive and add transaction to PendingTransactions area
        // check if the fromAddress and toAddress are filled
        if (!transaction.fromAddress || !transaction.toAddress) {
            throw new Error('Transaction must in include from and to addresses');
        }
        // verify that the transaction which we want to add is indeed valid
        if (!transaction.isValid()) {
            throw new Error('Cannot add invalid transaction to chain');
        }

        this.pendingTransactions.push(transaction);
    }

    getBalanceOfAddress(address) {
        let balance = 0;

        for (const block of this.chain) {
            for (const trans of block.transactions) {
                if (trans.fromAddress == address) {
                    balance -= trans.amount;
                }

                if (trans.toAddress == address) {
                    balance += trans.amount;
                }
            }
        }

        return balance;
    }
    // method goes over all the blocks in the chain to verify that the hashes are correct and that each block links to previous block
    isChainValid() {
        for (let i = 1; i < this.chain.length; i++) {
            const currentBlock = this.chain[i];
            const previousBlock = this.chain[i - 1];
            // verify that all transactions in the current block are valid
            if (!currentBlock.hasValidTransactions()) { // if the current block has not all valid transactions
                return false;
            }

            if (currentBlock.hash !== currentBlock.calculateHash()) {
                return false;
            }

            if (currentBlock.previousHash !== previousBlock.calculateHash()) {
                return false;
            }
        }

        return true;
    }
}

module.exports.Blockchain = Blockchain;
module.exports.Transaction = Transaction;
