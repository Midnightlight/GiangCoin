const { Blockchain, Transaction } = require('./blockchain');
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');
// initalize key
const myKey = ec.keyFromPrivate('Private key: 726fd5fc4f7291310ec3dde6a52ad447befc8c211a2f4557360c4f6e96f7d36c')
const myWalletAddress = myKey.getPublic('hex');


let giangCoin = new Blockchain();

const tx1 = new Transaction(myWalletAddress, 'public key of someone else goes here', 10);
tx1.signTransaction(myKey); // sign transaction with my key
giangCoin.addTransaction(tx1); // add transaction to blockchain

console.log('\n Starting the miner...');
giangCoin.minePendingTransactions(myWalletAddress); // use (myWalletAdrress) not someone's address like ('huy-address')


console.log('\n Balance of giang is ', giangCoin.getBalanceOfAddress(myWalletAddress)); // not ('huy-address')

console.log('Is chain valid?', giangCoin.isChainValid());

/* line 16 and 18:
use (myWalletAddress) because when we minePendingTransactions, we have to tell where the mining reward should go to.
In this case, the mining reward should go to wallet with address 'huy-address' but that address doesn't exist
if we do that, the coin will be sent to a wallet where no one can access because no one has the private key of that wallet
because there is only me in this blockchain */


/*
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
*/


/* Note: more zero in difficulty, more secure. For example:
the probability to start with 1 zero is 0.5 = 50% (binary: 0 and 1)
the probability to start with 2 zeros is (0.5)^2 = 0.25 = 25%
the probability to start with 3 zeros is (0.5)^3 = 0.125 = 12.5%
*/