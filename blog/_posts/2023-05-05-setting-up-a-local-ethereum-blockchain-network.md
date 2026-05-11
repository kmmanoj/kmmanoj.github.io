---
layout: post
title: "Setting up a local ethereum blockchain network"
date: 2023-05-05 12:00:00 +0530
tags: [blockchain, ethereum, web3]
---

> Setup an ethereum blockchain network in your local computer using geth to learn and develop smart contracts for dApps and more

The Ethereum blockchain is similar to the Bitcoin blockchain in that it is a distributed ledger that records all transactions. However, ethereum blockchain provides a platform to build decentralized apps in the form of smart contracts.

Given that the ethereum blockchain is a platform to build decentralized applications, it is key to learn this technology as it may revolutionize the way applications are built.

In this article, we shall go through how to setup a local blockchain network to learn, experiment and build on Ethereum.

## Installing geth

Geth (go-ethereum) is a Go implementation of Ethereum. It is an easy to setup ethereum client. Download and install geth from [https://geth.ethereum.org/downloads](https://geth.ethereum.org/downloads)

## Create the first node

An ethereum blockchain node is any system that has a storage and is able to perform computation (using processor and memory). In geth world, each geth process can be considered the compute scope of a node, and a directory can be considered as an isolated storage space for that node. Hence, we create first node by creating a directory. Let us call it `node00`.

> *For ease of reference,* `/rootnet` *shall be used as the base directory*

Create a directory in the base directory by the name `node00`:

```bash
mkdir /rootnet/node00
```

## Create the first account

An account, technically, is a cryptographic public-private key pair. An account is referenced by a 40-digit (20 bytes) hex code that is derived from the public key.

```text
address = sha3(publicKey)[-40:]
```

While, the private key is kept safe and secret by the account holder.

To create an account, run:

```bash
geth --datadir /rootnet/node00 account new
```

Note down the address of the account displayed.

## Configure the genesis block

A genesis block is the very first block in a blockchain network. To create such a block for the blockchain in setup, create a file called `genesis.json` in the base directory with the following content:

```json
{
    "config": {
        "chainId": 1337,
        "homesteadBlock": 0,
        "eip155Block": 0,
        "eip158Block": 0,
        "eip150Block": 0
    },
    "difficulty": "400000",
    "gasLimit": "2100000",
    "alloc": {
        "<Acc1 Addr>": { "balance": "1000000000000000000" }
    }
}
```

Replace `<Acc1 Addr>` with the address of the account created in the previous step. The above configuration allocates `1 ether` to the account.

> chainId 1337 is typically used for geth private chains

> EIP stands for Ethereum Improvement Proposal. It is analogous to RFCs in internet world. Refer [EIPs github repository](https://github.com/ethereum/EIPs/tree/master/EIPS) to learn more about EIPs.

## Initialize the first node

Initialise the ethereum blockchain by running geth and feeding it with the genesis block.

```bash
geth --datadir /rootnet/node00 init /rootnet/genesis.json
```

## [Optional] Ethereum network stats dashboard

Ethereum network statistics dashboard allows one to visualise the health of different nodes in the ethereum blockchain network. Download ethereum network stats dashboard from github and set it up:

```bash
git clone https://github.com/cubedro/eth-netstats
cd eth-netstats
npm install
sudo npm install -g grunt-cli
```

Run the ethereum network stats dashboard:

```bash
WS_SECRET=eth-netstats-password npm start
```

> *You could use a different* `WS_SECRET` *if necessary.*

The ethereum network stats dashboard should be running at [http://localhost:3000](http://localhost:3000)

## [Optional] Block explorer — Blockscout

Block explorer helps visualise the blocks created and its related information in the ethereum blockchain. Download blockscout from github:

```bash
git clone https://github.com/blockscout/blockscout.git
```

Before starting the visualizer, change all occurence of `host.docker.internal` under the blockscout directory to the IP address of your computer. Then, run blockscout:

```bash
cd blockscout/docker-compose
docker-compose -f docker-compose-no-build-geth.yml up
```

The block explorer dashboard should be running at [http://localhost:4000](http://localhost:4000)

## Start the node

Now run the first node

```bash
geth --identity "node00" --datadir=./node00 \
    --networkid=1337 --syncmode=full \
    --gcmode=archive --http --http.corsdomain="*" \
    --http.api=web3,eth,debug,personal,net,miner,admin \
    --allow-insecure-unlock --http.addr "0.0.0.0" --http.port 8000 \
    --authrpc.port 30000 --port 33000 \
    --ethstats=node00:eth-netstats-password@localhost:3000 --mine
```

> *Remove* `--ethstats` *option if you skipped Ethereum network stats dashboard setup.*

Note down the enode number in the logs of the process

```text
...Started P2P networking self=enode://0123456789abcdef0123456...@127.0.0.1:33000...
```

## Setup and create other nodes

The other nodes could use `node00` as a peer to learn about the blockchain built so far. Hence, in the previous step enode number was noted down so that the new node being created can use `node00` as the peer. The `geth.sh` file for the node:

```bash
#!/bin/bash
geth --identity "$1" --datadir=./$1 --networkid=1337 \
    --syncmode=full --gcmode=archive \
    --http --http.corsdomain="*" --http.api=web3,eth,debug,personal,net,miner \
    --allow-insecure-unlock \
    --bootnodes=enode://<the-saved-enode-addr>@127.0.0.1:33000 \
    --http.port $((8000+$2)) --authrpc.port $((30000+$2)) \
    --port $((33000+$2)) \
    --ethstats=$1:eth-netstats-password@localhost:3000 --mine
```

Replace `<the-saved-enode-addr>` with the saved enode address.

To create node n (say node n is identified as node0n):

- Create a directory `node0n`
- Initialize the node with genesis block:
`geth --datadir /rootnet/node0n init /rootnet/genesis.json`
- Create an account
`geth --datadir /rootnet/node0n account new`
- Run the node
`./geth.sh node0n`

> *To get CLI access to a node, say node00, one could run *`*geth attach http://localhost:8000*`*. Identify the HTTP port in which the node is running to connect to that node.*

## Setup metamask

MetaMask is a popular cryptocurrency wallet that enables users to interact with decentralized applications (dApps) on the Ethereum blockchain. It is available in the form of browser extension too.

Download metamask extension for your favorite browser. Then,

- Navigate to `Settings > Networks > Add Network`
- Set `New RPC URL` to be `http://localhost:8000` [ Recall that this is the http server endpoint served by `node00` ]
- Set `Chain ID` to be `1337`
- Set `Network Name` and `Currency symbol` of your interest.
- Set `Block explorer URL` to be `http://localhost:4000` [ Ensure you followed the steps to setup `blockscout` ]

Now, import the account in `node00` to metamask.

- Select `Import account` option displayed in the dropdown menu when clicked on the profile logo on the right top corner of the window.
- Find the private key:
- Install `web3` module in python as: `pip3 install web3
`- In a python interpreter, run the following to retrieve the private key:

```python
from web3.auto import w3
keyfile = 'UTC--...'
password = '<password>'
w3.eth.account.decrypt(open(f'/rootnet/node00/keystore/{keyfile}').read(), password)
```

- Paste the obtained private key in the dialog box that popped up on metamask as `Import account` was clicked.

## Write and deploy contract using remix

Remix is a web application that allows users to write, compile and deploy smart contracts to ethereum blockchain networks interactively. It is an IDE for decentralized application development.

- Navigate to [https://remix.ethereum.org/](https://remix.ethereum.org/)
- Select the `Deploy & run transactions` option on the left navigation bar
- From the `Environment` dropdown, select `Injected Provider - MetaMask` option
- The metamask window should pop up asking consent to provide access to remix. Approve it.
- Observe that your account address is seen in the `account` field of the `Deploy & run transactions` sub-window.

Now, you can write a contract or use a pre-existing one in the remix IDE, compile and deploy them to your blockchain network.

## Reference

[1] [https://medium.com/datawallet-blog/how-to-deploy-a-local-private-ethereum-blockchain-c2b497f068f4](https://medium.com/datawallet-blog/how-to-deploy-a-local-private-ethereum-blockchain-c2b497f068f4)
