Corpus creation date: 2011-02-16
Corpus release date: 2011-06-10

Authors:
Jannik Strötgen, stroetgen@uni-hd.de
Michael Gertz, gertz@uni-hd.de

The WikiWarsDE corpus
#####################

1. Introduction
---------------
This is the README file for the distribution of the WikiWarsDE corpus, a 
German corpus containing Wikipedia [1] articles with annotations of temporal
expressions. The creation of the corpus was motivated by the English version
of the corpus, the WikiWars corpus [2]. For the creation of WikiWarsDE as 
well as for the distribution we followed the developers of the WikiWars 
corpus, Pawel Mazur and Robert Dale. Thus, a lot of the information mentioned
in this file follows the information provided by them in their README file.
At this point: Thanks to Pawel Mazur and Robert Dale!

The corpus was developed to support research on temporal information 
extraction and normalization. This file contains information about licensing, 
and corpus creation, as well as some statistics on the corpus.

2. Licensing Terms
------------------
The licensing terms are according to the licensing terms of the WikiWars 
corpus:
All the documents in the corpus are sources from German Wikipedia. As a 
consequence, the corpus is released under the Creative Commons 
Attribution-ShareAlike 3.0 License - see the license at
http://en.wikipedia.org/wiki/Wikipedia:Text_of_Creative_Commons_Attribution-
ShareAlike_3.0_Unported_License.

See also the Terms of Use at http://wikimediafoundation.org/wiki/Terms_of_Use.

It is important to note that each time 'you distribute or publicly perform the 
work or a collection, the licensor offers to the recipient a license to the 
work on the same terms and conditions as the license granted to you under this 
license.'

Furthermore, the German "Nutzungsbedingungen" can be found here:
http://wikimediafoundation.org/wiki/Nutzungsbedingungen

3. Dictionary Structure
-----------------------
The WikiWarsDE package is structured as follows:

WikiWarsDE_20110412/readme.txt
	This is the readme file you are currently reading.
WikiWarsDE_20110412/in/
	This directory contains the 22 documents in SGML format without
	annotations of temporal expressions.
WikiWarsDE_20110412/keyinline/
	This directory contains the 22 documents with inline annotations of
	temporal expressions.
WikiWarsDE_20110412/key/
	This directory contains the offset annotatations of temporal expressions
	for the 22 documents.

4. Corpus Creation
------------------
Here, we describe the Data Collection (Section 4.1), the Text Extraction and 
Preprocessing (Section 4.2) and the Annotation Process (Seciton 4.3).

4.1 Data Collection
-------------------
For data collection, we used the cross-language links from the Wikipedia sites
of the documents contained in the WikiWars corpus [2]. Thus the WikiWarsDE 
corpus contains sections of the following Wikipedia articles:

NAME OF THE WAR		DATE	PAGE NAME AT: http://de.wikipedia.org/wiki
World War II           1939–1945     Zweiter_Weltkrieg
World War I            1914–1918     Erster_Weltkrieg
American Civil War     1861–1865     Sezessionskrieg
American Revolution    1775–1783     Amerikanischer_Unabhängigkeitskrieg
Vietnam War            1955–1975     Vietnamkrieg
Korean War             1950–1953     Koreakrieg
Iraq War               2003–...      Irakkrieg
French Revolution      1789–1799     Französische_Revolution
Persian Wars           499–450 BC    Perserkriege
Punic Wars             264–146 BC    Punische_Kriege
Chinese Civil War      1945–1949     Chinesischer_Bürgerkrieg
Iran-Iraq War          1980–1988     Erster_Golfkrieg
Russian Civil War      1917–1923     Russischer_Bürgerkrieg
French Indochina War   1946–1954     Indochinakrieg
Mexican Revolution     1911–1920     Mexikanische_Revolution
Spanish Civil War      1936–1939     Spanischer_Bürgerkrieg
French-Algerian War    1954–1962     Algerienkrieg
Soviet-Afghanistan War 1979–1989     Sowjetisch-Afghanischer_Krieg
Russo-Japanese War     1904–1905     Russisch-Japanischer_Krieg
Russo-Polish War       1919–1921     Polnisch-Sowjetischer_Krieg
Biafran War            1967–1970     Biafra-Krieg
Abyssinian War         1935–1936     Italienisch-Äthiopischer_Krieg_(1935–1936)

Due to the briefness of the Wikipedia article about the Punic Wars in general,
we used sections of the separate articles about the 1st, 2nd, and 3rd Punic 
Wars:
NAME OF THE WAR		DATE	PAGE NAME AT: http://de.wikipedia.org/wiki
1st Punic War          264-241 BC    Erster_Punischer_Krieg
2nd Punic War	       218-201 BC    Zweiter_Punischer_Krieg
3rd Punic War          149-146 BC    Dritter_Punischer_Krieg

4.2 Text Extraction and Preprocessing
-------------------------------------
Following Mazur and Dale (2010), we manually copied sections of the documents
that describe the course of the wars. All pictures, cross-page references, and 
citations were removed. All text files were then converted into SGML files, the
format of the ACE TERN corpora containing DOC, DOCID, DOCTYPE, DATETIME, and 
TEXT tags. 
The document creation time was set to the time of downloading the articles
from Wikipedia. The TEXT tag surrounds the text that is to be annotated.
This document structure intentionally follows that of the WikiWars corpus an
thus that of the ACE 2005 and 2007 documents, so as to make the processing and 
evaluation of the WikiWarsDE data highly compatible with the tools used to 
process the ACE corpora [3,4].

