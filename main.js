const SHA256 = require('crypto-js/sha256');  // install library in terminal: npm istall --save crypto-js

class Transaction {
    constructor(fromAddress, toAddress, amount) {
        this.fromAddress = fromAddress;
        this.toAddress = toAddress;
        this.amount = amount;
    }
}

class Block {
    constructor(timestamp, transactions, previousHash = '') {
        this.timestamp = timestamp;
        this.transactions = transactions;
        this.previousHash = previousHash;
        this.hash = this.calculateHash();
        this.nonce = 0;
    }

    calculateHash() {
        return SHA256(this.index + this.previousHash + this.timestamp + JSON.stringify(this.transactions) + this.nonce).toString();
    }

    mineBlock(difficulty) { // using Proof-of-Work algorithm to secure blockchain
        while (this.hash.substring(0, difficulty) !== Array(difficulty + 1).join("0")) {
            this.nonce++;
            this.hash = this.calculateHash();
        }

        console.log("Block mined: " + this.hash);
    }
}


class Blockchain { // create a blockchain
    constructor() {
        this.chain = [this.createGenesisBlock()];
        this.difficulty = 2; // our blocks will start with 2 zeros
        this.pendingTransaction = [];
        this.miningReward = 100; // 100 coins if you successully mine a new block
    }

    createGenesisBlock() {
        return new Block("01/01/2017", "Genesis block", "0");
    }

    getLatestBlock() {
        return this.chain[this.chain.length - 1];
    }

    // add rewards for miners
    minePendingTransactions(miningRewardAddress) {  // in reality, adding all the pending transaction to a block is impossible
        let block = new Block(Date.now(), this.pendingTransaction);
        block.mineBlock(this.difficulty);

        console.log('Block successfully mined!');
        this.chain.push(block);

        this.pendingTransaction = [
            new Transaction(null, miningRewardAddress, this.miningReward)
        ];
    }

    createTransaction(transaction) {    // receive and add transaction to PendingTransactions area
        this.pendingTransaction.push(transaction);
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

    isChainValid() {
        for (let i = 1; i < this.chain.length; i++) {
            const currentBlock = this.chain[i];
            const previousBlock = this.chain[i - 1];

            if (currentBlock.hash !== currentBlock.calculateHash()) {
                return false;
            }

            if (currentBlock.previousHash !== previousBlock.hash) {
                return false;
            }
        }

        return true;
    }
}

let giangCoin = new Blockchain();
giangCoin.createTransaction(new Transaction('address1', 'address2', 100));
giangCoin.createTransaction(new Transaction('address2', 'address1', 20));

console.log('\n Starting the miner...');
giangCoin.minePendingTransactions('giang-address');

console.log('\n Balance of giang is ', giangCoin.getBalanceOfAddress('giang-address'));
// Balance of giang will be 0 because in mining method, after a block has been mined; 
// we create a new transaction to give you miningReward but that one is added to the pendingTransaction array. 
// so the miningReward will only be sent wen the next block is mined.



console.log('\n Starting the miner again...');
giangCoin.minePendingTransactions('giang-address');

console.log('\n Balance of giang is ', giangCoin.getBalanceOfAddress('giang-address'));
// Balance of giang will be 100
// in our mining second block, we also get a new reward which is again in the pendingTransaction state 
// and will again be included in the next block that is mined.

/*Note: more zero in difficulty, more secure. For example:
the probability to start with 1 zero is 0.5 (binary -> 0 and 1)
the probability to start with 2 zeros is (0.5)^2 = 0.25
the probability to start with 3 zeros is (0.5)^3 = 0.125
*/