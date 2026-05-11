---
layout: post
title: "ARP Spoofing using Scapy"
date: 2020-08-02 12:00:00 +0530
tags: [networking, security, scapy]
---

> Learn and try out ARP spoofing all by yourself in a Docker network using Scapy!

**ARP spoofing** or **ARP cache poisoning** is a network exploitation technique in which a malicious node in a local area network claims itself to be one of the other nodes in the network. A malicious user performs this attack on LAN to establish itself as a man in the middle, or sometimes act as the destination node itself.

## What is ARP?

**ARP** stands for **Address resolution protocol**. This protocol works between Layer 2 and Layer 3 of the OSI model. The goal of this protocol is to exchange the MAC address of the next-hop node when the requesting node knows the IP address of the next-hop node.

Consider a LAN network having subnet ID 172.17.0.0/24, where a node, *Node A*, is trying to navigate to the medium.com website. *Node A* has an IP address 172.17.0.2, which it received from the DHCP pool when it first entered the network. In addition to the IP address, *Node A* also obtained the gateway IP address (say, 172.17.0.1) and the DNS IP address (say, 172.17.0.100) during the DHCP offer. To make an HTTP request to medium.com, *Node A* begins by building the packet. While building the IP layer (L3) of the packet it needs to fill in the IP address in the *dst* field of the L3 headers. Let's say, it found the hostname-IP mapping in its own cache (after all it is a frequently accessed website 😉 ) and hence didn't perform a DNS request. Then, the packet building proceeds to the data link layer (L2). Now, *Node A* needs to fill in the destination MAC address in *dst* field of the L2 headers. It realizes that the destination IP address is outside the subnet in which it is residing. The node then looks into its routing table and identifies the next-hop IP address i.e. the gateway IP address. Hence, in the L2 header of the HTTP request, it needs to fill in the MAC address of the gateway node. Thus, *Node A* makes an **ARP request** by broadcasting a message that says "Hey, ***everyone***! I am ***Node A,*** and here is my MAC address and my IP address. Tell ***me*** who is ***172.17.0.1***!" The appropriate node i.e. the gateway, replies with an **ARP response** by sending a unicast message that says "Hey, ***Node A*!** I am gateway, and here is my MAC address and my IP address. My MAC address is ***00:01:02:03:04:05***." Once, Node A receives the MAC address, it fills in the details in the L2 header of the HTTP request and puts the packet into the network. The rest is history!

The following two images show the network capture of ARP request and ARP response in the LAN:

![ARP request by Node A](/blog/assets/res/arp_spoofing_using_scapy/arp_request_by_node_a.png)
*ARP request by Node A*

![ARP response by the gateway](/blog/assets/res/arp_spoofing_using_scapy/arp_response_by_the_gateway.png)
*ARP response by the gateway*

## The "unauthenticable" response

Carefully observe the last couple of network transactions. An ARP request is broadcasted into the LAN because *Node A* does not know the MAC address of the gateway. *Node A* then receives a response from the "*relevant"* node. *Node A* has no way to authenticate the response it got. It has to blindly believe that the MAC address claimed in the response is the MAC address of the gateway. This is where ARP spoofing comes into play!

A malicious node in the LAN could respond back to *Node A* as soon as it sees an ARP request in the LAN from *Node A*. Luckily, if the malicious node's response reaches *Node A* first then the malicious node has successfully spoofed itself as the node that *Node A* is to communicate with.

## **Don't talk, show me the code!**

In this demonstration, [Docker](https://www.docker.com/products/docker-desktop) containers are used as nodes and a Docker network as the local area network. [Scapy](https://scapy.net/), a network utility to craft custom packets, is used in the malicious node to craft spoofed ARP response and spoofed ICMP responses.

### Magic

The following terminal snapshot shows a successful ARP spoof. Observe that the docker network, named *lan* and having subnet ID 192.168.56.0/24, has only two nodes with IP addresses 192.168.56.2 and 192.168.56.3. But surprisingly, a node is able to make successful pings to 192.168.56.4!

![](/blog/assets/res/arp_spoofing_using_scapy/successful_arp_spoof_terminal.png)

### The Spoofer

In this demonstration, we shall spoof ourselves as a node that is not alive in the LAN. Hence, when a victim node makes an ARP request to an IP address that is not live, the spoofer node jumps in to claim the node as itself by responding to the ARP request with its own MAC address. In other words, the spoofer node is going to respond to the request meant for other nodes.

The spoofer code is written in python 3 and uses the Scapy library.
Code format inspired by [https://thepacketgeek.com/scapy/building-network-tools/part-09/](https://thepacketgeek.com/scapy/building-network-tools/part-09/)

{% gist kmmanoj/d3c39c323b0a96f9e7cc4974fae77654 %}

The main function sniffs for packets in the local area network. Each packet is processed by the `spoofer` function.

The spoofer function handles two types of request:

- ARP request not for itself
- ICMP request not for itself

For the ARP request, it crafts an ARP response packet. It sets the destination MAC address and IP address with sender details. It fills the source MAC address as it's own MAC address, while source IP address as the destination IP address found in the request packet. This is how the malicious node is able to claim itself as the IP address in the request packet.

The implementation performs a similar header value setting for the ICMP response too.

### Setup

The lab environment used here is a machine that has [Docker engine](https://www.docker.com/products/docker-desktop) installed. Let us first create a docker network with subnet ID 192.168.56.0/24. Run the following command to create the docker network with an identifier, *lan*.

```bash
docker network create lan --subnet 192.168.56.0/24
```

In a terminal instance, spin up a `scapy` docker container in *lan* network in interactive mode and requesting for a TTY. In addition, mount the volume which contains the spoofer code. (Or you could perform a [docker copy](https://docs.docker.com/engine/reference/commandline/cp/)) The [scapy](https://github.com/kmm4n0j/100days_of_infosec/blob/master/scapy/dockerfile) docker image is built on top of `[ehlers/scapy](https://hub.docker.com/r/ehlers/scapy)`.

```bash
docker run -it --network lan -v $(pwd)/arp_spoof.py:/arp_spoof.py scapy
```

Run the `arp_spoof.py` file

```bash
python3 /arp_spoof.py
```

Then, in another terminal instance spin up a `busybox` container in *lan* network in interactive mode and requesting for a TTY. A `busybox` docker image has network utilities, such as *ping* and *nslookup*, pre-installed in them.

```bash
docker run -it --network lan busybox
```

Now, ping different IP addresses and observe that every IP address is reachable, while, there are only two nodes in the network! Hence, the spoofer was successfully able to imitate itself as other nodes in the LAN!

![Demonstration of a successful ARP spoofing attack](/blog/assets/res/arp_spoofing_using_scapy/demonstration_of_a_successful_arp_spoofing_attack.png)
*Demonstration of a successful ARP spoofing attack*

### **How and why does it work?**

Let me keep it brief! Similar to the HTTP request, the ICMP request is being crafted by the `busybox` container. To fill in L2 header values, it broadcasts an ARP request. The spoofer jumps in and replies with an ARP unicast response. The `busybox` container learns the MAC address (as spoofer's MAC address) associated with the requested IP address. Thus, the ping requests coming into the network hops to the network interface associated with the spoofer's MAC address.

Hope you like this article! More of this to come, stay tuned!

## Edit: ARP Spoofing using Scapy Answering machine

Inspired by [guedou](https://twitter.com/guedou)!

{% gist kmmanoj/b4d3a8e62ad3963e061c1cc2d0e9fc7c %}
