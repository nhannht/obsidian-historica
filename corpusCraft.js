const nlp = require('wink-nlp-utils')
const fs = require('fs')
let corpus = nlp.string.composeCorpus( "[#Noun|#Pronoun] [#Copula|#PresentTense|#Verb]  [#Verb] [|#Determiner|#Adjective|#Adverb] [|#Adjective] [|#Value] [#Pronoun|#Noun] " )

// sort the corpus by length
corpus = corpus.sort( (a, b) => b.length - a.length)
console.log(corpus)
fs.writeFileSync('corpus.json', JSON.stringify(corpus, null, 2))
