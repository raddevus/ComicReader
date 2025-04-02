var oReq = new XMLHttpRequest();
var apiReq = new XMLHttpRequest();
var apiSaveReq = new XMLHttpRequest();
var apiSaveFavsReq = new XMLHttpRequest();
var apiGetFavsReq = new XMLHttpRequest();
var allFavs = [];

let globalPageData;

var apiTargetUrl = "https://newlibre.com/LibreApi/ComicDate/"
var apiOwnerId = "?OwnerId="
var apiGetDates = "GetAllComicDates";
var apiSaveDates = "SaveAllComicDatesPost";
var apiGetFavs = "GetAllComicFavorites";
var apiSaveFavs = "SaveAllComicFavorites";
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
const WUMO = "wumo";
const WUMO_DATE_ID = "currentWumoDate";
const BREWSTER = "brewster";
const BREWSTER_DATE_ID = "currentBrewsterDate"
const SHERM_LAGOON = "sherm";
const SHERM_LAGOON_DATE_ID = "currentShermDate"
const BLOOM_COUNTY = "bloom";
const BLOOM_COUNTY_DATE_ID = "currentBloomDate";
const ARGYLE_SWEATER = "argyle";
const ARGYLE_SWEATER_DATE_ID = "currentArgyleDate";

var comicName = DILBERT;


oReq.addEventListener("error", transferFailed);
apiReq.addEventListener("error", apiReqFailed);
apiSaveReq.addEventListener("load", apiSaveReqComplete);
apiSaveReq.addEventListener("error", apiSaveReqFailed);
apiSaveFavsReq.addEventListener("load", apiSaveFavsComplete);
apiSaveFavsReq.addEventListener("error", apiSaveFavsFailed);
apiGetFavsReq.addEventListener("load",apiGetFavsComplete);
apiGetFavsReq.addEventListener("error", apiGetFavsFailed);


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
  empty.ImageUrl= "";
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
    opt.value = currentHref + "~" + atob(fav.Note) + "~" + fav.ImageUrl;
    opt.innerHTML = atob(fav.Note);
  favControl.appendChild(opt);
}

function addNewFavorite(){
  var favNotesCtrl = document.querySelector("#favNotes");
  var favDropList = document.querySelector("#favorites");
  if (favDropList.value != "~~"){
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
  newFav.ImageUrl = document.querySelector("#targetImg").src;
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

function loadDatesFromApiData(data){
    var comicDates = data;
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
      loadComicData("link[imageSrcSet]", 'imageSrcSet=\"');
      break;
    }
    default:{
      //PEARLS, GARFIELD, CALVIN & HOBBES, WUMO
      loadComicData("link[imageSrcSet]", 'imageSrcSet=\"');
      break;
    }
  }
  document.querySelector("#targetImg").width = clientWidth - 10;
}

function loadComicData(comicSelector,searchText){
  document.querySelector("#hidden").innerHTML = globalPageData;
  
  var allLinks = document.querySelectorAll(comicSelector);
  targetUrl = allLinks[0].imageSrcset.split(",")[0].split("?")[0];
  console.log(`targetUrl: ${targetUrl}`);
 
  document.querySelector("#targetImg").src = targetUrl;
}

function getComicDatesFromApi(){
    
    var ownerId = document.querySelector("#ownerId").value;
    if (ownerId == ""){
      alert("Please provide a value for OwnerId.");
      return;
    }
    var testUrl = 'https://newlibre.com/grabit/home/getRemote?url=' + apiTargetUrl + apiGetDates + apiOwnerId + ownerId;
    var prodUrl = apiTargetUrl + apiGetDates + apiOwnerId + ownerId;
    
    console.log("calling API");
    //apiReq.open("GET", testUrl);
    
    fetch(prodUrl)
      .then(response => response.json())
      .then(data => {
        console.log(data);
        console.log("#### got Comic Dates! ####")
        loadDatesFromApiData(data);
        getFavsFromApi();
      });

    // apiReq.open("GET", prodUrl);
    // apiReq.send();
}

