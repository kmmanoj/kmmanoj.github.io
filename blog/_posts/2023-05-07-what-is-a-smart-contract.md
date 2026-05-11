---
layout: post
title: "What is a smart contract?"
date: 2023-05-07 12:00:00 +0530
tags: [blockchain, ethereum, web3]
---

> Understand what a web3.0’s smart contract is with respect to a web2.0 technology

A smart contract can be thought of as a digital contract (or) agreement. It is a computer program whose functions define the terms of the agreement and executing functions is analogous to executing a term in the agreement. This computer program is stored in the blockchain network.

Anyone in the blockchain network can create a smart contract. The smart contract is deployed in every node of the blockchain network. When a user triggers a function in the smart contract, the function is executed by all the nodes in the blockchain network and the state change caused is verified and ingrained in a block of the blockchain network.

> The fact that every node in the blockchain network execute the function in smart contract when triggered by a single user is why they are termed “self-executing” in most definitions of smart contract

This way smart contracts are a transparent, secure and tamper-proof way of creating an agreement.

## Explanation with respect to a web2.0 technology

Consider the following python flask application that displays the message of the day. It also allows one to edit the message of the day.

```python
class Persistent:
    def __init__(self, identifier):
        self.identifier = identifier
        open(self.identifier, 'w').close()

    def set(self, value):
        f = open(self.identifier, 'w')
        f.write(str(value))
        f.close()
        return 'OK'

    def get(self):
        return open(self.identifier, 'r').read()

from flask import Flask

app = Flask(__name__)
motd = Persistent('motd')

@app.route('/get')
def get():
    return motd.get()

@app.route('/set/<string:motd_string>', methods=['POST'])
def set(motd_string):
    return motd.set(motd_string)

app.run()
```

`motd` is a persistent variable that can be retrieved and modified through the `get` and `set` API/function respectively.

Imagine this code to be deployed in every node, and every node is running the flask application listening for calls. The call to any function would be stored in the blockchain and the state change persists on successful function call.

The corresponding solidity code for the above flask application is:

```solidity
// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.0;

contract MOTD {
    string motd;

    function set(string memory motd_string) public returns(string memory) {
        motd = motd_string;
        return "OK";
    }

    function get() public view returns(string memory) {
        return motd;
    }
}
```

The contract `MOTD` has a state defined by the string variable `motd` . The `set` and `get` function retrieve and modify the state of the contract respectively.
