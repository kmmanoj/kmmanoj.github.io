---
layout: post
title: "Networking with dockers"
date: 2020-04-26 12:00:00 +0530
tags: [docker, networking]
---

> Can Docker containers route packets across different subnets?

[Docker](https://www.docker.com/) enables developers to create *containers* to host microservice applications in the most easiest way possible. Docker provides networking support, with the help of which two or more containers can communicate with each other.

Alright, so if the docker containers are in the same subnet, then the single broadcast domain will ensure communication between containers by *switching* packets. But, what if the containers are in different subnets (in different broadcast domains)? Does docker have the capability of *routing* packets too?

## The Magic

Consider two hosts in two different subnets: *10.10.10.0/24* and *192.168.10.0/24*.

To ensure that the shells on the right top corner and bottom left corner are docker shells, observe that process number 1 is **not** *'init'*.

![](/blog/assets/res/networking_with_dockers/image_2.png)

## How it Works

### Setting up the environment

Create two docker networks:

```bash
# tty0: docker engine node
docker network create left --subnet 10.10.10.0/24
docker network create right --subnet 192.168.10.0/24
```

Create a container in the *left* subnet:

```bash
# tty1: left host
docker run -it --network left --name left_host --cap-add NET_ADMIN busybox
```

Create a container in the *right* subnet:

```bash
# tty2: right host
docker run -it --network right --name right_host --cap-add NET_ADMIN busybox
# What's cap-add option? Patience! The answer will be revealed when its time!
```

Let's check if *right_host* is reachable from *left_host*:

```bash
# tty2: right host
/ # ifconfig
eth0    Link encap:Ethernet  HWaddr 02:42:AC:11:00:02
        inet addr:192.168.10.2  Bcast:192.168.10.255  Mask:255.255.255.0
        UP BROADCAST RUNNING MULTICAST  MTU:1500  Metric:1
        RX packets:14 errors:0 dropped:0 overruns:0 frame:0
        TX packets:5 errors:0 dropped:0 overruns:0 carrier:0
        collisions:0 txqueuelen:0
        RX bytes:1088 (1.0 KiB)  TX bytes:434 (434.0 B)
lo      Link encap:Local Loopback
        inet addr:127.0.0.1  Mask:255.0.0.0
        UP LOOPBACK RUNNING  MTU:65536  Metric:1
```

```bash
# tty1: left host
/ # ping 192.168.10.2 -c 3 -I 10.10.10.2
PING 192.168.10.2 (192.168.10.2) from 10.10.10.2: 56 data bytes
--- 192.168.10.2 ping statistics ---
3 packets transmitted, 0 packets received, 100% packet loss
```

Oh no! Docker doesn't have *routing* capabilities by default.

### Adding a router container

To enable communication across broadcast domains, a **router** is required. Instead of a software-defined router, we can use another Docker container with **two** network adapters — one in *left*, one in *right*.

```bash
# tty4: router
docker run -it --network left --name router --cap-add NET_ADMIN busybox
```

```bash
# tty0: docker engine node
# Connect the router container to the right network too
docker network connect right router
```

Now add routing rules on each host to send cross-subnet traffic through the router:

```bash
# tty1: left host
/ # ip route add 192.168.10.0/24 via 10.10.10.3 dev eth0
```

```bash
# tty2: right host
/ # ip route add 10.10.10.0/24 via 192.168.10.3 dev eth0
```

> **Note:** The `ip route` commands require `NET_ADMIN` capability — that's what `--cap-add NET_ADMIN` was for!

The following image shows the state of the containers after configuration:

![](/blog/assets/res/networking_with_dockers/image_3.png)

That's it! Now try reaching *right_host* from *left_host* and vice-versa.

![](/blog/assets/res/networking_with_dockers/1*Xs7cJ8V66ZR0OtbF-U8S1g.png)

## Food for Thought

- Create three different subnets with two routers between the hosts and enable the hosts to communicate with each other:

```
<host1> — network1 — <router1> — network2 — <router2> — network3 — <host2>
```

- [Docker supports DNS resolution](https://docs.docker.com/network/network-tutorial-standalone/#use-user-defined-bridge-networks) of container names to their IP address within a network. Can you create a custom DNS that resolves inter-subnet queries?

I hope you enjoyed this. More of this to come, stay tuned!
