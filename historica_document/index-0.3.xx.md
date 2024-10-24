<div align="center" style="color:red">
<sub>
(Not) Smart and dynamic extraction point of time in your note
</sub>
</div>

---


<ul>

<li>(Not) Smart and dynamic extraction point of time in your note or multi notes</li>

<li>  visualize the time in your note </li>

<li>Give you the abilities (but I am not sure they will give you absolute freedom) to custom your timeline </li>


</ul>

---


### The most basic
- Just create a `historica` block

````
```historica
```
````

- Oh yeah, after you did that, the block will just work, it will read the content in the current file (except anything in the code block). Split them to sentences, and if a sentence have a string that can be parse as date or time. It will show up in the timeline
- Well, in the legacy version, I try to support multi language, but I realize it just the technical dept, why I try to support languages that I never using. So Historica will just port only English.
- Below is the example when I try to extract the first paragraph from https://en.wikipedia.org/wiki/2020_United_States_presidential_election . You can check the example at [[2020 United States presidential election - 0.3.xx]]


![[Pasted image 20241022232403.png]]
### More customize
- And you can try to toys with so many funny thing when you right click/ or hold your finger long enough in the screen if you using mobile - to trigger the context me.



![[Pasted image 20241022233205.png]]



![[Pasted image 20241022233235.png]]

>[!note]
> Oh remember that if you open context menu in the content areas (number 2)- and the area outside them (number 1) - different menu will appear - Menu 1 intend for interactive in the entire timeline, and so we have the opposite with menu 2 for each plot event

![[Pasted image 20241022233635.png]]

- Let see, I want to create a add funny detail on our plot.
- I will click `edit` and edit our timeline like a Brotato
![[Pasted image 20241022233902.png]]
- And hehe, now I can edit any thing I want in the rich text editor, even add an image to it (by copy-paste)
![[Pasted image 20241022234521.png]]

- and now we have the result
![[Pasted image 20241022234622.png]]

- That all, but wait, we still not finish, please remember to SAVE YOUR PLOT, because Historica will not auto save - all the custom contents you created - for you.

 ![[Pasted image 20241022234801.png]]
- Well, you will see that the data will be save in a json file in  `historica-data/xxxx.json`. Well, and the block will be modified to store the file id. Next time, if this block need to render, it will load from that file instead of recompute. So what if you want to using NLP auto generate timeline feature again, hum, in this case, simply recreate the block, or empty the setting, or just change the id to "-1". In future I will consider add feature to manual parse content from file using NLP and import it to current timeline, but right now I don't need that feature much. 
- Ah, I need to remind you that you can open the historica-data directory to check how the data was saved, they are just json. But by default Obsidian cannot view json file, please using other tool and please don't being confused when there is nothing being  shown via the Files panel.

![[Pasted image 20241022235212.png]]

>[!note]
>Why I didn't implement autosave (via react-hook or similar) , because it nearly imposible due to the async nature of Obsidian. All behaviours which have side effect that can change the content of the vault, must be manual trigger by user.
