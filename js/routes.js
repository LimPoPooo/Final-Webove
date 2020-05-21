//an array, defining the routes
export default [

    {
        //the part after '#' in the url (so-called fragment):
        hash: "welcome",
        ///id of the target html element:
        target: "router-view",
        //the function that returns content to be rendered to the target html element:
        getTemplate: (targetElm) =>
            document.getElementById(targetElm).innerHTML = document.getElementById("template-welcome").innerHTML

    },

    {
        hash: "articles",
        target: "router-view",
        getTemplate: fetchAndDisplayArticles
    },
    {
        hash:"commSend",
        target:"articles",
        getTemplate: addNewAComment
    },
    {
        hash: "article",
        target: "router-view",
        getTemplate: fetchAndDisplayArticleDetail
    },

    {
        hash: "artEdit",
        target: "router-view",
        getTemplate: editArticle
    },

    {
        hash: "artDelete",
        target: "router-view",
        getTemplate: deleteArticle
    },

    {
        hash: "opinions",
        target: "router-view",
        getTemplate: createHtml4opinions

    },

    {
        hash:"artInsert",
        target:"router-view",
        getTemplate: addArticle
    },

    {
        hash: "addOpinion",
        target: "router-view",
        getTemplate: addOpinionF

},

    {
        hash: "mojeArticles",
        target: "router-view",
        getTemplate: fetchAndDisplayArticlesM
    },

];

const urlBase = "https://wt.kpi.fei.tuke.sk/api";
const articlesPerPage = 20;
let currentPage = 1;
let idForDelete = 0;

let totalArticleCount = 0;
fetchTotalCount();
let totalArticleCountM = 0;
fetchTotalCountM();


if(!localStorage.offset){
    localStorage.setItem("offset", 1);
}
if(!localStorage.totalcount){
    localStorage.setItem("totalcount", 38);
}


const offset = localStorage.getItem("offset");
const totalcount = localStorage.getItem("totalcount");
document.getElementById("articlelink").href= '#articles/'+offset+'/'+totalcount+'';


function addOpinionF(targetElm){
    let opinions = [];
    document.getElementById(targetElm).innerHTML = Mustache.render(document.getElementById("template-addOpinion").innerHTML,opinions);
    updateSignIn();
}

function createHtml4opinions(targetElm) {
    const url = "https://parseapi.back4app.com/classes/nazory";
    const defaultsettings = {
            method: 'GET',
            headers: {
                'X-Parse-Application-Id': 'GEQs6n5MwHeuCexFXwprvFpFjdMjesCg9pLMH2Iu',
                'X-Parse-REST-API-Key': 'Gt4IoTSWHbLmWp1Gdnmz7I0fHwnMb8MfhjiGHKkb'
            }
        };
    fetch(url,defaultsettings)
        .then(response => {
            if (response.ok) {
                return response.json();
            } else { //if we get server error
                return Promise.reject(new Error(`Server answered with ${response.status}: ${response.statusText}.`));
            }
        })

        .then(responseJSON => {
            document.getElementById(targetElm).innerHTML =
                Mustache.render(
                    document.getElementById("template-opinions").innerHTML,
                    responseJSON.results
                );
            console.log(responseJSON);
            return Promise.resolve();
        })

        .catch(error => { ////here we process all the failed promises
            const errMsgObj = {errMessage: error};
            document.getElementById("router-view").innerHTML =
                Mustache.render(
                    document.getElementById("template-articles-error").innerHTML,
                    errMsgObj
                );
        });
}

function fetchTotalCount() {
    const url = "https://wt.kpi.fei.tuke.sk/api/article";

    fetch(url)
        .then(response => {
            if (response.ok) {
                return response.json();
            } else { //if we get server error
                return Promise.reject(new Error(`Server answered with ${response.status}: ${response.statusText}.`));
            }
        })

        .then(tab => {
            totalArticleCount = tab.meta.totalCount;
            return Promise.resolve();
        })

        .catch(error => { ////here we process all the failed promises
            const errMsgObj = {errMessage: error};
            document.getElementById("router-view").innerHTML =
                Mustache.render(
                    document.getElementById("template-articles-error").innerHTML,
                    errMsgObj
                );
        });
}

