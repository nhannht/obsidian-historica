<div align="center">  
<sub>  
Give a stricter query by specific multi time ranges  
</sub>  
</div>  
  
````toml  
  
```historica  
[query.from-1997-to-2022]  start="1997/Jun/12"  end="2022/Jun/13"    
    
[query.from-1000-to-1500]  start="1000/Jun/12"  end="1500/Jun/13"  
  
```  
  
````  
  
![](images/.README_images/historica_query_example.png)  
  
> [!tip]  
> Historica using `toml` as configuration syntax, so a table/table array is the syntax to define your query. You can  
> check more of them [here](https://toml.io/en/v1.0.0#table)
