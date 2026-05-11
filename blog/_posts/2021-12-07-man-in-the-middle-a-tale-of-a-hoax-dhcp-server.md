---
layout: post
title: "Man-in-the-middle: A tale of a hoax DHCP server"
date: 2021-12-07 12:00:00 +0530
tags: [networking, security, dhcp]
---

> Learn how a user can act like a hoax DHCP server and situate himself as a man in the middle, and how one can prevent such attacks.

DHCP, Dynamic Host Configuration Protocol, is a network protocol that offers IP address and additional details such as the gateway IP and the DNS IP to a host requesting to be a part of the network. A detailed description of the protocol and its structure is documented in [this](https://en.wikipedia.org/wiki/Dynamic_Host_Configuration_Protocol) wiki page. A DHCP server is a management server that maintains a pool of IP addresses, listens to requests for IP address from client joining the network and responds to them with an IP address offer on demand.

In a curious experiment where two independent DHCP servers are setup in the same physical network to observe how the system behaves led to an interesting outcome. This article explains the behavior of this system when two independently working DHCP servers are in the same physical network, how can a malicious user exploit by leveraging this opportunity, and what can network administrators do to prevent exploitation by this method.

## Story

There was a peaceful network where clients frequently join and leave, and the DHCP server serves new incoming clients with IP address for them to be a part of the network. One day a rogue client entered the network. As a routine the DHCP server served the client an IP address. As soon as it set itself up, the rogue client began executing its evil plans. It claimed itself to be a DHCP server too! But poor clients! They have been taught that when they enter a network the one who serves them the IP address is the DHCP server. The rogue client is leveraging this principle to try and be the first one to present the client with an IP address. This way the rogue client can let the incoming client know that the gateway to the internet and the domain name resolution server is itself. But, in fact this rogue client is forwarding the requests to the actual gateway and DNS server of the network, which it learned from the genuine DHCP server thus fulfilling client’s communication needs. The rogue client has successfully set itself up as a man-in-the-middle, overhearing the client’s communication with the internet and possibly manipulating them in transit!

## Setup

![setup](/blog/assets/res/maninthemiddle_a_tale_of_a_hoax_dhcp_server/setup.png)
*setup*

GNS3 is used in setting up the required infrastructure. Ubuntu docker containers are used as clients, while DHCP servers are Ubuntu docker containers with ISC DHCP server module installed. A simple switch is used to connect the four components of the network.

### The genuine DHCP server

- Navigate to `/etc/dhcp` directory in the DHCP server console, once it starts up.
- Append the following contents to the `dhcpd.conf` file:

```conf
subnet 192.168.1.0 netmask 255.255.255.0 {
 range 192.168.1.150 192.168.1.160;
 option routers 192.168.1.1;
 option domain-name-servers 192.168.1.1;
 option domain-name "example.org";
}
```

- Create an empty file, for the DHCP server to hold the leased IP addresses, by running the command: `touch /var/lib/dhcp/dhcpd.lease`.
- Then assign a static IP address(within the same subnet as in the DHCP configuration) to the primary network interface:
`ifconfig eth0 192.168.1.1/24`
- Finally, start the DHCP server by running: `dhcpd`

### The malicious DHCP server

![](/blog/assets/res/maninthemiddle_a_tale_of_a_hoax_dhcp_server/image.png)

- Before starting up this DHCP server, ensure that this device has at least 2 network interfaces. And, one of the interfaces is configured to fetch IP address via DHCP (from the genuine DHCP server).
- Start the server.
- Observe that the `eth1` interface obtained IP address from the genuine DHCP server.
- Follow similar steps as mentioned in the genuine DHCP server for configuration, but with a different subnet, say `192.168.2.1/24` . Ensure range, routers and domain-name-server fields are aligned to the subnet.
- Assign the primary network interface with a static IP address (within the same subnet as in the DHCP configuration):
`ifconfig eth0 192.168.2.1/24`
- Then start the DHCP server by running: `dhcpd`

## Run

Start up multiple clients in the network. Ensure that their network interfaces are configured to fetch IP address via DHCP. Observe the IP address of each client.

![IP address of different clients](/blog/assets/res/maninthemiddle_a_tale_of_a_hoax_dhcp_server/ip_address_of_different_clients.png)
*IP address of different clients*

Client-1 obtained 192.168.1.154 from the genuine DHCP server, while Client-2 obtained 192.168.2.160 from the rogue DHCP server. Client-2 has fallen victim!

Observe that in spite of the two clients being in the same collision domain, they will not be able to communicate with each other. The reason is that these two subnets (one maintained by the genuine DHCP server and the other by the rogue DHCP server) form **different overlay networks** over the same L2 network.

Soon one may realize that this is an **opportunistic** attack. It is a race between the genuine DHCP server and the rogue DHCP server as to whose DHCP offer the client will accept. The following image shows the filtered network capture of a new client joining the network. Observe the packet number 4 and 5. Both the rogue DHCP server and the genuine DHCP server race to serve the client. In this fortunate and unfortunate case, the client accepted the IP address offer from the genuine DHCP server (evident from packet number 7).

![DHCP filtered network capture of a new incoming client](/blog/assets/res/maninthemiddle_a_tale_of_a_hoax_dhcp_server/dhcp_filtered_network_capture_of_a_new_incoming_client.png)
*DHCP filtered network capture of a new incoming client*

## Inherent defenses and Prevention techniques

A malicious user situation himself as a man-in-the-middle lets him overhear all the communication the victim is in with the internet.

However, with today’s secure systems most of the applications communicate over encrypted channels. The key exchange also happens over a secured channel. For example, TLS is used for setting up a HTTPS connection with a server while browsing, and similarly TLS is used for setting up a secure shell with a remote server. Hence, **the risk of this attack is low**.

When building a network, the DHCP server are placed in a predictable and static location. They are connected to a specific port in a switch and the connection rarely changes. Hence, to explicitly prevent such attacks, network switches should be configured to accept DHCP offer and DHCP ACK packets only from a **specified port**. The switch can easily filter off the DHCP offer and ACK packets from other ports, thereby stopping the attack from happening at all.
