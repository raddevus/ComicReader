var oReq = new XMLHttpRequest();
var apiReq = new XMLHttpRequest();
var apiSaveReq = new XMLHttpRequest();
var apiSaveFavsReq = new XMLHttpRequest();
var apiGetFavsReq = new XMLHttpRequest();
var allFavs = [];

var apiTargetUrl = "https://newlibre.com/LibreApi/ComicDate/"
var apiGetDates = "GetAllComicDates?OwnerId=";
var apiSaveDates = "SaveAllComicDates?comics=";
var apiGetFavs = "GetAllComicFavorites?OwnerId=";
var apiSaveFavs = "SaveAllComicFavorites?OwnerId=";
var favQueryString = "&favs=";
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
apiReq.addEventListener("load", apiReqComplete);
apiReq.addEventListener("error", apiReqFailed);
apiSaveReq.addEventListener("load", apiSaveReqComplete);
apiSaveReq.addEventListener("error", apiSaveReqFailed);
apiSaveFavsReq.addEventListener("load", apiSaveFavsComplete);
apiSaveFavsReq.addEventListener("error", apiSaveFavsFailed);
apiGetFavsReq.addEventListener("load",apiGetFavsComplete);
apiGetFavsReq.addEventListener("error", apiGetFavsFailed);

function transferComplete(evt) {
  console.log("The transfer is complete.");
  console.log(evt);
  // oReq.response contains the entire comic web page
  console.log(oReq.response);
  
  displayImage();
}

function apiReqComplete(evt){
  console.log("API request succeeded.");
  loadDatesFromApiData();
  getFavsFromApi();
}

function apiSaveReqComplete(evt){
    console.log("API Save Req succeeded.");
    console.log(apiSaveReq.response);
    document.querySelector("#message").innerText = "Dates were successfully saved.";
    startClearMessageTimer();
}

function apiSaveFavsComplete(evt){
  console.log("save favs successfully completed.")
  console.log(apiSaveFavsReq.response);
}

function apiGetFavsComplete(evt){
  console.log("get favs successfully completed.")
  console.log(apiGetFavsReq.response);
  allFavs = JSON.parse(apiGetFavsReq.response);
  if (allFavs == ""){
    allFavs = [];
  }
  populateFavsDropList();
}

function startClearMessageTimer(){
  setTimeout(clearMessage,4000);
}

function clearMessage(){
  document.querySelector("#message").innerText = "";
}

function populateFavsDropList(){
  document.querySelector("#favorites").options.length = 0;
  var empty = {};
  empty.ComicUrl = "";
  empty.Note = "";
  insertFavorite(empty); // first one created as an empty selection
  for (var x = 0;x < allFavs.length;x++){
      insertFavorite(allFavs[x]);
  }
}

function insertFavorite(fav){
  var favControl = document.querySelector("#favorites");
  var currentHref = fav.ComicUrl;
  console.log("fav text : " + currentHref + "~" + atob(fav.Note));
  var opt = document.createElement('option');
    opt.value = currentHref + "~" + atob(fav.Note);
    opt.innerHTML = currentHref;
  favControl.appendChild(opt);
}

function addNewFavorite(){
  var favNotesCtrl = document.querySelector("#favNotes");
  var favDropList = document.querySelector("#favorites");
  if (favDropList.value != "~" && favDropList.value != ""){
    alert("To add a new favorite, please choose empty Fav from droplist and try again.");
    return;
  }
  console.log("#1 ");
  var newFav = {};
  newFav.ComicUrl = document.querySelector("#sourceUrl").href;
  if (document.querySelector("#sourceUrl").innerText == ""){
    alert("Please load a comic and then try to save your favorite.")
    return;
  }
  console.log(newFav.ComicUrl);
  var favNoteInput = document.querySelector("#favNotes");
  newFav.Note = btoa(favNoteInput.value);
  newFav.Created = new Date().yyyymmdd();
  if (newFav.Note == ""){
    var result = confirm("Are you sure you want to save the fav without a note?\[OK] for Yes");
    if (result){
      insertFavorite(newFav);
      allFavs.push(newFav);
      saveFavsViaApi();
      // empty out the text since there was a successful add
      favNoteInput.value = "";
    }
    else{
      return;
    }
  }
  else{
    insertFavorite(newFav);
    console.log("allFavs - ");
    console.log(allFavs);
    if (allFavs.error !== undefined){
      allFavs = [];
    }
    allFavs.push(newFav);
    saveFavsViaApi();
    // empty out the text since there was a successful add
    favNoteInput.value = "";
  }

}

