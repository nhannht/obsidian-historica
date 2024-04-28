- Now historica support 9 languages

| Language               | Code    |
| ---------------------- | ------- |
| English(International) | en      |
| French                 | fr      |
| Deutsch                | de      |
| Japanese               | ja      |
| Dutch                  | nl      |
| Ukrainian              | uk      |
| Russian                | ru      |
| Portugues              | pt      |
| Chinese (Traditional)  | zh.hant |

By default, to minimize the error rate when parsing, Historica underlying natural language parsing system for time - Chrono-js - is using only 1 language at the same time

>[!tip]
>Historica by default not parsing year alone, case "1997",...etc will not work in most language, except English, because Historica have its  custom parser. But it not mean in another language it will work, example - `In Nachkriegszeit und 1950 wesentliche Beiträge zur Entstehung der Teildisziplin`. 
>
>Please make your statement clearer like `August/1950`
>
>It is the same with your advantage query syntax, which powered under the same library. 
>

 - Work
````toml  
  
```historica  
[query.from-1997-to-2022]  start="1997/Jun/12"  end="2022/Jun/13"
  
```  
  
````  
- Not work
````toml
```historica
[query.from-1950-to-1960]
start="1950"
end="1960"
```
```

