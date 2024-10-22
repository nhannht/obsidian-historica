::: {align="center" style="color:red"}
<sub>
(Not) Smart and dynamic extraction point of time in your note
</sub>
:::

------------------------------------------------------------------------

<ul>

<li>

(Not) Smart and dynamic extraction point of time in your note or multi notes
</li>

<li>

visualize the time in your note
</li>

<li>

Give you the abilities (but I am not sure if they will give you absolute freedom) to custom your timeline
</li>

</ul>

------------------------------------------------------------------------

### The most basic

- Just create a `historica` block

<!-- -->

    ```historica
    ```

- Oh yeah, after you did that, the block will just work, it will read the content in the current file (except anything in the code block). Split them to sentences, and if a sentence have a string that can be parse as date or time. It will show up in the timeline
- Well, in the legacy version, I try to support multi language, but I realize it just the technical dept, why I try to support languages that I never using. So Historica will just port only English.
- Below is the example when I try to extract the first paragraph from https://en.wikipedia.org/wiki/2020_United_States_presidential_election . You can check the example at [2020 United States presidential election - 0.3.xx](2020 United States presidential election - 0.3.xx "wikilink")

![Pasted image 20241022232403.png](index-0.3.xx-media/797817433f3fef2f1d86a8221926bf06b8c18186.png "wikilink")

### More customize
- And you can try to toy with so many funny thing when you right-click/ or hold your finger long enough in the screen if you using mobile - to trigger the context me.

<figure>
<img
src="index-0.3.xx-media/e7ba2b6607f12553621149103cb49d4095a317fb.png"
title="wikilink" alt="Pastedimage20241022233205.png" />
<figcaption
aria-hidden="true">Pastedimage20241022233205.png</figcaption>
</figure>

<figure>
<img
src="index-0.3.xx-media/256ca3b6adb235989c2f08869345720af7ad8ae6.png"
title="wikilink" alt="Pastedimage20241022233235.png" />
<figcaption
aria-hidden="true">Pastedimage20241022233235.png</figcaption>
</figure>

> [!note]
> Oh remember that if you open context menu in the content areas (number 2)- and the area outside them (number 1) - different menu will appear - Menu 1 intend for interactive in the entire timeline, and so we have the opposite with menu 2 for each plot event

<figure>
<img
src="index-0.3.xx-media/392d35c2630b63d8212f93a877fc5ba5f76588fd.png"
title="wikilink" alt="Pastedimage20241022233635.png" />
<figcaption
aria-hidden="true">Pastedimage20241022233635.png</figcaption>
</figure>

- Let see, I want to create a add funny detail on our plot.

- I will click `edit` and edit our timeline like a Brotato
  ![Pasted image 20241022233902.png](index-0.3.xx-media/87d2b4a863bd5c1d74e2f244b767a9c930045555.png "wikilink")

- And hehe, now I can edit any thing I want in the rich text editor, even add an image to it (by copy-paste)
  ![Pasted image 20241022234521.png](index-0.3.xx-media/b65c9bdd3590079d9a8c4336ba0ec59feef0ee9c.png "wikilink")

- and now we have the result
  ![Pasted image 20241022234622.png](index-0.3.xx-media/fdca692830830e22285456540f77286b7a27fa3d.png "wikilink")

- That all, but wait, we still not finish, please remember to SAVE YOUR PLOT, because Historica will not auto save - all the custom contents you created - for you.

![Pasted image 20241022234801.png](index-0.3.xx-media/e41766932d589f5a0b9ff524f6c4548bff807aaf.png "wikilink")
- Well, you will see that the data will be save in a json file in `historica-data/xxxx.json`. Well, and the block will be modified to store the file id. Next time, if this block need to render, it will load from that file instead of recompute. So what if you want to using NLP auto generate timeline feature again, hum, in this case, simply recreate the block, or empty the setting, or just change the id to "-1". In future I will consider add feature to manual parse content from file using NLP and import it to current timeline, but right now I don't need that feature much.
- Ah, I need to remind you that you can open the historica-data directory to check how the data was saved, they are just json. But by default Obsidian cannot view json file, please using other tool and please don't being confused when there is nothing being shown via the Files panel.

<figure>
<img
src="index-0.3.xx-media/89089aabfbf27cc6aa69faab66c05551c01c228f.png"
title="wikilink" alt="Pastedimage20241022235212.png" />
<figcaption
aria-hidden="true">Pastedimage20241022235212.png</figcaption>
</figure>

> [!note]
> Why I didn't implement autosave (via react-hook or similar) , because it nearly impossible due to the async nature of Obsidian. All behaviours which have side effect that can change the content of the vault, must be manual trigger by user.
