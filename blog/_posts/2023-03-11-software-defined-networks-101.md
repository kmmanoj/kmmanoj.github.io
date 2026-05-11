---
layout: post
title: "Software Defined Networks 101"
date: 2023-03-11 12:00:00 +0530
tags: [networking, sdn]
---

> A (very) brief introduction about Software Defined Networks

Software Defined Networking, abbreviated as SDN, is an approach to networking that separates the control plane from the data plane. This architecture allows for management and configuration of network by administrators through software rather than through hardware. Overall, SDN allows for easier scaling and management of the network, and consequently allows development of better network automation capabilities. Further, similar to how virtualization revolutionized utilization of compute systems, SDN in conjunction with NFV (Network Function Virtualization) better utilizes the compute systems for networking.

Before diving into technical details of SDN, one needs to understand the difference between control plane and data plane.

## Control plane vs Data plane

The control plane is a subset of the network that deals with functional traffic. The functional traffic includes those packets and protocols used to learn about the network and use that information to handle and route packets coming to it. For example, the L3 (OSI level 3 — network layer) network switches exchange OSPF packets in control plane and use this information to learn about the network and evaluate the next hop for packets flowing in the data plane. The data plane is the other subset of the network that deals with consumer traffic. The consumer traffic includes those packets that are exchanged for business purposes. For example, a HTTP packet from a computer to medium.com server asking for the Medium blog home page runs on the data plane.

### Analogies for control plane vs data plane

- The time spent to chart an action plan happens in control plane, while the time spent in executing the action plan happens in data plane.
- In a business setting, the services and money involved between the organization and the employees happen in control plane. While, the services and money involved between the organization and the customers happen in data plane.
- In a computer systems setting, the CPU utilized by the Operating System happens in control plane, while the CPU utilized for user processes happen in data plane.

## Traditional Network vs Software Defined Network

In a traditional network, the control plane traffic and the data plane intersect significantly as soon in the illustration below. The brain of the network is distributed across different network devices, and they work in tandem to move packets in data plane from one end to another end.

![Traditional Network](/blog/assets/res/software_defined_networks_101/traditional_network.png)
*Traditional Network*

While, in SDN the control plane is separated from the data plane as shown in the illustration below. The brain of the network is centralized at the SDN controller. The SDN switches and routers consult the SDN controller to determine what action to take for this packet.

To avoid burdening the SDN controller for every packet by every switch, the SDN controller could install rules in SDN switches and routers which could be of the (simplest) form (in RYU controller):

`if(condition X) perform action Y`

For example, condition X can be, packet is entering port `swt0` and the corresponding action Y can be packet should exit port `swt1`. This way whenever an SDN switch that has the above rule installed receives a packet from port `swt0` it would route the packet to port `swt1` without consulting the SDN controller.

![SDN Network](/blog/assets/res/software_defined_networks_101/sdn_network.png)
*SDN Network*

That is a short introduction about Software Defined Networks. I hope you gained a basic understanding of SDN is different from traditional networks and what are the basic constructs and components of an SDN network.
