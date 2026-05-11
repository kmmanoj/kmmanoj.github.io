---
layout: post
title: "Deploying a scalable Flask app using Gunicorn and Nginx, in Docker"
date: 2018-11-21 12:00:00 +0530
tags: [flask, docker, devops, python]
---

> Flask + Gunicorn + Nginx + Docker Swarm, step by step.

Docker has certainly made things simple. I still remember my first days in college. I had to dual boot my machine just to learn Linux. It was time-consuming, and rather a risky task. With the advent of cloud technologies, I could sign up with a vendor, and get a Linux based instance and practice there. And, now with docker, I don't even need a constant internet connection or a dual-boot system to practice Linux. Download the docker image (hardly a Gigabyte), spawn a container and start using it. As easy as plug and play.
New technology such as Elastic search, or complicated setup such as for OpenStack. Try your hands on it, by downloading docker images from the hub and use it.

In this post, we will go through "dockerizing" a simple Flask application interfaced by Gunicorn, then configure Nginx as a reverse proxy and load balancer across multiple replicas.

![Objective architecture](/blog/assets/res/deploying_a_scalable_flask_app_using_gunicorn_and_nginx_in_docker_part_1/objective_architecture.png)
*Objective architecture*

To keep the story short, I assume that docker is already installed in the system. If you do not have docker, follow this link to setup dockers in your machine: [https://docs.docker.com/install](https://docs.docker.com/install/)

## Dockerizing the Flask app

### **STEP #1: Create Flask app.py**

Start by creating a directory, say *flask_app*/. And, the main application program, say *app.py*, under the *flask_app*/ directory.

```python
from flask import Flask, render_template

application = Flask(__name__)

@application.route("/")
def index():
    return render_template("index.html")

if __name__ == "__main__":
    application.run(host="0.0.0.0", port=80)
```

### STEP #2: Create the required template

The above code assumes that there is a template named *index.html*. Let's prove the assumption by fulfilling it. Create a directory called *templates*/, under the *flask_app*/ directory. Create a file *index.html* under the *templates*/ directory.

```html
<!DOCTYPE html>
<html>
    <head>
        <link rel="stylesheet" href="{{ url_for('static', filename='css/styles.css') }}" />
    </head>
    <body>
        <script src="{{ url_for('static', filename='js/index.js') }}"></script>
    </body>
</html>
```

### STEP #3: Create the static files

Finally, create the static JS and CSS files. Create a directory called *static*/ under the *flask_app*/ directory, and *js*/ and *css*/ directory under it. Create the js file under the *js*/ directory, and name it *index.js*.

```javascript
document.writeln("<h1>Hello world</h1>");
```

Create the css file under the *css*/ directory and name it *styles.css*.

```css
h1 {
    color: red;
}
```

### STEP #4: Test drive

This is an optional step. If you do not have python already installed, you may not take the fuss to install it in your machine.

Navigate into the *flask_app*/ directory.
Run the flask application:

```bash
sudo python app.py
```

Open your browser and type in *localhost:80*:

![Expected output](/blog/assets/res/deploying_a_scalable_flask_app_using_gunicorn_and_nginx_in_docker_part_1/expected_output.png)
*Expected output*

Run the flask application with Gunicorn.
To install Gunicorn:

```bash
pip install gunicorn
```

> **NOTE**: Gunicorn will look for a WSGI callable named `application` if not specified. Hence, the app.py contains the variable named `application` on purpose.

Run the flask application interfaced by Gunicorn:

```bash
sudo gunicorn -b 0.0.0.0:80 app
```

The same output is expected as above.

### STEP #5: The dockerfile

Now, that we are ready with the flask app. It is time to "dockerize" it. To "dockerize" your application we need to create a docker image of the application first.

Create a file called *dockerfile* in the *flask_app*/ directory.

```dockerfile
FROM python:3.6
ADD . /app
WORKDIR /app
RUN pip install flask gunicorn
EXPOSE 8000
CMD ["gunicorn", "-b", "0.0.0.0:8000", "app"]
```

To summarize the content of the *dockerfile*; beginning from python:3.6 docker image, add the contents in the current directory to /*app* in the container. Change the working directory to /*app*, install the required python modules, expose port 8000 in the container. And the primary process of the container is to run: `gunicorn -b 0.0.0.0:8000 app`
All the commands run exactly once, i.e during docker image creation. Except for the CMD command. It runs when the container is spawned.

### STEP #6: Build the docker image and spawn a container

To build the docker image, navigate to the *flask_app*/ directory and run:

```bash
docker build --tag flask_gunicorn_app . 
```

Once the command runs successfully, you are ready with a portable flask app docker image. You can upload this image to the docker hub, and download and deploy it anywhere.

To spawn a container of the built image. Run:

```bash
docker run --detach -p 80:8000 flask_gunicorn_app
```

`--detach` : runs the container in the background

`-p` : maps port 80 in the host to port 8000 in the container

Open your browser and type in *localhost:80* — and you have your flask application rendering the HTML page, and serving the static files.

## Scaling with Nginx and Docker Swarm

Now that the flask app is running in a docker container, we will configure Nginx as a reverse proxy and set it up to handle multiple replicas for scalability.

![Objective architecture](/blog/assets/res/deploying_a_scalable_flask_app_using_gunicorn_and_nginx_in_docker_part_2/objective_architecture.png)
*Objective architecture*

**Observations:**

- Let the static files be placed in a volume, that is accessible by both Nginx and flask app. Flask app, to write; Nginx, to read.
- We are going to create 3 replicas of the flask_gunicorn_app, and make the load balancer handle the requests distribution.
- All the components are part of the same virtual network. (For a particular reason, we will explore it eventually #same-vnet)

Let us begin by configuring the Nginx server. There are two options to configure the Nginx server:

- Create a new image, with the new configuration.
- Use the existing base image, and mount the configuration folder in the host to conf.d/ in the nginx container.

I will go ahead with the latter option.

Create a directory, say *nginx_conf*/, and create a file called *app.conf* under it.

{% gist kmmanoj/1a4d6cca71828f75ea6dc4716a5c26f1 %}

What is [http://webapp:8000/](http://webapp:8000/)? It is the name of the service which runs the flask app in replicas behind the load balancer. We will soon see that docker handles creating a load balancer for us, for the replicas we create. Therefore, when creating a load balancer is not in our control, we eventually do not have control over the IP address that gets assigned to the load balancer. Hence, we can refer to the load balancer by the name of the service, if the service and the nginx server are in the same virtual subnet #same-vnet.

To start a Docker service, the machine should be a part of the swarm. Swarm is a cluster of machines that work together. To know more about docker swarm follow this link: [https://docs.docker.com/get-started/part4/](https://docs.docker.com/get-started/part4/)

To make the machine a part of the swarm, as the first node (manager node), run:

```bash
docker swarm init
```

The acknowledgement output gives more details about how to add more nodes to the swarm.

### **Step #1: Create a virtual network**

Let's now create a virtual network where all the service components will be placed. To create a docker network, run:

```bash
docker network create web_network \
  --driver overlay \
  --subnet=192.168.100.0/24
```

An overlay network is created having subnet 192.168.100.0/24.

### **Step #2: Create a docker volume**

Next, we create a docker volume that holds the static files. To create a docker volume, run:

```bash
docker volume create web_static
```

### Step #3: Create the web application service

In this step, we will have to create 3 replicas of the flask_gunicorn_app, and put it behind the load balancer.

```bash
docker service create \
  --name webapp \
  --replicas 3 \
  --mount src=web_static,dst=/app/static \
  --network web_network \
  kmmanoj/flask_gunicorn_app
```

How easy it is to create three replicas, behind a load balancer.

### Step #4: Create the web proxy service

Finally, we are going to setup the webproxy server.

```bash
docker service create \
  --name webproxy \
  --network web_network \
  --mount src=web_static,dst=/var/www-data \
  --mount type=bind,src=/path/to/nginx_conf,dst=/etc/nginx/conf.d \
  -p 8080:80 \
  nginx
```

That's it! We are ready with the objective architecture.

Verify by running:

```bash
docker network inspect web_network
```

to see the list of containers running. You may find a container that has a substring 'endpoint', that happens to be the load balancer created by the docker.

### Step #5: Test

Open up your browser and point to [http://localhost:8080/](http://localhost:8080/)

![Browser output at localhost:8080](/blog/assets/res/deploying_a_scalable_flask_app_using_gunicorn_and_nginx_in_docker_part_2/browser_output.png)
*Browser output at localhost:8080*

Thank you! Hope this was helpful!
