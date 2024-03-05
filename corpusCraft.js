const nlp = require('wink-nlp-utils')
const fs = require('fs')
let corpus = nlp.string.composeCorpus("[#Noun|#Pronoun]  [#Verb] [|#Determiner|#Adjective|#Adverb|#Verb] [|#Adjective] [|#Value] [|#Pronoun|#Noun]")
// let corpus = nlp.string.composeCorpus("[|#Determiner] [|#Adjective] [#Singular|#Place|#Organization|#Actor|#Activity|#Possessive] [#Verb]")
// sort the corpus by length
corpus = corpus.sort( (a, b) => b.length - a.length)
console.log(corpus)
fs.writeFileSync('corpus.json', JSON.stringify(corpus, null, 2))
