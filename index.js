const express = require("express");
const fs = require("fs");
const path = require("path")
const axios = require("axios");
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const data = require("./data");

const app = express();

app.get("/", (req,res) => {
    res.sendFile(path.join(__dirname+"/src/index.html"))
})

app.get("list", (req,res) => {
    const url = "http://frequencylists.blogspot.com/2016/01/the-2980-most-frequently-used-german.html"

    JSDOM.fromURL(url).then(dom => {
        dom.serialize()

        let emptyArr = [];
        dom.window.document.querySelectorAll("")
    })
})

app.get("/parse", (req,res) => {
    res.send(data);
})

app.get("/search", (req, res) => {
    const {word} = req.query;
    console.log(word," working");
    const tatoebaURL = `https://tatoeba.org/eng/sentences/search?query=${word}&from=deu&to=eng&orphans=no&unapproved=no&user=&tags=&list=&has_audio=&trans_filter=limit&trans_to=eng&trans_link=&trans_user=&trans_orphan=&trans_unapproved=&trans_has_audio=&sort=random`
    const lexiconURL = `https://www.sanakirja.org/search.php?q=${word}&l=16&l2=3`
    const dictionary = `https://www.collinsdictionary.com/search/?dictCode=german-english&q=${word}`
    
    
    JSDOM.fromURL(tatoebaURL).then(dom => {
        
            dom.serialize();
            
            let sentence1 = dom.window.document.querySelector(".sentence-and-translations")
                .querySelector(".sentence").querySelector(".text")
                .textContent.replace(/(\r\n|\n|\r)/gm,"").trim();
            let sentence2 = dom.window.document.querySelector(".translations")
                .querySelector(".translation").querySelector(".text").textContent
                .replace(/(\r\n|\n|\r)/gm,"").trim();
            let author = dom.window.document.querySelector(".sentence-and-translations")
                    .getElementsByTagName("A")[1].innerHTML;
                
            return results = {
                    author: author,
                    sentence1: sentence1,
                    sentence2: sentence2
                }
            })
          .then(result => {
              if(!result) {
                  return res.send("error")
              }
            JSDOM.fromURL(dictionary).then(dom => {
                dom.serialize();
                const word = dom.window.document.querySelectorAll(".orth")[0].textContent;
                const plural = dom.window.document.querySelectorAll(".orth")[2].textContent;
                const translation = dom.window.document.querySelectorAll(".quote")[0].textContent;
                console.log(word,plural, translation);
                
                result.word = word;
                result.plural = plural;
                result.translation = translation;

                return result;
            })
            .then(result => {
                JSDOM.fromURL(lexiconURL).then(dom => {
                    dom.serialize();
                    const gender = dom.window.document.querySelector(".gender span").textContent
                    
                    result.gender = gender;
    
                    res.send(result);
            }).catch(err => res.send(err));
        })
        .catch(err => res.send(err));
          })
          .catch(err => res.send(err));
    
})

app.listen(3000, () => console.log("listening port: 3000"))