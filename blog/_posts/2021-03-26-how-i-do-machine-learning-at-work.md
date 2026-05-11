---
layout: post
title: "How I do Machine Learning at work"
date: 2021-03-26 12:00:00 +0530
tags: [machine-learning, data-science]
---

> A method used among group of data scientists to identify and refine feature set for a machine learning problem

I still recall the moment when I was part of the first machine learning project that our team was working on. The requirement was to identify that part of the text that potentially contained date and time information. We were a set of amateur’s in data science aiming to build this date time pattern recognizer. Suddenly from nowhere, I wonder what struck us, we found a fun filled methodology to build and evaluate a model. Technically, we devised a methodology to evaluate if the set of features extracted out of the raw data is sufficient enough for a machine learning algorithm to output satisfactory results. In this blog, I shall explain, with an example, the methodology to evaluate if the feature set is sufficient to build a good machine learning model.

## The Example: Problem statement

Consider the problem of identifying parts of a text that contains date and time information. The following shows some example texts, with emboldened phrases that resembles what the supervised machine learning model is expected to output.

- I won’t be available at **4 pm on 21st of March**.
- I will be taking off from **20th March to 25th March 2021**.
- Exactly at **18:30 IST**, the show starts!

> **NOTE:** You may observe that the example texts do not cover all the cases. The takeaway from this blog is the methodology and not a solution to the date time parsing problem.

## Initial Conversation: The obvious visible features

The team decides to go word by word and extract features out of each word (token). Each member pitches a lot of features by observing the example texts. Here are some that were concluded to start with:

1. Number of digits in the token.
2. Number of alphabets in the token.
3. Length of the token.
4. Number of /(slash) or -(hyphen) or :(colon) or .(dot).
5. Is it *am* or *pm*?
6. Does it end with *st*, *nd*, *rd* or *th*?

Alright! We have enough features to get started.

## Methodology: Refining the feature set

For simplicity, let us consider that the team size is 2 and the members are Alice and Bob. The vocal conversation they make are written in standard format, while their thoughts are formatted in italics.

Here is the game!

- Alice thinks of a token and evaluates the decided features for the token in her mind.
- Alice then presents the feature values to Bob, without revealing the token.
- Bob speaks his thought process aloud and uses these features to call out either a yes or a no. Yes signifies that the token is part of a potential date and time and a no signifies that the token is not part of a potential date and time.
- Alice then reveals the token and scores Bob if he is right or wrong.
- Finally, the feature set is refined i.e more features are added, one or more features are removed, or one or more existing features are modified, and they reverse their roles and repeat the steps from the beginning.

Observe that the intention of this game is to make the opponent find it difficult to make the right classification.

### Hear this conversation …

**Alice**: Let me begin! 

**Alice**: *Given these features, let me think of a month. March! So the features of March are (0, 5, 5, 0, no, no).*

**Alice**: So, the features are (0, 5, 5, 0, no, no). Is this a part of date time or not?

**Bob**: There are no digits, so it shouldn’t be value of date or time. A 5-letter word with all of them being alphabets. I can think of many! Words like: value, Alice, games, and months like March, April. I am confused, may be it is NOT a part of date time? Am I right?

**Alice**: No! I was thinking of the word “March”. You got it wrong. Let’s refine our feature set. As you were verbalizing your thoughts, I stretched my thoughts a little and came up with this feature. What about a feature that depicts if the token contains the word “Jan”, “Feb”, “Mar”, “Apr” … “Dec” in any case, that is, upper or lower?

**Bob**: Yes, that’s great! So feature number 7, Does the token have the word “Jan”, “Feb”, “Mar” … “Dec”.

**Bob**: It’s my turn now!

**Bob**: *Hmm! Where else will I find numbers? Street numbers! Bullseye, I will get “st”, “nd”, “rd” and “th” in it too. Let me think of “3rd” in “3rd block”. The features set for this is (1, 2, 3, 0, no, yes, no).*

**Bob**: Here are the features of the token I thought of, (1, 2, 3, 0, no, yes, no).

**Alice**: One digit, two alphabets and it is one of the “st”, “nd”, and “rd”. That’s enough information! I got it! It should be something like “1st”, “2nd”, “4th” etc. So, YES, it IS a part of date and time! 