function fetchTotalCountM() {
    const url = "https://wt.kpi.fei.tuke.sk/api/article/?tag=manchesteru";
    fetch(url)
        .then(response => {
            if (response.ok) {
                return response.json();
            } else { //if we get server error
                return Promise.reject(new Error(`Server answered with ${response.status}: ${response.statusText}.`));
            }
        })

        .then(tab => {
            totalArticleCountM = tab.meta.totalCount;
            return Promise.resolve();
        })

        .catch(error => { ////here we process all the failed promises
            const errMsgObj = {errMessage: error};
            document.getElementById("router-view").innerHTML =
                Mustache.render(
                    document.getElementById("template-articles-error").innerHTML,
                    errMsgObj
                );
        });
}

function fetchAndDisplayArticles(targetElm, offsetFromHash, totalCountFromHash) {
    let articles =[];
    offsetFromHash=Number(offsetFromHash);
    totalCountFromHash=Math.floor(totalArticleCount/20)+1;
    localStorage.setItem("offset", JSON.stringify(offsetFromHash));
    localStorage.setItem("totalcount", JSON.stringify(totalCountFromHash));

    const data4rendering={
        currPage:offsetFromHash,
        pageCount:totalCountFromHash,
        articleList: articles
    };

    if(offsetFromHash>1){
        data4rendering.prevPage=offsetFromHash-1;
    }

    if(offsetFromHash<totalCountFromHash){
        data4rendering.nextPage=offsetFromHash+1;
    }

    let offset = data4rendering.currPage * 10;
    const url = "https://wt.kpi.fei.tuke.sk/api/article/?max=20&offset=" + offset;

    const articlesElm = document.getElementById("router-view");
    fetch(url)
        .then(response =>{
            if(response.ok){
                return response.json();
            }else{ //if we get server error
                return Promise.reject(new Error(`Server answered with ${response.status}: ${response.statusText}.`));
            }
        })
        .then(responseJSON => {
            addArtDetailLink2ResponseJson(responseJSON);
            document.getElementById(targetElm).innerHTML =
                Mustache.render(
                    document.getElementById("template-articles").innerHTML,
                    responseJSON
                );
            data4rendering.articleList=responseJSON.articles;
            return Promise.resolve();
        })
            .then( ()=> {

            let prrt;

            let cntRequests = data4rendering.articleList.map(
                article => fetch(`https://wt.kpi.fei.tuke.sk/api/article/${article.id}`)
            );
            return Promise.all(cntRequests);
        })
        .then(responses =>{
            let failed="";
            for(let response of responses) {
                if(!response.ok) failed+=response.url+" ";
            }
            if(failed===""){
                return responses;
            }else{
                return Promise.reject(new Error(`Failed to access the content of the articles with urls ${failed}.`));
            }
        })
        .then(responses => Promise.all(responses.map(resp => resp.json())))
        .then(articles => {
            articles.forEach((article,index) =>{
                data4rendering.articleList[index].content=article.content;
            });

            return Promise.resolve();
        })
        .then( () => {
            let commRequests = data4rendering.articleList.map(
                article => fetch(`https://wt.kpi.fei.tuke.sk/api/article/${article.id}/comment`)
            );
            return Promise.all(commRequests)
        })
        .then(responses =>{
            let failed="";
            for(let response of responses) {
                if(!response.ok) failed+=response.url+" ";
            }
            if(failed===""){
                return responses;
            }else{
                return Promise.reject(new Error(`Failed to access the comments with urls ${failed}.`));
            }
        })
        .then(responses => Promise.all(responses.map(resp => resp.json())))
        .then(comments => {
            comments.forEach((artComments,index) =>{
                data4rendering.articleList[index].comments=artComments.comments;
            });

            return Promise.resolve();
        })
        .then( () =>{
            let offset = localStorage.getItem("offset");
            document.getElementById("articlelink").href= '#articles/'+offset+'/38';
            renderArticles(data4rendering);
            console.log(data4rendering);

        })
        .catch (error => { ////here we process all the failed promises
            console.log(error);
        });

    function renderArticles(data) {
        articlesElm.innerHTML=Mustache.render(document.getElementById("template-articles").innerHTML, data ); //write some of the response object content to the page using Mustache

    }
}   // zobrazenie articlov

