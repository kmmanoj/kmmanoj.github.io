---
layout: post
title: "FMEA of a microservice that uses third-party APIs"
date: 2021-01-23 12:00:00 +0530
tags: [architecture, microservices, reliability]
---

> How do I simulate failure of an API endpoint that I don’t have control over while performing Failure Mode and Effect Analysis?

Microservice architecture is an architectural style wherein an application is broken down into independent components that are capable of providing a specific service. When a chain of these components is invoked, a business logic of the application is serviced.

Be it any architecture style, the quality of the software is crucial in providing flawless and trust-worthy service. Intensive testing is key to releasing a quality software. Software engineers perform multiple levels of testing to ensure that the microservice, business logic and eventually the whole application does not misbehave in any case. One such testing process is called the [**FMEA**](https://en.wikipedia.org/wiki/Failure_mode_and_effects_analysis).

**FMEA** stands for Failure Mode and Effect Analysis. It is a process involved in quality testing where one or more components of an application is intentionally brought down (or) the connection failure is simulated to study the behavior of the microservice that depends on the called microservice that failed. This process is critical in ensuring that there is no cascading of failures among the microservices involved in a business logic. Failing to perform FMEA could drift an application to an unstable state or worse display server error containing potentially sensitive information to the end user.

Well, it is relatively easy to bring down a self-owned microservice in the test stage to study the behavior of the dependent microservice in the test stage. What about FMEA of a microservice that depends on a third-party API? One does not have control over the operational status of the third-party API. So, that scopes down to simulating failure of third-party APIs.

**Following up, how do I simulate failure of an API endpoint that I don’t have control over?**

## Methodology

Recall or observe a typical implementation of a microservice. There are parts of the code that performs a HTTP(S) request (or could be any other protocol) to an API endpoint. The API endpoint is represented as a constant in the form of a domain name in the implementation. Do you find something interesting in the previous statement?

*The API endpoint is represented in the form of a ***domain name*** and ***not*** in the form of an ***IP address***.*

Leveraging this pattern seen among the implementations, what if one could point the API endpoint domain name to an IP address that is not running the service? Doesn’t it simulate a API call failure?

For example, consider a third-party API endpoint `api.example.com` that resolves to `1.2.3.4` and provides weather information of a queried location on port 443. A microservice being analysed should be made to believe that `api.example.com` resolves to `127.0.0.1` , where no service is running at port 443. Consequently, when the microservice is run, it attempts to make an API call to `api.example.com` and eventually fails since `127.0.0.1` is not running the weather information service at port 443.

### How do we do that?

DNS cache poisoning!

Let’s analyse how a DNS resolution of a domain name happens in a host. A host crafts a DNS request for the domain name and passes it to the network driver. At this point, the host tries to resolve the query by finding the domain name in its local DNS cache. If not found, then it recursively queries the gateway which checks its local DNS cache (capable of resolving DNS), then to ISP gateway and so on to the actual DNS servers. Observe, we **do** have control over the host, so let’s attempt to tamper the DNS cache of the host to point the third-party API domain name to an IP address that does not run the specified service, for example, `api.example.com` to `127.0.0.1` .

There is a special text file `/etc/hosts `in *nix based systems and `C:\Windows\System32\Drivers\etc\hosts` in windows systems, which is an extension of the local DNS cache. This is the first place that a host looks up to resolve a DNS query. Bullseye!

**Thus, by adding a new row in the `/etc/hosts` file with the third-party API endpoint pointing to an IP address that is not running the specified service, one could simulate third-party API failure.**

## Don’t talk, show me the code

Consider a microservice that checks if an input string is a pokemon and/or a python module. For example,

```
GET /tensorflow
```

```json
{
    "is_python_module": true,
    "is_pokemon": false
}
```

### Development

The following code shows the implementation of the microservice. Observe the two third-party APIs being used, namely:

- **pypi.org**: To identify if the input string is a python module
- **pokeapi.co**: To identify if the input string is a pokemon

It queries the two API endpoint for details pertaining to the input string. Using the obtained information, the microservice updates the response accordingly and returns the result.

{% gist kmmanoj/972a0b27ea5bb3e7b1ff047ea6b0e5d9 %}

### Testing

The following code shows the FMEA test automation for three scenarios (for *nix based systems):

- `pokeapi.co` is **down**, while `pypi.org` is **healthy**
- `pokeapi.co` is **healthy**, while `pypi.org` is **down**
- `pokeapi.co` is **down**, and `pypi.org` is **down**

> **NOTE**: the test case when both APIs are healthy is skipped intentionally.

{% gist kmmanoj/c5a123ced4127bbc6b9c5244a8d449f0 %}

Running the tests as a user (such as root) who is allowed to edit `/etc/hosts` file.

![Test output](/blog/assets/res/fmea_of_a_microservice_that_uses_thirdparty_apis/test_output.png)
*Test output*

Yay! All three tests passed. The quality of the software is maintained!