4.3 Annotation Process
----------------------
The annotation process differs from the process of WikiWars.
Similar to Mazur and Dale (2010), we used our temporal tagger, HeidelTime [5],
containing a rule set for German as a first-pass annotation tool. 
The output of the tagger can then be imported to the annotation tool 
Callisto [6] for manual correction of the annotations. This procedure is
motivated by the fact that “annotator blindness” is reduced to a minimum, 
i.e., that annotators miss temporal expressions. Furthermore, the annotation 
effort is reduced since one does not have to create a TIMEX2 tag for the 
expressions already identified by HeidelTime. At the second annotation stage, 
the documents were examined for temporal expressions missed by HeidelTime and 
annotations created by HeidelTime were manually corrected. 
This task was performed by two annotators – although Annotator 2 only annotated 
the extents of temporal expressions. The more difficult task of normalizing the 
temporal expressions was performed by Annotator 1 only, since a lot of 
experience in temporal annotation is required for this task. At the third 
annotation stage, the results of both annotators were merged and all 
normalizations of the expressions were checked and corrected by Annotator 1. 
Finally, the annotated files, which contain inline annotations, were transformed 
into the ACE APF XML format, a stand-oﬀ markup format used by the ACE 
evaluations. Thus, the WikiWarsDE corpus is available in the same two formats 
as the WikiWars corpus and the evaluation tools of the ACE TERN evaluations can
be used with this German corpus as well.

5. Corpus Statistics
--------------------
The 22 documents contain 95,604 tokens in total. Note that also the WikiWars 
corpus contains almost 25,000 tokens more than WikiWarsDE, there are many 
compounds in German, e.g., the 3 English tokens "course of war" is just 1 token 
in German (Kriegsverlauf). In total, the 22 documents contain 2,240 temporal 
expressions annotated with TIMEX2 (September 2005) standard [7].
Details of the single documents are as follows:
Document                     Tokens  Sentence  Timex  Tokens/Timex
01_WW2                       11,070     520     381       29.1
02_WW1                        9,701     458     311       31.2
03_AmCivWar                  13,692     792     310       44.2
04_AmRevWar                   5,398     227     149       36.2
05_VietnamWar                 4,286     188      53       80.9
06_KoreaWar                   2,493     121      51       48.9
07_IraqWar                    2,167      90      44       49.3
08_FrenchRev                  6,659     210      93       71.6
09_GrecoPersian               4,097     238      36      113.8
10_PunicWars                  3,907     239      67       58.3
11_ChineseCivWar              1,940      59      53       36.6
12_IranIraq                   3,162     121     111       28.5
13_RussianCivWar              9,090     467     173       52.5
14_FirstIndochinaWar          1,595      62      36       44.3
15_MexicanRev                 1,845      58      52       35.5
16_SpanishCivilWar            1,747      69      69       25.3
17_AlgerianWar                1,070      45      34       31.5
18_SovietsInAfghaistan        1,383      65      39       35.5
19_RussoJap                   2,206     115      33       66.8
20_PolishSoviet               5,924     329      91       65.1
21_NigerianCivilWar             948      40      22       43.1
22_SecondItaloAbyssinianWar   1,224      51      32       38.3

Total for the whole corpus   95,604   4,564   2,240       42.7
Average per document          4,341     207     102       --


6. Acknowledgements
-------------------
For corpus preparation, we used the UIMA framework [8] and Tokenizer and 
Sentence Splitter of DKPro [9]. Furthermore, we used the annotation tool 
Callisto [6].
We want to thank the developers of WikiWars. We followed their description
for corpus creation.

If you use WikiWarsDE and want to cite this resource, please use the following 
details:
Jannik Strötgen and Michael Gertz (2011): WikiWarsDE: A German Corpus of 
Narratives Annotated with Temporal Expressions. GSCL 2011: Conference of the
German Society for Computational Linguistics and Language Technology, 2011.

7. References
-------------
[1] http://www.wikipedia.org/
[2] Pawel Mazur and Robert Dale (2010). WikiWars: A New Corpus for Research on 
Temporal Expressions. In the Proceedings of the Conference on Empirical 
Methods in Natural Language Processing (EMNLP), 9-11 October 2010,
Massachusetts, USA.
[3] http://www.itl.nist.gov/iad/mig//tests/ace/2004/software/ace04-eval-v10.pl
[4] http://timex2.mitre.org/tern.html
[5] Jannik Strötgen and Michael Gertz. HeidelTime: High Quality Rule-based 
Extraction and Normalization of Temporal Expressions. In SemEval-2010: 
Proceedings of the 5th International Workshop on Semantic Evaluation. 
Pages 321-324, Uppsala, Sweden, July 15-16, 2010. ACL.
[6] http://callisto.mitre.org
[7] http://timex2.mitre.org/annotation_guidelines/timex2_annotation_
guidelines.html
[8] http://uima.apache.org/
[9] http://www.ukp.tu-darmstadt.de/research/projects/dkpro/

