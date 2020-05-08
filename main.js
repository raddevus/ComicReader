var oReq = new XMLHttpRequest();
var clientWidth = 0;
var isDilbert = false;
const DILBERT = "dilbert";
const DILBERT_DATE_ID = "currentDate";
const PEARLS = "pearls";
const PEARLS_DATE_ID = "currentPearlsDate";
const GARFIELD = "garfield";
const GARFIELD_DATE_ID = "currentGarfieldDate";

var comicName = DILBERT;

oReq.addEventListener("load", transferComplete);
oReq.addEventListener("error", transferFailed);

function transferComplete(evt) {
  console.log("The transfer is complete.");
  console.log(evt);
  // oReq.response contains the entire comic web page
  console.log(oReq.response);
  
  displayImage();
}

function displayImage(){
  var targetUrl = undefined;
  
  switch (comicName){
    case DILBERT:{
      loadComicData(".img-comic","src=\"//","https://");
      break;
    }
    case PEARLS:{
      loadComicData(".item-comic-image", 'src=\"');
      break;

    }
    case GARFIELD:{
      loadComicData(".item-comic-image", 'src=\"');
      break;
    }
  }
  document.querySelector("#targetImg").width = clientWidth - 10;
}

function loadComicData(comicSelector,searchText,urlPrefix){
  if (urlPrefix === undefined || urlPrefix === null){
    // insure urlPrefix is not undefined or null
    urlPrefix = "";
  }
  document.querySelector("#hidden").innerHTML = oReq.response;
  targetUrl = document.querySelector(comicSelector).outerHTML;
  var beginIdx = targetUrl.search(searchText) + searchText.length;
  targetUrl = targetUrl.substring(beginIdx,targetUrl.length);
  console.log("targetUrl : " + targetUrl);
  var endIdx = targetUrl.search("\"");
  targetUrl = targetUrl.substring(0,endIdx);
  console.log(targetUrl);
  document.querySelector("#targetImg").src = urlPrefix + targetUrl;

}

function resizeImage(){
  initClientSize();
  displayImage();
}

function initClientSize(){
  clientWidth = document.querySelector("body").clientWidth;
}

function initApp(){
  initClientSize();
  comicName = localStorage.getItem("comicName");
  if (comicName === undefined || comicName === null){
    // first time and it has never been initialized, set to dilbert
    comicName = DILBERT;
  }
  switch (comicName){
    case DILBERT:{
      document.querySelector("#dilbertRadio").checked = true;
      initDate(DILBERT_DATE_ID);
      break;
    }
    case PEARLS:{
      document.querySelector("#pearlsRadio").checked = true;
      initDate(PEARLS_DATE_ID);
      break;
    }
    case GARFIELD:{
      document.querySelector("#garfieldRadio").checked = true;
      initDate(GARFIELD_DATE_ID);
      break;
    }
  }
}

function saveCurrentRadio(){
    console.log("saveCurrentRadio...");
    if (document.querySelector("#dilbertRadio").checked){
      comicName = DILBERT;
      initDate(DILBERT_DATE_ID);
    }
    if (document.querySelector("#pearlsRadio").checked){
      comicName = PEARLS;
      initDate(PEARLS_DATE_ID);
    }
    if (document.querySelector("#garfieldRadio").checked){
      comicName = GARFIELD;
      initDate(GARFIELD_DATE_ID);
    }
    localStorage.setItem("comicName", comicName);
    
}

function initDate(dateId){
  var currentDate = undefined;
  currentDate = localStorage.getItem(dateId);
  
  if (currentDate !== undefined && currentDate !== null){
    document.querySelector("#x-date").value = currentDate;
  }
  else{
    document.querySelector("#x-date").value = new Date().yyyymmdd();
  }
}

function transferFailed(evt) {
  console.log("An error occurred while transferring the file.");
}

function requestPage(){
    var comicDate = new Date(document.querySelector("#x-date").value);
    
    comicDate.setDate(comicDate.getDate()+2);
    var targetUrl = null;
    switch (comicName){
      case DILBERT:{
        targetUrl = 'https://dilbert.com/' + comicDate.yyyymmdd();
        localStorage.setItem("currentDate", comicDate.yyyymmdd());
        document.querySelector("#x-date").value = comicDate.yyyymmdd();
        localStorage.setItem("comicName",comicName);
        break;
      }
      case PEARLS:{
        targetUrl = 'https://www.gocomics.com/pearlsbeforeswine/' + comicDate.yyyymmdd('/');
        localStorage.setItem("currentPearlsDate", comicDate.yyyymmdd());
        document.querySelector("#x-date").value = comicDate.yyyymmdd();
        localStorage.setItem("comicName", comicName);
        break;
      }
      case GARFIELD:{
        targetUrl = 'https://www.gocomics.com/garfield/' + comicDate.yyyymmdd('/');
        localStorage.setItem("currentGarfieldDate", comicDate.yyyymmdd());
        document.querySelector("#x-date").value = comicDate.yyyymmdd();
        localStorage.setItem("comicName", comicName);
        break;
      }
    }
    
    var url = 'http://uncoveryourlife.com/temp/GrabIt.aspx/?url=' + targetUrl;
    console.log("requesting page");
    oReq.open("GET", url);    
    oReq.send();
    var sourceUrl = document.querySelector("#sourceUrl");
    sourceUrl.href = targetUrl;
    sourceUrl.innerText = targetUrl + "^";
    console.log(comicDate);
  
    console.log("final url: " + url);
}

Date.prototype.yyyymmdd = function(delimiter) {
    if (delimiter === undefined){
      this.delimiter = '-'
    }
    else{
      this.delimiter = delimiter;
    }
    var mm = (this.getMonth() + 1).toString(); // getMonth() is zero-based
    var dd = this.getDate().toString();
  
    return [this.getFullYear() + this.delimiter, mm.length===2 ? '' : '0', mm + this.delimiter, dd.length===2 ? '' : '0', dd].join(''); // padding
  };