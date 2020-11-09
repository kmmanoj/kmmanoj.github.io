---
layout: post
title: "Networking with dockers"
date: 2020-04-19
description: Juggling network packets between docker containers across different subnets
author: kmmanoj
---
[Docker](https://www.docker.com/) enables developers to create _containers_ to host microservice applications in the most easiest way possible. Docker provides networking support, with the help of which two or more containers can communicate with each other.

Alright, so if the docker containers are in the same subnet, then the single broadcast domain will ensure communication between containers by _switching_ packets. But, what if the containers are in different subnets (in different broadcast domains)? Does docker have the capability of _routing_ packets too?

---
{: data-content="Introduction" }

Consider two hosts in two different subnets: _10.10.10.0/24_ and _192.168.10.0/24_.
To ensure that the shells on right top corner and bottom left corner are in fact docker shells, observe that the process number 1 is **not** _init_.

{% include image.html url="4-magic.png" description="How does this happen?" %}

---
{: data-content="Setting up the environment" }

Create two docker networks, using the following commands:

```bash
# tty0: docker engine node
$ docker network create left --subnet 10.10.10.0/24
$ docker network create right --subnet 192.168.10.0/24
```

Create a container in the _left_ subnet and one in the _right_ subnet, by using the following commands:

```bash
# tty1: left host
$ docker run -it --network left --name left_host --cap-add NET_ADMIN busybox
/ $
```

```bash
# tty2: right host
$ docker run -it --network right --name right_host --cap-add NET_ADMIN busybox
/ $
/ $ # What's cap-add option? 
/ $ # Patience! The answer will be revealed when its time!
```

Let's try if the _right_host_ is reachable from _left_host_

```bash
# tty2: right host
/ $ ifconfig
eth0      Link encap:Ethernet  HWaddr 02:42:AC:11:00:02  
          inet addr:192.168.10.2  Bcast:192.168.10.255  Mask:255.255.255.0
          UP BROADCAST RUNNING MULTICAST  MTU:1500  Metric:1
          RX packets:14 errors:0 dropped:0 overruns:0 frame:0
          TX packets:5 errors:0 dropped:0 overruns:0 carrier:0
          collisions:0 txqueuelen:0 
          RX bytes:1088 (1.0 KiB)  TX bytes:434 (434.0 B)
        
lo        Link encap:Local Loopback  
          inet addr:127.0.0.1  Mask:255.0.0.0
          UP LOOPBACK RUNNING  MTU:65536  Metric:1
          RX packets:0 errors:0 dropped:0 overruns:0 frame:0
          TX packets:0 errors:0 dropped:0 overruns:0 carrier:0
          collisions:0 txqueuelen:1000 
          RX bytes:0 (0.0 B)  TX bytes:0 (0.0 B)
```

```bash
# tty1: left host
/ $ ping 192.168.10.2 -c 3 -I 10.10.10.2
PING 192.168.10.2 (192.168.10.2) from 10.10.10.2: 56 data bytes

--- 192.168.10.2 ping statistics ---
3 packets transmitted, 0 packets received, 100% packet loss
```

Oh no! Docker doesn't seem to have _routing_ capabilities by default.

---
{: data-content="Science" }

To enable communication across broadcast domains, a **router** is required. Is a software defined router required, in case of docker networks?

No! Let's keep it simple. Create another similar docker container, but with **two** network adapters. One connected to the _left_ network and the other to the _right_ network.

```bash
# tty4: router
$ docker run -it --network left --name router --cap-add NET_ADMIN busybox
/ $
```

```bash
# tty0: docker engine node
# connect the router container to the right network too
$ docker network connect right router
```

Now, all we need to do is, write a rule on the hosts to route the traffic to the other subnet through the _router_.

```bash
# tty1: left host
/ $ ip route add 192.168.10.0/24 via 10.10.10.3 dev eth0
```

```bash
# tty2: right host
/ $ ip route add 10.10.10.0/24 via 192.168.10.3 dev eth0
```

It is time to reveal what is _cap-add_ option!

The _ip route_ edition commands work only if the docker container has _NET_ADMIN_ permission.

The following image shows the state of the containers after configurations.

{% include image.html url="4-revealed.png" description="science" %}

That's it! Now try reaching _right_host_ from the _left_host_ and vice-versa.

{% include image.html url="4-magic.png" description="This is how it happens!" %}

Isn't this interesting?

---
{: data-content="Food for thought" }

- Create three different subnets, with two routers between the hosts and enable the hosts to communicate with each other. 

```bash
<host1>--network1--<router1>--network2--<router2>--network3--<host2>
```

- [Docker supports DNS resolutions](https://docs.docker.com/network/network-tutorial-standalone/#use-user-defined-bridge-networks) of container names to their IP address, within a network. In similar lines, create a custom DNS that resolves inter-subnet queries.