function loadDatesFromApiData(){
    var comicDates = JSON.parse(apiReq.response);
    console.log(comicDates);
    for (var x=0; x < comicDates.length;x++){
      console.log(comicDates[x]);
      console.log(comicDates[x].ComicDateName + " : " + comicDates[x].DateString);
      localStorage.setItem(comicDates[x].ComicDateName,comicDates[x].DateString);
    }
    saveCurrentRadio();
    document.querySelector("#message").innerText = "Dates were successfully loaded.";
    startClearMessageTimer();
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

function getComicDatesFromApi(){
    
    var apiOwnerId = document.querySelector("#ownerId").value;
    if (apiOwnerId == ""){
      alert("Please provide a value for OwnerId.");
      return;
    }
    var testUrl = 'http://uncoveryourlife.com/temp/GrabIt.aspx/?url=' + apiTargetUrl + apiGetDates + apiOwnerId;
    var prodUrl = apiTargetUrl + apiGetDates + apiOwnerId;
    
    console.log("calling API");
    //apiReq.open("GET", testUrl);
    apiReq.open("GET", prodUrl);
    apiReq.send();
}

function getFavsFromApi(){
  var ownerId = document.querySelector("#ownerId").value;
    var testUrl = 'http://uncoveryourlife.com/temp/GrabIt.aspx?url=' + apiTargetUrl + apiGetFavs + ownerId;
    console.log(testUrl);
    var prodUrl = apiTargetUrl + apiGetFavs + ownerId;
    //apiGetFavsReq.open("GET",testUrl);
    apiGetFavsReq.open("GET",prodUrl);
    apiGetFavsReq.send();
}

function saveFavsViaApi(){
    var ownerId = document.querySelector("#ownerId").value;
    var favsQueryStringVal = JSON.stringify(allFavs);
    var testUrl = 'http://uncoveryourlife.com/temp/GrabIt.aspx?url=' + apiTargetUrl + apiSaveFavs + ownerId + favQueryString + favsQueryStringVal;
    console.log(testUrl);
    var prodUrl = apiTargetUrl + apiSaveFavs + ownerId + favQueryString + favsQueryStringVal;
    //apiSaveFavsReq.open("GET",testUrl);
    apiSaveFavsReq.open("GET",prodUrl);
    apiSaveFavsReq.send();
}

function generateComicDateJson(ownerId){
  var allComicDates = [];
  var ComicDateTemplate = {};
  //1.
  ComicDateTemplate.ComicDateName = "currentDate";
  ComicDateTemplate.DateString = localStorage.getItem("currentDate");
  ComicDateTemplate.OwnerId = ownerId;
  allComicDates.push(ComicDateTemplate);
  //2. 
  ComicDateTemplate = {};
  ComicDateTemplate.ComicDateName = "currentPearlsDate";
  ComicDateTemplate.DateString = localStorage.getItem("currentPearlsDate");
  ComicDateTemplate.OwnerId = ownerId;
  allComicDates.push(ComicDateTemplate);
  //3. 
  ComicDateTemplate = {};
  ComicDateTemplate.ComicDateName = "currentGarfieldDate";
  ComicDateTemplate.DateString = localStorage.getItem("currentGarfieldDate");
  ComicDateTemplate.OwnerId = ownerId;
  allComicDates.push(ComicDateTemplate);
  //4.
  ComicDateTemplate = {};
  ComicDateTemplate.ComicDateName = "currentCalvinDate";
  ComicDateTemplate.DateString = localStorage.getItem("currentCalvinDate");
  ComicDateTemplate.OwnerId = ownerId;
  allComicDates.push(ComicDateTemplate);
  return JSON.stringify(allComicDates);
}

function saveComicDatesViaApi(){
    var apiOwnerId = document.querySelector("#ownerId").value;
    if (apiOwnerId == ""){
      alert("Please provide a value for OwnerId.");
      return;
    }
    var comicDatesJson = generateComicDateJson(apiOwnerId);
    var testUrl = 'http://uncoveryourlife.com/temp/GrabIt.aspx/?url=' + apiTargetUrl + apiSaveDates + comicDatesJson;
    var prodUrl = apiTargetUrl + apiSaveDates + comicDatesJson;
    console.log("calling API");
    //apiSaveReq.open("GET", testUrl);
    apiSaveReq.open("GET", prodUrl);
    apiSaveReq.send();
}

function resizeImage(){
  initClientSize();
  displayImage();
}

function initClientSize(){
  clientWidth = document.querySelector("body").clientWidth;
}

function initApp(){
  // have to add touch event on button otherwise the button does not work on mobile 
  // FYI - mobile includes amazon Silk browser found on TV and pads.
  document.querySelector("#loadComicDatesButton").addEventListener("touchstart",getComicDatesFromApi);
  document.querySelector("#saveComicDatesButton").addEventListener("touchstart",saveComicDatesViaApi);
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

function apiReqFailed(evt){
  console.log("Failed on API request.");
}

function apiSaveReqFailed(evt){
  console.log("Failed on API request.");
}

function apiSaveFavsFailed(){
  console.log("SaveFavs Failed on API request.");
}

function apiGetFavsFailed(){
  console.log("GetFavs Failed on API request.");
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

function navigateToFavorite(){
  var navUrl = document.querySelector("#favorites").value.split("~")[0];
  console.log(navUrl);
  if (navUrl != ""){
    window.open(navUrl, "_blank");
  }
  else{
    alert("Please select a favorite and try again.");
  }
}

function updateFavNotes(){
  var favNoteInput = document.querySelector("#favNotes");
  var notes = document.querySelector("#favorites").value.split("~")[1];
  favNoteInput.value = notes;
  //favNoteInput.value
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