function fetchAndDisplayArticlesM(targetElm, offsetFromHash, totalCountFromHash) {
    let articles =[];
    offsetFromHash=Number(offsetFromHash);
    totalCountFromHash=Math.floor(totalArticleCountM/20)+1;
    console.log(totalCountFromHash);
    const data4rendering={
        currPage:offsetFromHash,
        pageCount:totalCountFromHash,
        articleList: articles
    };

    if(offsetFromHash>1){
        data4rendering.prevPage=offsetFromHash-1;
    }

    if(offsetFromHash<totalCountFromHash){
        data4rendering.nextPage=offsetFromHash+1;
    }

    let offset = data4rendering.currPage * 10;
    const url = "https://wt.kpi.fei.tuke.sk/api/article/?tag=manchesteru&max=20&offset=" + offsetFromHash;

    const articlesElm = document.getElementById("router-view");
    fetch(url)
        .then(response =>{
            if(response.ok){
                return response.json();
            }else{ //if we get server error
                return Promise.reject(new Error(`Server answered with ${response.status}: ${response.statusText}.`));
            }
        })
        .then(responseJSON => {
            addArtDetailLink2ResponseJson(responseJSON);
            document.getElementById(targetElm).innerHTML =
                Mustache.render(
                    document.getElementById("template-mojeArticles").innerHTML,
                    responseJSON
                );
            data4rendering.articleList=responseJSON.articles;
            return Promise.resolve();
            console.log(responseJSON);
        })
        .then( ()=> {

            let prrt;

            let cntRequests = data4rendering.articleList.map(
                article => fetch(`https://wt.kpi.fei.tuke.sk/api/article/${article.id}`)
            );
            return Promise.all(cntRequests);
        })
        .then(responses =>{
            let failed="";
            for(let response of responses) {
                if(!response.ok) failed+=response.url+" ";
            }
            if(failed===""){
                return responses;
            }else{
                return Promise.reject(new Error(`Failed to access the content of the articles with urls ${failed}.`));
            }
        })
        .then(responses => Promise.all(responses.map(resp => resp.json())))
        .then(articles => {
            articles.forEach((article,index) =>{
                data4rendering.articleList[index].content=article.content;
            });

            return Promise.resolve();
        })
        .then( () => {
            let commRequests = data4rendering.articleList.map(
                article => fetch(`https://wt.kpi.fei.tuke.sk/api/article/${article.id}/comment`)
            );
            return Promise.all(commRequests)
        })
        .then(responses =>{
            let failed="";
            for(let response of responses) {
                if(!response.ok) failed+=response.url+" ";
            }
            if(failed===""){
                return responses;
            }else{
                return Promise.reject(new Error(`Failed to access the comments with urls ${failed}.`));
            }
        })
        .then(responses => Promise.all(responses.map(resp => resp.json())))
        .then(comments => {
            comments.forEach((artComments,index) =>{
                data4rendering.articleList[index].comments=artComments.comments;
            });

            return Promise.resolve();
        })
        .then( () =>{
            renderArticles(data4rendering);
            console.log(data4rendering);

        })
        .catch (error => { ////here we process all the failed promises
            console.log(error);
        });

    function renderArticles(data) {
        articlesElm.innerHTML=Mustache.render(document.getElementById("template-mojeArticles").innerHTML, data ); //write some of the response object content to the page using Mustache
        //articlesElm.innerHTML = Mustache.render(document.getElementById("template-articles").innerHTML, data );
    }
}   // zobrayenie articlov s mojim tagom

function editArticle(targetElm, artIdFromHash, offsetFromHash, totalCountFromHash) {
    fetchAndProcessArticle(...arguments, true);
}

function fetchAndDisplayArticleDetail(targetElm, artIdFromHash, offsetFromHash, totalCountFromHash) {
    fetchAndProcessArticle(...arguments, false);
}

function addArticle(targetElm) {
    let articleData = {
        submitBtTitle: "Save article",
        urlBase: urlBase,
        formSubmitCall: `processArtAddFrmData(event,'${urlBase}')`,
        formTitle: "Add article"
    };
    console.log(articleData);
    document.getElementById(targetElm).innerHTML =
        Mustache.render(
            document.getElementById("template-article-form").innerHTML,
            articleData
        );
    updateSignIn();
}

function deleteArticle(targetElm, artIdFromHash, offsetFromHash, totalCountFromHash) {
    const url = `${urlBase}/article/${artIdFromHash}`;


    fetch(url, {method: 'DELETE'})
        .then(response => {
            if (response.ok) {
                return response.json();

            } else { //if we get server error
                return Promise.reject(new Error(`Server answered with ${response.status}: ${response.statusText}.`));
            }
        })
        .catch(error => { ////here we process all the failed promises
            const errMsgObj = {errMessage: error};
            document.getElementById(targetElm).innerHTML =
                Mustache.render(
                    document.getElementById("template-articles-error").innerHTML,
                    errMsgObj
                );
        })
        .finally(() => {
            window.location.href = `#articles/${offsetFromHash}/${totalCountFromHash}`;
        });

}