function getFavsFromApi(){
  var ownerId = document.querySelector("#ownerId").value;
    var testUrl = 'https://newlibre.com/grabit/home/getRemote?url=' + apiTargetUrl + apiGetFavs + apiOwnerId + ownerId;
    console.log(testUrl);
    var prodUrl = apiTargetUrl + apiGetFavs + apiOwnerId + ownerId;
    //apiGetFavsReq.open("GET",testUrl);
    apiGetFavsReq.open("GET",prodUrl);
    apiGetFavsReq.send();
}

function saveFavsViaApi(){
  var ownerId = document.querySelector("#ownerId").value;
  var favsQueryStringVal = JSON.stringify(allFavs);
  var prodUrl = apiTargetUrl + apiSaveFavs;
  console.log(prodUrl);
  // ### FIRST PARAM CANNOT HAVE A QUESTION MARK IN FRONT OF IT!  #########
  var params = "ownerId=" + ownerId + favQueryString + favsQueryStringVal;
  console.log("params : " + params);
  var allData = "favs=" + favsQueryStringVal;
  //apiSaveFavsReq.open("GET",testUrl);
  apiSaveFavsReq.open("POST",prodUrl);
  apiSaveFavsReq.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
  apiSaveFavsReq.send(params);
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
  //5.
  ComicDateTemplate = {};
  ComicDateTemplate.ComicDateName = "currentWumoDate";
  ComicDateTemplate.DateString = localStorage.getItem("currentWumoDate");
  ComicDateTemplate.OwnerId = ownerId;
  allComicDates.push(ComicDateTemplate);

  //6.
  ComicDateTemplate = {};
  ComicDateTemplate.ComicDateName = "currentBrewsterDate";
  ComicDateTemplate.DateString = localStorage.getItem("currentBrewsterDate");
  ComicDateTemplate.OwnerId = ownerId;
  allComicDates.push(ComicDateTemplate);

  //7.
  ComicDateTemplate = {};
  ComicDateTemplate.ComicDateName = "currentShermDate";
  ComicDateTemplate.DateString = localStorage.getItem("currentShermDate");
  ComicDateTemplate.OwnerId = ownerId;
  allComicDates.push(ComicDateTemplate);

  //8.
  //BLOOM_COUNTY
  ComicDateTemplate = {};
  ComicDateTemplate.ComicDateName = "currentBloomDate";
  ComicDateTemplate.DateString = localStorage.getItem("currentBloomDate");
  ComicDateTemplate.OwnerId = ownerId;
  allComicDates.push(ComicDateTemplate);

  //9.
  //ARGYLE_SWEATER
  ComicDateTemplate = {};
  ComicDateTemplate.ComicDateName = ARGYLE_SWEATER_DATE_ID;
  ComicDateTemplate.DateString = localStorage.getItem(ARGYLE_SWEATER_DATE_ID);
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

  var prodUrl = apiTargetUrl + apiSaveDates;
  console.log("calling API");
  let formData = new FormData();
  formData.append("comics", comicDatesJson);

  fetch(prodUrl,{
    method: 'POST',
    body: formData,
  })
  .then( () => {
    console.log("API Save Req succeeded.");
    document.querySelector("#message").innerText = "Dates were successfully saved.";
    startClearMessageTimer();
  });
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
    case WUMO:{
      document.querySelector("#wumoRadio").checked = true;
      initDate(WUMO_DATE_ID);
      break;
    }
    case BREWSTER:{
      document.querySelector("#brewsterRadio").checked = true;
      initDate(BREWSTER_DATE_ID);
      break;
    }
    case SHERM_LAGOON:{
      document.querySelector("#shermRadio").checked = true;
      initDate(SHERM_LAGOON_DATE_ID);
      break;
    }
    case BLOOM_COUNTY:{
      document.querySelector("#bloomCountyRadio").checked = true;
      initDate(BLOOM_COUNTY_DATE_ID);
      break;
    }
    case ARGYLE_SWEATER:{
      document.querySelector("#argyleRadio").checked = true;
      initDate(ARGYLE_SWEATER_DATE_ID);
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
  if (localStorage.getItem(WUMO_DATE_ID) === null){
    localStorage.setItem(WUMO_DATE_ID, "2013-11-03");
  }
  if (localStorage.getItem(BREWSTER_DATE_ID) === null){
    localStorage.setItem(BREWSTER_DATE_ID, "2004-08-01");
  }
  if (localStorage.getItem(SHERM_LAGOON_DATE_ID) === null){
    localStorage.setItem(SHERM_LAGOON_DATE_ID, "2022-05-01");
  }
  if (localStorage.getItem(BLOOM_COUNTY_DATE_ID) === null){
    localStorage.setItem(BLOOM_COUNTY_DATE_ID, "1980-12-07");
  }
  if (localStorage.getItem(ARGYLE_SWEATER_DATE_ID) === null){
    localStorage.setItem(ARGYLE_SWEATER_DATE_ID, "2010-01-09");
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
    if (document.querySelector("#wumoRadio").checked){
      comicName = WUMO;
      initDate(WUMO_DATE_ID);
    }
    if (document.querySelector("#brewsterRadio").checked){
      comicName = BREWSTER;
      initDate(BREWSTER_DATE_ID);
    }
    if (document.querySelector("#shermRadio").checked){
      comicName = SHERM_LAGOON;
      initDate(SHERM_LAGOON_DATE_ID);
    }
    if (document.querySelector("#bloomCountyRadio").checked){
      comicName = BLOOM_COUNTY;
      initDate(BLOOM_COUNTY_DATE_ID);
    }
    if (document.querySelector("#argyleRadio").checked){
      comicName = ARGYLE_SWEATER;
      initDate(ARGYLE_SWEATER_DATE_ID);
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
        targetUrl = 'https://dilbert.com/strip/' + comicDate.yyyymmdd();
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
      case WUMO:{
        targetUrl = 'https://www.gocomics.com/wumo/' + comicDate.yyyymmdd('/');
        localStorage.setItem("currentWumoDate", comicDate.yyyymmdd());
        break;
      }
      case BREWSTER:{
        targetUrl = 'https://www.gocomics.com/brewsterrockit/' + comicDate.yyyymmdd('/');
        localStorage.setItem("currentBrewsterDate", comicDate.yyyymmdd());
        break;
      }
      case SHERM_LAGOON:{
        targetUrl = 'https://www.gocomics.com/shermanslagoon/' + comicDate.yyyymmdd('/');
        localStorage.setItem("currentShermDate", comicDate.yyyymmdd());
        break;
      }
      case BLOOM_COUNTY:{
        targetUrl = 'https://www.gocomics.com/bloomcounty/' + comicDate.yyyymmdd('/');
        localStorage.setItem("currentBloomDate", comicDate.yyyymmdd());
        break;
      }
      case ARGYLE_SWEATER:{
        targetUrl = 'https://www.gocomics.com/theargylesweater/' + comicDate.yyyymmdd('/');
        localStorage.setItem(ARGYLE_SWEATER_DATE_ID, comicDate.yyyymmdd());
        break;
      }
    }

    document.querySelector("#x-date").value = comicDate.yyyymmdd();
    localStorage.setItem("comicName", comicName);
    
    //var url = 'https://newlibre.com/grabit/home/getRemote?url=' + targetUrl;
    var comicData = new FormData();
    comicData.append("url",targetUrl);
    var url = "https://newlibre.com/grabit/Home/getRemote"; //?url=' + targetUrl;
    console.log("requesting page");

    fetch(targetUrl,{
            method: 'GET'
     })
      .then(response => response.text())
      .then(data => {
        console.log(data);
        console.log("#### yep, it got it ####")
        globalPageData = data;
        displayImage();
      });
    //oReq.open("GET", url);
    //oReq.send();
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
  
  if (notes !== "" && notes !== undefined){
    document.querySelector("#targetImg").src = document.querySelector("#favorites").value.split("~")[2];
  }
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
