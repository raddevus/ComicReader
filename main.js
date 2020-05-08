var oReq = new XMLHttpRequest();
var clientWidth = 0;
var isDilbert = false;
const DILBERT = "dilbert";
const DILBERT_DATE_ID = "currentDate";
const PEARLS = "pearls";
const PEARLS_DATE_ID = "currentPearlsDate";
const GARFIELD = "garfield";
const GARFIELD_DATE_ID = "currentGarfieldDate";
const CALVIN = "calvin";
const CALVIN_DATE_ID = "currentCalvinDate";

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
    default:{
      //PEARLS, GARFIELD, CALVIN & HOBBES,
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
  initOriginalComicDates();
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
    case CALVIN:{
      document.querySelector("#calvinRadio").checked = true;
      initDate(CALVIN_DATE_ID);
      break;
    }
  }
}

function initOriginalComicDates(){
  // ################################
  // This method initializes dates to first comic of each specific comic
  // so user can begin reading first comic ever produced.  It only sets 
  // dates if hte user hasn't already saved them in localstorage

  if (localStorage.getItem(DILBERT_DATE_ID) === null){
    localStorage.setItem(DILBERT_DATE_ID, "1989-04-15");
  }
  if (localStorage.getItem(PEARLS_DATE_ID) === null){
    localStorage.setItem(PEARLS_DATE_ID, "2002-01-06");
  }
  if (localStorage.getItem(GARFIELD_DATE_ID) === null){
    localStorage.setItem(GARFIELD_DATE_ID, "1978-06-18");
  }
  if (localStorage.getItem(CALVIN_DATE_ID) === null){
    localStorage.setItem(CALVIN_DATE_ID, "1985-11-17");
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
    if (document.querySelector("#calvinRadio").checked){
      comicName = CALVIN;
      initDate(CALVIN_DATE_ID);
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
        break;
      }
      case PEARLS:{
        targetUrl = 'https://www.gocomics.com/pearlsbeforeswine/' + comicDate.yyyymmdd('/');
        localStorage.setItem("currentPearlsDate", comicDate.yyyymmdd());
        break;
      }
      case GARFIELD:{
        targetUrl = 'https://www.gocomics.com/garfield/' + comicDate.yyyymmdd('/');
        localStorage.setItem("currentGarfieldDate", comicDate.yyyymmdd());
        break;
      }
      case CALVIN:{
        targetUrl = 'https://www.gocomics.com/calvinandhobbes/' + comicDate.yyyymmdd('/');
        localStorage.setItem("currentCalvinDate", comicDate.yyyymmdd());
        break;
      }
    }

    document.querySelector("#x-date").value = comicDate.yyyymmdd();
    localStorage.setItem("comicName", comicName);
  
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