**Bob**: Your thought process was right! But, I exploited it 😉! You identified it wrong! I thought of the word “3rd” as in street names. I think we need to look ahead and may be look behind also. Such as a 3-gram? and/or we could use recurrent neural networks.

**Alice**: What is a 3-gram? What is recurrent neural networks?

**Bob**: *… explains what is a 3-gram in the context of Natural Language Processing and Recurrent Neural Networks …*

**Alice**: Amazing! Now, I will ask you, Bob!

**Alice**: *Hmm! It’s getting difficult for me to think of corner cases now! Let me think of something close! “The 42nd Janitor?” I think he will be able to identify it right. Length of “January” is different from “Janitor”. What about in times. Hmm … “The student scored 99.00 3 times this semester in mathematics.” So, the features for “scored 99.00 3” is ((0, 6, 6, 0, no, no, no), (4, 0, 5, 1, no, no, no), (1, 0, 1, 0, no, no, no)).*

**Alice**: The features for the 3-gram token is ((0, 6, 6, 0, no, no, no), (4, 0, 5, 1, no, no, no), (1, 0, 1, 0, no, no, no)).

**Bob**: Interesting! The token contains 4 digits and a dot, or colon, or hyphen, or slash. It must be a half date like 03/21 or time 20:00. It is like a start of a date or time, if at all it is, so I can safely ignore look behind. Looking ahead, I would expect “am” or “pm” in case of a 12 hour clock. But, look ahead seems to be a single number. May be it is something like 16:00 3 March? Is there ways in which it cannot be a date time? Hmm. Percentage? Aha! But, the length of the token should be 6, not 5, if the token contains “%”, as in “11.11%”, or if it is a case of “11.11<space>%” the next token should not be a digit. So, I conclude, it IS part of date and time!

**Alice**: Incredible thinking! You were close, but still you identified it wrong. I was thinking of the phrase “scored 99.00 3” in the text “He scored 99.00 3 times.” Let’s think of a feature that differentiates these kind of inputs. I believe we also need features to check if the token numbers are in range 0–60, 0–24, and 1–31, to help classify better. But, your thought process made me think that percentage values can also be like time, such as 12.00. Here, is my thought. Let us separate :(colon) count from the other symbols’ counts. The reason being, I observe that dates can have .(dot), /(slash) or -(hyphen) as separators, while time can mostly have :(colon) as separator. We would compromise on outlying times that have symbols other than :(colon) as separator, worse being an input similar to what I thought, “the show is scheduled for 16.00 3 March 2021.” But, this outlier can be ignored for now. It’s not well formed, isn’t it? Probably, as we go along with this conversation we should find ways to tackle these situations too. So to conclude, we modify the feature number 4 to “Number of /(slash) or -(hyphen) or .(dot).” And, we shall add a new feature that depicts “Number of :(colon).” Also, to help classify better, three more features: “Is there a number in token that is in the range 0–60?”, “Is there a number in token that is in the range 0–24?”, “Is there a number in token that is in the range 1–31?”

**Alice**: So we are left with these feature, so far -

1. Number of digits in the token.
2. Number of alphabets in the token.
3. Length of the token.
4. Number of /(slash) or -(hyphen) or .(dot).
5. Number of :(colon).
6. Is it *am* or *pm*?
7. Does it end with *st*, *nd*, *rd* or *th*?
8. Does it contain “Jan”, “Feb”, “Mar”, … “Dec”?
9. Is there a number in range 0–60?
10. Is there a number in range 0–24?
11. Is there a number in range 1–31?

And, the conversation continues. Alice and Bob are finally happy with the list of features they got. They train a model using the developed features and obtain an amazing model that captures most of the dates and times in text.

## Conclusion

This is one of the ways one could build on features for a machine learning problems.

It enables group of people to work together on a single machine learning problem. And, the way the features are extracted have a strong basis on human thought, hence debugging the machine learning model after training it should be easy. On the other hand, as with every other methodology, there are shortcomings in this too. Human brain can consider only a handful of features while working towards evaluating the classification, so it is not very scalable.

Doesn’t this methodology sound familiar? You should have probably got it by now! This is how a Generative Adversarial Network deep learning model is trained! The questioner being the generator and responder being the discriminator. Alice and Bob were proud of themselves. They believe that they would have introduced the world to GAN, if GAN was not already devised.

I hope you learned the methodology I use at work to build machine learning models. I hope you use it too, to work together and build better machine learning models.
