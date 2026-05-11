---
layout: post
title: "Deploy your first smart contract"
date: 2023-05-07 12:00:00 +0530
tags: [blockchain, ethereum, web3, solidity]
---

> With simplest setup possible, deploy your first smart contract in the Ethereum’s official test network!

This article describes how to deploy your first smart contract with the simplest setup possible. The following are the steps to be performed, in brief:

- Install and setup Metamask
- Mine some coins for Sepolia network using faucet service
- Develop, compile and deploy a smart contract using Remix

> I strongly recommend you to read [my blog article that explains what is a smart contract](https://blog.kmmanoj.me/what-is-a-smart-contract-6895da46c46a)

## Install and setup Metamask

To interact with a blockchain network you would need a public-private key pair. Your account number is derived from the public key, while you would use the private key to sign and send transactions.

> Function calls to smart contracts are also transactions

It is important to store your private key information securely. If it is stolen, it is as good as the robber owning all the money you have in that account. If lost, you will not be able to use any money in that account.

[Metamask](https://metamask.io/) is a wallet application that manages your public-private key pairs. It allows you to interact with web3 applications i.e. with the blockchain network(s).

Navigate to [https://metamask.io/](https://metamask.io/) and install the metamask browser extension for your favorite browser.

![Metamask setup page](/blog/assets/res/deploy_your_first_smart_contract/metamask_setup_page.png)
*Metamask setup page*

Once the Metamask extension is installed you should see a page as shown in the picture above. Select ‘Create a new wallet’ and follow through the procedure. By the end of the procedure, you should observe a page displaying your current balance and the account number, as shown below.

![](/blog/assets/res/deploy_your_first_smart_contract/image.png)

Then, click on the dropdown menu where ‘Ethereum Mainnet’ is selected and click on ‘show/hide test networks’. Configure to show test networks. Now, you should be able to observe a test network by the name ‘Sepolia test network’. Select that network to go ahead.

## Mine some coins from faucet service

You need virtual money to interact with the blockchain. For test network like Sepolia network, you need SepoliaETH coins to write into the blockchain network. To earn SepoliaETH coins, one can find multiple websites that provide some coins. The service that provides coins is known as the faucet service. One of the services that provide SepoliaETH coins is [https://sepolia-faucet.pk910.de/](https://sepolia-faucet.pk910.de/) . Enter your account address found in Metmask dashboard page in the faucet service ETH address field and start mining some coins.

> You need not mine 100s of SepoliaETH coins. A mere 0.01 or less coins are enough to deploy a simple smart contract as of May 2023.

## Develop, compile and deploy a smart contract using Remix

[Remix](https://remix.ethereum.org/) is an web-based IDE that requires no-setup and provides a GUI for developing, compiling and deploying smart contracts.

### Develop

Let us deploy the default provided `1_Storage.sol` to SepoliaETH network.

![Remix IDE: 1_Storage.sol](/blog/assets/res/deploy_your_first_smart_contract/remix_ide_1_storage_sol.png)
*Remix IDE: 1_Storage.sol*

### Compile

Select the third icon on the left vertical navigation bar that says ‘Solidity compiler’ on hover. Click on ‘Compile 1_Storage.sol’ to compile the contract.

![Remix IDE: compiling 1_Storage.sol](/blog/assets/res/deploy_your_first_smart_contract/remix_ide_compiling_1_storage_sol.png)
*Remix IDE: compiling 1_Storage.sol*

### Deploy

Then, select the forth icon on the left vertical navigation bar that says ‘Deploy & run transactions’. Select ‘Injected Provider — Metamask’ for the Environment field. Once, an account is connected, the account number should be visible in the dropdown under Account field (marked in red in the picture below). Then, click ‘Deploy’.

![Remix IDE: deploying 1_Storage.sol](/blog/assets/res/deploy_your_first_smart_contract/remix_ide_deploying_1_storage_sol.png)
*Remix IDE: deploying 1_Storage.sol*

A metamask notification should pop up asking you to sign the transaction to authorize the transaction. The transaction here is deployment of the contract. Once you authorize the transaction, the contract should get deployed in sometime (about less than 30 seconds as of May 2023).

You should be able to observe your contract under the ‘Deployed Contracts’ section. You can interact with the smart contract through the `store` and `retrieve` functions.

Play with it!
