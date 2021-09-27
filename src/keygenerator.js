const EC = require('elliptic').ec;  // npm install elliptic  -> library to generate public and private key, sign and verify a signature.
const ec = new EC('secp256k1');     // this is the algorithm and also the basis of Bitcoin wallets; ec: elliptic curve library

const key = ec.genKeyPair();                // generate key pair 
const publicKey = key.getPublic('hex');     // extract public key
const privateKey = key.getPrivate('hex');   // extract private key

console.log();                              // create an empty line 
console.log('Private key:', privateKey);

console.log();
console.log('Public key:', publicKey);
// We need to use the public key and the private key to sign the transaction and verify our balance