---
layout: post
title: "How complex can Authorization get?"
date: 2022-03-20 12:00:00 +0530
tags: [security, authorization]
---

> Builds on the Authorization component of Identity and Access Management system from zero to how systems implement today

**I**dentity and **A**ccess **M**anagement system deals with “who” should get “what” level of access to an object (entity) or a function. The subsystem that defines “who” is called Authentication (Identity), while the subsystem that defines “what” level of access is called **Authorization** (Access).

Building an IAM system can get very complex quickly. No wonder “Broken Authentication” and “Broken Authorization” are listed in [OWASP Top Ten WebApp Security risks](https://owasp.org/www-project-top-ten/) and [OWASP Top Ten API Security risks](https://owasp.org/www-project-api-security/). Security risks in IAM system arises due to flawed or missed logic, or due to gap in the implementation and design due to it’s complexity.

This article explains the evolution of the Authorization component of an IAM system with the growth of the software. Let us consider a content management system (such as [Medium](https://medium.com)) for example while we build it up. Here,

- Let *V1* be the visitor (unauthenticated) user, and *M1 … M3* be the member (authenticated) users.
- Let *B1 … B5* be the Blog entities
- Let Read (*R*), Write (*W*) and Clap (*C*) be the actions that can be performed on the entities

The notation:

```text
{u, v} can {a, b} on {m, n}
```

Implies, a nested Cartesian product:

```text
{Set of users} can (perform) {Set of actions} on {Set of Entities}
```

```text
u can a on m, u can a on n, u can b on m, u can b on n, v can a on m, v can a on n, v can b on m, v can b on n
```

## Unprotected systems

Let us begin from zero. A system in which anyone has access to anything. There is no authentication nor authorization in place. A system with such characteristics defines the starting point for IAM. IAM does not exist or does nothing in such a system.

The CMS in this state has all the blogs readable, writable and clap-able by any visitor and/or member.

```text
{V1, M1, M2, M3} can {R, W, C} on {B1, B2, B3, B4, B5}
```

## All-or-Nothing

In such systems, there are two access levels for entities: public and private. Certain entities may be tagged public which implies that this entity can be acted upon by any user. While, certain entities can be tagged private which implies that this entity can be acted only upon by a specific user. To identify a specific user authentication is required.

Let, blog *B1* be a private blog to *M1*,* B2* be a private blog to *M2* while the rest be public. Then,

```text
{V1, M1, M2, M3} can {R, W, C} on {B3, B4, B5}, or
{M1} can {R, W, C} on {B1}, or
{M2} can {R, W, C} on {B2}
```

## Controlled Sharing

This is where IAM starts to become complex. To enable collaboration and feedback, restricting access levels for entities to only public and private may not be valuable. To better understand the build up of controlled sharing let us break it down into the multiple sub-phases.

### Controlled Sharing: All-or-Nothing

Customers of CMS complain that private blogs are too restrictive. They want to be able to share the blog(s) only to a certain specific set of users for collaboration.

In such systems, there are three access levels for entities: public, shared and private. Public and private continue to hold the definitions from All-or-Nothing system. A shared entity is an entity that can be acted upon only by a specific set of users.

Let *B1* be a private blog to *M1*, *B2* be a private blog to *M2*, *B3* be a shared blog to *M2* and *M3*, while the rest be public. Then,

```text
{V1, M1, M2, M3} can {R, W, C} on {B4, B5}, or
{M1} can {R, W, C} on {B1}, or
{M2} can {R, W, C} on {B2, B3}, or
{M3} can {R, W, C} on {B3}
```

### Nested Controlled Sharing

Customers now complain of shared blogs being too open to the authorized set of users. They want to be able to restrict the set of actions a specific subset of the authorized users can perform. For example, “while I have full access to the blog, I want my peer(s) to only read it and not be able to edit it.”

In such systems, there again exists three levels of access: public, private and shared, with private and public continuing to hold it’s definition from All-or-Nothing system. The shared access level, which used to deal with only one parameter i.e Entity, now deals with two parameters i.e. Action and Entity. **Side Note**: The (Action, Entity) tuple is called a permission.

Let *B1* be a private blog to *M1*, *B2* be a private blog to *M2*, *B3* be a shared blog to *M2* and *M3*, with *M2* having the ability to perform only *R*, and *C* actions, while *M3* be able to perform *R*, *W* and *C* actions on it. Meanwhile, let the rest of the entities be public. Then,

```text
{V1, M1, M2, M3} can {R, W, C} on {B4, B5}, or
{M1} can {R, W, C} on {B2}, or
{M2} can {R, W, C} on {B2}, or
{M2} can {R, C} on {B3}, or
{M3} can {R, W, C} on {B3}
```

### Dynamic Nested Controlled Sharing

All this while we have been looking at static rules to define authorization. It would be unmanageable and cumbersome to contact the service provider to edit the authorization rules with new entities, new users and new requirements (changing users/entities).

This introduces a new action, Grant (*G*), on actions that can be performed on an entity. For example, Grant Read (*GR*) is defined as the ability to grant read access to the entity in reference to any other user.

Consider the same scenario as mentioned in the Nested Controlled Sharing case. The new set of authorization rules would then be,

```text
{V1, M1, M2, M3} can {R, W, C, GR, GW, GC} on {B4, B5}, or
{M1} can {R, W, C, GR, GW, GC} on {B2}, or
{M2} can {R, W, C, GR, GW, GC} on {B2}, or
{M2} can {R, C} on {B3}, or
{M3} can {R, W, C, GR, GW, GC} on {B3}
```

### Conclusion on Controlled Sharing

At this point, it is worth mentioning about different Access Control schemes.

- **Discretionary Access Control (DAC)**: The owner (creator) of the entity possess grant permissions (Recall, permission is (Action, Entity) tuple).
For example, in the CMS system with `{V1, M1, M2, M3}` users, `{R, W, C}` actions and `{}` blogs, when *M1* creates a blog *B1*, the authorization rules are:

```text
{V1, M1, M2, M3} can {R, W, C, GR, GW, GC} on {}, or
{M1} can {R, W, C, GR, GW, GC} on {B1}
```

- **Mandatory Access Control (MAC)**: A specific administrator has access to grant permissions.
For example, in the CMS system with `{V1, M1, M2, M3}` users, `{R, W, C}` actions and `{}` blogs, and *M1* being the administrator, when *M2* creates a blog *B1*, the authorization rules are:

```text
{V1, M1, M2, M3} can {R, W, C, GR, GW, GC} on {}, or
{M1} can {GR, GW, GC} on {B1}
{M2} can {R, W, C} on {B1}
```

- **Role-Based Access Control (RBAC)**: A complex access control scheme that includes Role as an Entity, in addition to blog. The actions on the Role are: assume (A) (For simplicity) (Other actions on the role includes read, write, update, delete etc.). Similar to any other actions, assume action can also be granted (GA). In this scheme, a user/role cannot act independently on entities. A user can independently only assume a role. A user on assuming a role can act on an entity, including another role.
For example, in the CMS system with `{V1, M1, M2, M3}` users, `{R, W, C}` actions on blogs and `{A}` actions on roles, `{}` blogs and `{R1, R2}` roles.
Let *R1 *be a role that can perform anything to any role, while *R2* be a role that can perform anything on any blog. Let *R1 *be assumable only by *M1*, *R2 *be assumable by any authenticated user, *M2* assumes *R2* and creates a blog *B1*.

```text
{R1} can {GA} on {R1, R2}
{R2} can {R, W, C, GR, GW, GC} on {B1}, or
---
{V1} can {R, W, C, A} on {}, or
{M1, M2, M3} can {R, W, C} on {}, or
{M1, M2, M3} can {A} on {R2}, or
{M1} can {A} on {R1}
```

## User-programmed controlled sharing

So far we have been looking at permissions to those entities that are stored. Consider the case when the CMS wants to display the total number of blogs that exists in their system be it public, shared or private to any visitor/member. Further, it wants to display the total number of public, private and shared blogs individually. Though a visitor (unauthenticated) user is not allowed to access the private and shared blogs, he/she should be able to see the above statistics. Moreover, these statistics may or may not be stored. It may be calculated on demand. Access control to such “actions” on such “entities” are categorized into User-programmed controlled sharing.

**Side note**: Hence there exists two different security risks in OWASP top ten, namely: Broken “object” level authorization and broken “function” level authorization.

**Attribute Based Access Control** **(ABAC)** is an access control scheme that involves user-programmed controlled sharing. Consider the case when access to a specific object is given only during a certain time period, say between 9 am to 5 pm IST. And/Or, access to a specific object is given only when the user is located in a specific area, say in a circle with center at (37.7858846, -122.4074781) coordinates and radius 250 m.

## Conclusion

Designing an access control system highly depends on the customer’s needs. Most mature products have dynamic nested controlled sharing capabilities while there are certain features that uses User-programmed controlled sharing. However, critical systems such as military, government, healthcare and finance technology software do have advanced access control systems implemented and enforced. One such advanced access control is “[Separation of duty](https://csrc.nist.gov/glossary/term/separation_of_duty)”: A single user cannot individually execute a critical action.

The complexity in designing an access control system is present in identifying:

- The access control scheme (DAC, MAC, RBAC, ABAC, hybrid or custom?)
- The entities and the granularity to which it needs to be access controlled
- The actions that can be performed on the entity
- The storage schema for the identified entities, actions, and users
- Sequence flow to perform authorization rule check, and
- Other system design choices

## Reference

J. H. Saltzer and M. D. Schroeder, “[The protection of information in computer systems](https://ieeexplore.ieee.org/document/1451869),” in Proceedings of the IEEE, vol. 63, no. 9, pp. 1278–1308, Sept. 1975, doi: 10.1109/PROC.1975.9939.
