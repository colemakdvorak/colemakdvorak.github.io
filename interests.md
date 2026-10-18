---
layout: page
title: Interests
lang: en
translation_key: interests
permalink: /interests/
eyebrow: Odds & ends
description: "Things I’m into, in no particular order."
---

{% capture technical_interests %}
<!-- Add loose notes, links, code snippets, or new headings as you go. -->

I like Lisp.

{% include tech-stack.html %}

I'm curious about the design and features of programming languages. I absolutely **HATE** Java.

### Academic interests

Wish I was good at math.

In CS, I lean heavily towards Machine Learning, but I think distributed systems, compilers, programming languages, cybersecurity and hardware deserve more recognition.
{% endcapture %}

{% capture tcg_interests %}

I am first and foremost a duelist. I've kept up with Yu-Gi-Oh, offline and online, and most media-mix content since Series 3. Except maybe Duel Links and Zexal-related stuff. You could guess some of my favorite characters from my favorite VAs.

I like local gaming store culture. The idea of full-grown adults grinding day and night, investing their hard-earned money, and fully committing to winning a children's card game is what keeps me up at night.

I used to travel across cities for regionals and hall tournaments. The last time was in 2024, so I'm effectively semi-retired and washed up.

#### TCGs I play(ed)

- **Competitive:** Yu-Gi-Oh, Yu-Gi-Oh Rush Duel, Digimon TCG.
- **Casual:** One Piece, Cardfight Vanguard, Weiss Schwarz.

I play what the meta demands, but I'm fond of control-oriented decks over combo and aggro.

I've won a few locals and regionals.

{% endcapture %}

{% capture anime_manga_interests %}
<!-- Add anime and manga notes, favorites, or lists here. -->

I mostly like what/who I grew up with. Genre-wise, I prefer Shonen. Shonen Jump will always have a special place in my heart, but we are probably in the Jump+ era.

> Do you remember the number of breads you've eaten in your life?

[My anime list on MyAnimeList](https://myanimelist.net/animelist/colemak?status=7&order=4&order2=0)

The list is incomplete. I've forgotten details from many of these shows, and my thoughts have changed. Now I'm a filthy casual watching maybe a show or two per quarter.

Sub or dub? Sub all the way. But I've degenerated to the point of not needing a sub.

I mostly stuck to manga, with about 10k+ volumes in a Ridibooks library I share with a friend. It's been too long since I kept up with web and light novels.

I have a weird craving for academy webtoons, and I'm enjoying stuff from GreenKirin Studio.

I prefer underdog protagonists who swindle their way to victory with wit and grit: Joseph Joestar (JoJo 2nd season), Yoichi Hiruma (Eyeshield 21), and Inaho Kaizuka (Aldnoah Zero).

As for waifu... Honestly, the old-school tsundere types or standard author-favorite heroines. Or the quirky or yandere types. Take a guess or ask in person.

My "modern (00s–10s)" era GOAT author is Hiromu Arakawa. Nanao Nanaki and Kotoyama have recently occupied my niche spot.

#### Favorite VAs

- **Male:** Kenjiro Tsuda, Yuuki Ono, Tomokazu Sugita.
- **Female:** Yuu Kobayashi, Saori Hayami, Asami Imai.

{% endcapture %}

{% capture video_games_interests %}

I prefer sweaty esports tryhards.

- **LoL:** Peaked at 2100–2200 in S2.
- **Apex Legends:** Hardstuck in Diamond solo; reached Master with help from friends.

Not great with mechanically intensive genres like fighting or rhythm games.

My attention span is too short for visual novels, but I've played a few and participated in fan translation.

PC masterrace with a sprinkle of Nintendo. I last played Pokémon seriously during gens 1–6. My favorite Pokémon is Rotom. Favorite trainers: N, Cynthia, and Steven. Also played JRPGs on and off, but the only one that lasted is the Persona series. I kinda miss Fire Emblem. But it's just not the same in the modern era.

I don't play too many gacha games. But I did religiously play Granblue Fantasy in the past (placed T100 in GW 6 times, was among the first wave of western players to beat Luci HL, etc.).

Nowadays I casually play NTE, and that's about it.

{% endcapture %}

{% capture hobby_interests %}
<div class="interest-cards interest-cards--nested">
  {% include interest-card.html id="tcg-interests" title="TCG" content=tcg_interests nested=true %}
  {% include interest-card.html id="anime-manga-interests" title="Anime / Manga" content=anime_manga_interests nested=true %}
  {% include interest-card.html id="video-games-interests" title="Video Games" content=video_games_interests nested=true %}
</div>
{% endcapture %}

<div class="interest-cards">
  {% include interest-card.html id="technical-interests" title="Technical interests" content=technical_interests %}
  {% include interest-card.html id="hobby-interests" title="Hobbies & other things" content=hobby_interests %}
</div>
