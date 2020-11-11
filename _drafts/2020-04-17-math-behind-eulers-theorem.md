---
layout: post
title: "Math behind Euclid's Theorem"
date: 2020-04-17
description: Wondered why Euclid's GCD theorem works?
author: kmmanoj
---
We were taught in our programming classes that, to calculate gcd of two integers **efficiently** use the Euclid's algorithm. 

---
{: data-content="Introduction"}

The Euclid algorithm is _programmed_ as follows:

```python
def gcd(a: int, b: int) -> int:
    # hatch case
    if a == 0:
        return b
    else:
        return gcd(b % a, a)

assert gcd(15, 6) == 3
```

Take a step back and think for a minute. _Why does it work?_

I will explain this with the magic as the starting point to end up stating the Euclid's theorem. Reverse Engineering!

---
{: data-content="Rewriting the code"}

```python
def gcd(a: int, b: int) -> int:
    while a != 0:
        # to keep it descriptive
        tmp = b % a
        b = a
        a = tmp
    return b

assert gcd(15, 6) == 3
```

Now carefully understand the following,

![Divisibility](/assets/images/3-divisibility.png)

_%_ is not a basic arithmetic operator in mathematics. Consider the following implementation of _%_ function:

```python
'''
b % a
'''
def mod(b: int ,a: int) -> int:
    tmp = b
    while tmp >= a:
        tmp = tmp - a
    return tmp

assert mod(15, 6) == 15 % 6
```

Now, Let's replace the mod function with its implementation in the former code snippet.

```python
def gcd(a: int, b: int) -> int:
    while a != 0:
        # replacement BEGIN
        tmp = b
        while tmp >= a:
            tmp = tmp - a
        # replacement END
        b = a
        a = tmp
    return b

assert gcd(15, 6) == 3
```

---
{: data-content="wrap-up" }

To understand better, let us optimize the code to make analysis easier. Observe that _b_ takes the value of _a_ after _n_ _a_'s are removed from it, and _a_ is given the processed _b_ value. Consider the second iteration. If the values were swapped, the code runs as expected. But, if they were not swapped, then we need to make edition such that _tmp_ takes _a_, the condition becomes _tmp >= b_, and the loop-code is _tmp = tmp - b_. Let's make these changes to the code and merge the loops.

```python
def gcd(a: int, b: int) -> int:
    while a != 0 and b != 0:
        if a >= b:
            a = a - b
        else:
            b = b - a
    # loop breaks when either one is 0
    return a if b == 0 else b

assert gcd(15, 6) == 3
```

Take a moment to understand and verify the code snippet.

Thus, we observe that _gcd(a, b)_ = _gcd(a - b, b)_ = _gcd(a, b - a)_.

Let, _d_ be a factor of both a and b. Hence, _d\|a_ (_d_ divides _a_) and _d\|b_ (_d_ divides _b_).

{% include image.html url="3-gcd-conclusion.png" description="GCD Conclusion" %}

Hence, _d|a_, _d|b_, _d|(a-b)_ and _d|(b-a)_. The least positive _d_ that we finally end up is the **GCD** of _a_ and _b_.
Now traceback through the blog, to understand why **Euclid's GCD theorem** works.
