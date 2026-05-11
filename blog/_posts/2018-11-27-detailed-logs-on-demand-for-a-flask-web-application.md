---
layout: post
title: "\"Detailed logs on demand\" for a flask web application"
date: 2018-11-27 12:00:00 +0530
tags: [flask, logging, python]
---

> Toggle debug logging on demand using Unix signals.

## The Problem

Logging is a great challenge while developing a web application. Too fewer logs are as good as nothing, it does not provide enough information to troubleshoot a bug. Too many log statements burden the server with huge log files, and the troubleshooting personnel may have to search through the logs to find when exactly the bug played its part, and process them to figure out the trouble point.

I would constantly be bombarded with this issue. My flask application logs in to a SaaS application and makes REST APIs calls to it, to process the data and interpret the results. Keeping in mind the performance of the web application, the session token and the authorization tokens are generated on demand, i.e. the flask application doesn't log in to SaaS Application for every request that it gets, to access APIs from the SaaS application; instead, it reuses the session cookie until it expires. The change in SaaS application API's response is unknown until an Internal Server Error pops up on one of the client machines — it can be a genuine bug, a failure in session cookie refresh, or something else entirely.

What if deep debug log statements are revealed on demand, without having to restart the web application?
(If restarted, the environment — state of the variables etc. — will be refreshed, and the bug may occur only when that particular state re-occurs.)

## The Solution: Unix Signals

Using **signals** we can do this elegantly.

A **Signal** is a notification sent by the Operating System or a process to another process, indicating a notice. By overriding the signal handler for `USR1`, we can toggle a `DEBUG` flag at runtime — no restart required.

## The Implementation

We develop a simple Flask application wrapped with a Gunicorn WSGI. The Flask app has one endpoint that returns the current time after a deliberate delay, simulating a long request.

{% gist kmmanoj/69888f86881ac6c9c88cc054fdac174e %}

### Key observations

- `debug` is a function that prints only if the global constant `DEBUG` is `True`.
- `app` is a Flask object with one endpoint that takes at least 10 seconds to respond.
- `handler` toggles the value of `DEBUG` and logs the change.
- The signal handler for `USR1` is overridden to call `handler`.
- The program works both as a standalone Python process and as a Gunicorn-imported module.

## Running as a Python Process

```text
kmmanoj $ python app.py
 * Serving Flask app "app" (lazy loading)
 * Environment: production
WARNING: Do not use the development server in a production environment.
Use a production WSGI server instead.
 * Debug mode: off
 * Running on http://0.0.0.0:8000/ (Press CTRL+C to quit)
DEBUG is set to True
DEBUG is set to False
DEBUG is set to True
DEBUG: end of the loop 2
DEBUG: in for loop 3
DEBUG: end of the loop 3
DEBUG: in for loop 4
DEBUG: end of the loop 4
DEBUG: in for loop 5
DEBUG: end of the loop 5
DEBUG: in for loop 6
DEBUG is set to False
DEBUG is set to True
DEBUG: end of the loop 8
DEBUG: in for loop 9
DEBUG: end of the loop 9
DEBUG: end of the function
127.0.0.1 - - [27/Nov/2018 23:37:24] "GET / HTTP/1.1" 200 -
```

The signal `USR1` is sent to the process as:

```bash
kill -s USR1 <pid>
```

## Running with Gunicorn

```text
kmmanoj $ gunicorn -b 0.0.0.0:8000 app:app
[2018-11-27 23:41:18 +0530] [28892] [INFO] Starting gunicorn 19.8.1
[2018-11-27 23:41:18 +0530] [28892] [INFO] Listening at: http://0.0.0.0:8000 (28892)
[2018-11-27 23:41:18 +0530] [28892] [INFO] Using worker: sync
[2018-11-27 23:41:18 +0530] [28895] [INFO] Booting worker with pid: 28895
[2018-11-27 23:41:33 +0530] [28892] [INFO] Handling signal: usr1
DEBUG is set to True
DEBUG: end of the loop 2
DEBUG: in for loop 3
DEBUG: end of the loop 3
DEBUG: in for loop 4
DEBUG: end of the loop 4
DEBUG: in for loop 5
[2018-11-27 23:41:37 +0530] [28892] [INFO] Handling signal: usr1
DEBUG is set to False
[2018-11-27 23:41:41 +0530] [28892] [INFO] Handling signal: usr1
DEBUG is set to True
DEBUG: end of the loop 9
DEBUG: end of the function
```

Send the signal to the master Gunicorn worker:

```bash
kill -s USR1 28892
```

Toggle it at different times to see the debug output switch on and off dynamically.

## A Note on USR1 in Gunicorn

Gunicorn uses `USR1` internally to reopen log files. If that behaviour is critical to your deployment, choose a different signal to override — `USR2` or `WINCH` for example. See the [Gunicorn signal docs](http://docs.gunicorn.org/en/stable/signals.html) for the full list.
