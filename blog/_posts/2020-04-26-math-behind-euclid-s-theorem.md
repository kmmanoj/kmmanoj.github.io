---
layout: post
title: "Math Behind Euclid’s Theorem"
date: 2020-04-26 12:00:00 +0530
tags: [math, algorithms]
---

> Why does Euclid's GCD algorithm actually work?

We were taught in our programming classes that, to calculate gcd of two integers **efficiently** use the Euclid’s algorithm.

## Magic:

The Euclid algorithm is *programmed* as follows:

```python
def gcd(a: int, b: int) -> int:
    # hatch case
    if a == 0:
        return b
    else:
        return gcd(b % a, a)

assert gcd(15, 6) == 3
```

Take a step back and think for a minute. *Why does it work?*

## **How did you do that?**

I will explain this with the magic as the starting point to end up stating the Euclid’s theorem. Reverse Engineering!

**Rewriting the code**

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

![](/blog/assets/res/math_behind_euclids_theorem/image_2.png)

*‘%’* is not a basic arithmetic operator in mathematics. Consider the following implementation of ‘*%*’ function:

```python
def mod(b: int, a: int) -> int:
    tmp = b
    while tmp >= a:
        tmp = tmp - a
    return tmp

assert mod(15, 6) == 15 % 6
```

Now, Let’s replace the mod function with its implementation in the former code snippet.

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

## **Wrap-up**

To understand better, let us optimize the code to make analysis easier. Observe that *b *takes the value of *a* after *n* *a*’s are removed from it, and *a* is given the processed *b* value. Consider the second iteration. If the values were swapped, the code runs as expected. But, if they were not swapped, then we need to make an edition such that *tmp* takes *a*, the condition becomes *tmp* ≥ *b*, and the loop-code is *tmp = tmp-b*. Let’s make these changes to the code and merge the loops.

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
Thus, we observe that *gcd(a, b) = gcd(a-b, b) = gcd(a, b-a).*

Let, *d* be a factor of both *a* and *b*. Hence, *d|a* (*d* divides *a*) and *d|b* (*d* divides *b*).

In mathematical form, *a = dx*, *b = dy*, where *x*, *y* are Integers (Z).

```text
a - b = dx - dy
=> a - b = d(x - y)

and, b - a = dy - dx
=> b - a = d(y - x)
```

Hence, *d|a*, *d|b*, *d|(a-b)* and *d|(b-a)*. The least positive *d* that we finally end up is the **GCD** of *a* and *b*.

Now traceback through the blog, to understand why **Euclid’s GCD theorem **works.

I hope you enjoyed this. More of this to come, so stay tuned!
