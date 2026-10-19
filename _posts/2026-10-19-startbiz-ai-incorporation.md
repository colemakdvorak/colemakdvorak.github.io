---
layout: post
lang: en
original_lang: en
translation_key: startbiz-ai-incorporation
date: 2026-10-19
title: "I had to hack a South Korean government website with AI to incorporate my AI startup."
description: "I reverse-engineered StartBiz, a web service hosted by the Ministry of SMEs and Startups in South Korea, to incorporate my startup."
---

{{ page.description }}
{: .lead}

## Intro

On a peaceful Monday morning...

> \>Be me.  
> \>Trying to incorporate my startup through StartBiz.  
> \>Prompted to submit a corporate seal through their client.  
> \>Asks for a scanner. But who owns a scanner nowadays?  
> \>"You can now submit the seal via official smartphone applications!"  
> \>Looks it up on the App Store -> Does not exist.  
> \>Looks it up on Google Store -> Unavailable in my market.  
> \>It's OK. I'll go to the printing shop.  
> \>"Sorry, we don't support network-connected scanners. We only support TWAIN-compatible USB-drive-connected scanners."
{: .greentext}

I was absolutely crushed and defeated when I got back home. Nothing made sense to me. Clearly, somebody who had a false sense of security required the system to only accept scanned entities through a single interface. Somebody with empathy towards users offered user-friendly alternatives, EXCEPT THEY DON'T WORK!

The options left on the table were:

1. Call every print shop in the neighborhood and ask if their scanner is wired to a TWAIN-compatible USB drive.
2. Buy a scanner.
3. Disassemble the client to understand what it was doing.

I am not crazy enough to do 1 or 2. The only issue with the third option is that it's been a long time since I reverse-engineered software. I had done it a few times when learning about computer networking or playing around with hardware mods of video game consoles back in the day.

## Solution

Old problem. Modern solutions. I pulled out an OpenCode session and asked Astra to disassemble and examine `ImageDocScan.exe`, a 32-bit .NET Windows Forms application using TWAIN/ActiveX components that StartBiz installed on my system. It used .NET's reflection APIs to inspect the assembly's classes/fields and compiled intermediate language.

Here's what's crazy. The client SUPPORTED JPEG, PNG, BMP, AND TIFF. `loadImageButton_Click`, which used the same seal-extraction routine as the scanner input, was fully available except that the button visibility flag was set to `false`.

It just came down to hijacking the browser's scan-session parameters and the application's working path, and calling:

```powershell
$field = $formType.GetField("loadImageButton", $flags)
$button = $field.GetValue($form)
$button.Visible = $true
```

This made the hidden button appear, so I took a photo of my corporate seal and fed a jpg file through the hacked client and... Yeah. It worked.

## Conclusion

I signed all of the paperwork and submitted the incorporation form. And it got approved the day after.

Everything just felt insane. I remember the days of trying to reverse-engineer a simple video game or an instant messaging service. Looking through the submission form to figure out what kind of API calls were being made. What kind of assets were available. Sniffing headers and trying to figure out the structure of the payload. Where the requests were being sent, etc. These things used to take an entire weekend for me. And I probably can't do it right now because things aren't fresh. But now, giving minimal guidance to an AI model can get the job done. To be honest, it was kind of fun too. Using my knowledge to quickly test hypotheses and grind through simple mechanical tasks with an AI model to better understand the process felt fun.

So if you're looking for a new way to fiddle around with AI, I suggest testing it to reverse-engineer a system or a problem you care about. It feels like the equivalent of its effectiveness in finding mathematical counterexamples. I wouldn't be surprised if AI agents are actually a better fit for finding vulnerabilities and exploiting flaws in a system than building a system.

Thanks for reading this clickbait. The hack in the title was more of a life hack than a system hack.