function fetchAndProcessArticle(targetElm, artIdFromHash, offsetFromHash, totalCountFromHash, forEdit,) {
    const url = `${urlBase}/article/${artIdFromHash}`;
    const offset10 = Math.floor(offsetFromHash/10);
    let JSONwithEverything;

    fetch(url)
        .then(response => {
            if (response.ok) {
                return response.json();
            } else { //if we get server error
                return Promise.reject(new Error(`Server answered with ${response.status}: ${response.statusText}.`));
            }
        })
        .then(responseJSON => {
            let offset = localStorage.getItem("offset");
            let totalcount = localStorage.getItem("totalcount");
            if (forEdit) {
                responseJSON.formTitle = "Article Edit";

                responseJSON.formSubmitCall =
                    `processArtEditFrmData(event,${artIdFromHash},${offset},${totalcount},'${urlBase}')`;
                responseJSON.submitBtTitle = "Save article";
                responseJSON.urlBase = urlBase;

                responseJSON.backLink = `#article/${artIdFromHash}/${offset}/${totalcount}`;

                JSONwithEverything = responseJSON;

            } else {
                responseJSON.backLink = `#articles/${offset}/${totalcount}`;
                responseJSON.editLink = `#artEdit/${responseJSON.id}/${offset}/${totalcount}`;
                responseJSON.addCommLink=`#commSend/${responseJSON.id}`;
                responseJSON.deleteLink = `#artDelete/${responseJSON.id}/${offset}/${totalcount}`;

                JSONwithEverything = responseJSON;
                updateSignIn();
            }

        })
        .then( () => {
            return fetch(`https://wt.kpi.fei.tuke.sk/api/article/${artIdFromHash}/comment/?max=10&offset=`+offsetFromHash)
        })
        .then(response =>{
            if(response.ok){
                return response.json();
            }else{ //if we get server error
                return Promise.reject(new Error(`Server answered with ${response.status}: ${response.statusText}.`));
            }
        })
        .then(responseJSON => {
                offsetFromHash = Number(offsetFromHash);
                JSONwithEverything.comments = responseJSON.comments;
                JSONwithEverything.pageCountC = totalCountFromHash=Math.floor(JSONwithEverything.comments.length/10)+1;
                //const offset10 = Math.floor(offsetFromHash/10);
            if(offsetFromHash>1){
                JSONwithEverything.prevPageC=offsetFromHash-1;
            }

            if(offsetFromHash<JSONwithEverything.pageCountC){
                JSONwithEverything.nextPageC=offsetFromHash+1;
            }
            JSONwithEverything.currPageC=offsetFromHash;
                //console.log(offsetFromHash);

            document.getElementById(targetElm).innerHTML =
                    Mustache.render(
                        document.getElementById("template-article").innerHTML,
                        JSONwithEverything
                    );
                updateSignIn();
                console.log(JSONwithEverything);
        })
        .catch(error => { ////here we process all the failed promises
            const errMsgObj = {errMessage: error};
            document.getElementById(targetElm).innerHTML =
                Mustache.render(
                    document.getElementById("template-articles-error").innerHTML,
                    errMsgObj
                );
            updateSignIn();
        });

}

function getlength(data){
    const sum = data.length;
    return sum;
}

function addArtDetailLink2ResponseJson(responseJSON, offset, totalCount) {
    const offset10 = Math.floor(responseJSON.meta.offset/10);
    const total=Math.floor(responseJSON.meta.totalCount/20)+1;
    //JSONwithEverything.pageCountC = Math.floor(JSONwithEverything.comments.length/10)+1;
    //console.log(responseJSON);

    responseJSON.articles =
        responseJSON.articles.map(

            article => (
                {
                    ...article,
                    detailLink: `#article/${article.id}/1/1`

                }
            )
        );



}

function addNewAComment(targetElm, artIdFromHash) {
    const newCommData = {
        text: document.getElementById("commentAdd").value.trim(),
        author: document.getElementById("commentAuthor").value.trim(),
    };

    if (!(newCommData.text && newCommData.author)) {
        window.alert("Please, enter article title and content");
        return;
    }
    const postReqSettings =
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json;charset=utf-8',
            },
            body: JSON.stringify(newCommData)
        };
    fetch(`${urlBase}/article/${artIdFromHash}/comment`, postReqSettings)
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                return Promise.reject(new Error(`Server answered with ${response.status}: ${response.statusText}.`));
            }
        })
        .then(responseJSON => {
            window.location.hash=`#article/${artIdFromHash}`;
        })
        .catch(error => {
            window.alert("Error adding comment to the server!");
            window.location.hash=`#article/${artIdFromHash}`;
        });
}
