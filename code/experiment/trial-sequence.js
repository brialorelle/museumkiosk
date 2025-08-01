/* 

Handles dynamic elements of museumdraw task
Started Oct 26 2017
Last updates July 2019
*/

// 0. Load dependenciese
paper.install(window);
const socket = io.connect('/', {
    path: '/kiddraw/socket.io'
});

// 1. Setup trial order and randomize it!
const firstTrial = {"category": "this square", "video": "copy_square.mp4", "image":"images/square.png"}
const trace1 = {"category":"square", "video": "trace_square.mp4", "image":"images/square.png"}
const trace2 = {"category":"shape", "video": "trace_shape.mp4","image":"images/shape.png"}
const intro = {"category":"intro", "video": "intro.mp4","image":"images/lab_logo_stanford.png"}
const audioCheck = {"category":"audio"}
const lastTrial =  {"category": "museum", "video": "museum.mp4"}

var trialType = "drawing" //knowledge or drawing
var zorpCue = "Let's teach Zorpie about some sea creatures! Zorpie has never seen any sea creatures before!"
var zorpHello = "First, can you say 'Hi, Zorpie!'?"
var zorpTeach = "Let's teach Zorpie what we know about "

var cdmStimList = [{"category": "a crab", "video": "crab.mp4"},
    {"category": "a crocodile", "video": "crocodile.mp4"},
    {"category": "a duck", "video": "duck.mp4"},
    {"category": "a giraffe", "video": "giraffe.mp4"},
    {"category": "a lion", "video": "lion.mp4"},
    {"category": "a monkey", "video": "monkey.mp4"},
    {"category": "a panda", "video": "panda.mp4"},
    {"category": "a truck", "video": "truck.mp4"}]

var birchTutorial =  {"category": "a penguin"}
var birchStimList = [
    {"category": "a whale"},
    {"category": "a shark"},
    {"category": "a seahorse"},
    {"category": "a turtle"},
    {"category": "an octopus"},
    {"category": "a crab"},
]

var knowledgeLang = {
    "a penguin": "penguins",
    "a whale": "whales",
    "a shark": "sharks",
    "a seahorse": "seahorses",
    "a turtle": "turtles",
    "a fish": "fish",
    "an octopus": "octopuses",
    "a crab": "crabs"
}


var stimListTest = []
var curTrial=0 // global variable, trial counter
var maxTrials = stimListTest.length; 
var defaultLocation = "https://ucsdlearninglabs.org/kiddraw/"

var stimLang = {
    "this square": "this square",
    "square": "square",
    "shape": "shape",
    "a crab": "a crab",
    "a crocodile": "a crocodile",
    "a duck": "a duck",
    "a giraffe": "a giraffe",
    "a lion": "a lion",
    "a monkey": "a monkey",
    "a panda": "a panda",
    "a truck": "a truck",
    "museum": "the museum"}

var cuesLang = {
    "trace": "Can you trace the ",
    "copy": "Can you copy ",
    "draw": "Can you draw ",
    "drawEndZorp": " for Zorpie",
    "teachZorp": "Zorpie is trying to imagine [item] in his head. He's never seen [item] before! Can you help him imagine it",
    "endQuestion": " ?"
}

var checkBoxAlert = "Can we use your child's drawings? If so, please click the box above to start drawing!";
var ageAlert = "Please select your age group.";
var idAlert = "Please enter a correctly formatted ID (two letters followed by three digits)";

// set global variables
var clickedSubmit=0; // whether an image is submitted or not
var tracing = true; //whether the user is in tracing trials or not
var maxTraceTrial = 2; //the max number of tracing trials
maxTraceTrial = maxTraceTrial + 1 // add one because the intro technically gets logged as a trial
var timeLimit=30;
var disableDrawing = false; //whether touch drawing is disabled or not
var language = "English";
var strokeThresh = 3; // each stroke needs to be at least this many pixels long to be sent

// current mode and session info
var mode = "CDM";
var version ="cdm_run_v8";
var sessionId= version + Date.now().toString();
var consentPage = '#consentCDM';
var thanksPage = "#thanksPage";

// shuffle the order of drawing trials
function shuffle (a)
{
    var o = [];
    for (var i=0; i < a.length; i++) {
        o[i] = a[i];
    }
    for (var j, x, i = o.length;
         i;
         j = parseInt(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
    return o;
}

function setupStim() {
    if (mode == "birch") {
    stimListTest = shuffle(birchStimList)
    stimListTest.unshift(birchTutorial)
    } else {
        stimListTest = shuffle(cdmStimList)
    }
    stimListTest.unshift(firstTrial)
    stimListTest.unshift(trace2)
    stimListTest.unshift(trace1)
    stimListTest.unshift(intro)
    if (mode != "birch") {
        stimListTest.push(lastTrial)
    } else {
        stimListTest.splice(1, 0, audioCheck)
        maxTraceTrial = maxTraceTrial + 1 //Plus 1 to accont for the audio check trial as well.
    }
    maxTrials = stimListTest.length;
}

// for each time we start drawings
function startDrawing(){
    if (curTrial==0){
        $(consentPage).fadeOut('fast'); // fade out age screen
        showIntroVideo();  
    } else if (curTrial>0 && curTrial<maxTrials) {
        if (curTrial == maxTraceTrial){
            tracing = false
            $('#sketchpad').css('background-image','');
        }
        beginTrial()
    }
    else if (curTrial==maxTrials){
        endExperiment();
    }
}

function startTrialPostCue() {
    console.log('cue ends and trial starts');
    $(".cue").hide();
    $('#cueAudioDiv').hide();
    $("#cueGif").hide();
    setTimeout(function(){
        setUpDrawing(); // set up the drawing canvas
    }, 100);
}

function showIntroVideo(){
    if (mode != "birch") {
        var player = loadNextVideo(curTrial); // change video
        document.querySelector(".cue").innerHTML = "This game is for only one person at a time. Please draw by yourself!";
    } else {
        document.querySelector(".cue").innerHTML = zorpCue;
        document.querySelector("#audioGif").src = "zorpie/zorpie_confused.gif"
        $("#gifContainer").fadeIn()
    }
    setTimeout(function() {showCue();},250);
    if (mode != "birch") {
        setTimeout(function() {playVideo(player);},1000);
    } else {
        $("#trialContinuer").fadeIn();
    }
}

async function showAudioCheck() {
    document.querySelector(".cue").innerHTML = zorpHello;
    $(".cue").fadeIn()
    document.querySelector("#audioGif").style.maxWidth = "40vh"
    document.querySelector("#audioGif").src = "zorpie/zorpie_wave_static.gif"
    //document.querySelector("#audioGif").src = "zorpie/zorpie_wave.gif"
    $("#gifContainer").fadeIn()
    await startAudio();
    setTimeout(function() {$("#trialContinuer").fadeIn();},1000);
}

// for the start of each trial
function beginTrial(){
    //
    if (mode != "birch") {
        var player = loadNextVideo(curTrial); // change video
    }
    var categoryKey = stimListTest[curTrial].category;
    var categoryName = stimLang[categoryKey] || categoryKey;  
    var knowledgeName =  knowledgeLang[categoryKey] || categoryKey;
    if (tracing){
        document.querySelector("#audioGif").src = "zorpie/zorpie_happy.gif"
        var traceCue = cuesLang["trace"]  + categoryName;
        document.querySelector(".cue").innerHTML = traceCue;
        document.getElementById("drawingCue").innerHTML = traceCue;
    }else {
        if (stimListTest[curTrial].category == 'this square'){
            var circleCue = cuesLang["copy"]  + categoryName;
            document.querySelector(".cue").innerHTML = circleCue;
            document.getElementById("drawingCue").innerHTML = circleCue;
        } else{
            // show knowledge cue
            document.getElementById("drawingCue").innerHTML = categoryName; // change drawing cue
            if (trialType == "drawing") {
                document.querySelector(".cue").innerHTML = cuesLang["draw"] + categoryName; // change cue
                document.querySelector(".cue").style.fontSize = "5vw"
            } else {
                document.querySelector(".cue").innerHTML = cuesLang["teachZorp"].replaceAll("[item]", categoryName) + cuesLang["endQuestion"];
                document.querySelector(".cue").style.fontSize = "4vw"
                document.querySelector("#audioGif").src = "zorpie/zorpie_happy.gif"
                document.getElementById("knowledgeCue").innerHTML = categoryName; 
            }
            if (categoryName == "a penguin") {
                document.querySelector(".cue").innerHTML = document.querySelector(".cue").innerHTML.replaceAll("you", "we")
            }
        }
    }
    let currCue = document.querySelector(".cue").innerHTML
    if (mode != "birch") {
        document.querySelector(".cue").innerHTML = currCue + cuesLang["endQuestion"];
    } else if (trialType == "drawing") {
        document.querySelector(".cue").innerHTML = currCue + cuesLang["drawEndZorp"] + cuesLang["endQuestion"];
    }
    setTimeout(function() {showCue();},1000);
    if (mode != "birch") {
        setTimeout(function() {playVideo(player);},1000);
    } 
}

// show cue without drawing canvas
function showCue() {
    $('#mainExp').fadeIn('fast'); // fade in exp
    $('.cue').fadeIn('fast'); // text cue associated with trial
    if (mode == "birch") {
        $('#cueVideoDiv').hide()
        $("#trialContinuer").fadeIn('fast');
        $("#gifContainer").fadeIn('fast')
    }
}

async function fullKnowledgeSetup() {
    $('.cue').hide()
    $('#knowledge').fadeIn()
    gifID = ".knowledgeZorpie"
    await startAudio();
    monitorProgress();
}

function fullDrawingSetup() {
    $('#cueVideoDiv').fadeOut();
    setTimeout(function(){
        $('.cue').hide(); // fade out cue
        if (curTrial==0 || (curTrial == 1 & mode == 'birch')) { // after intro
            console.log('starting first trial')
            curTrial = curTrial + 1
            setTimeout(function() {beginTrial()}, 250);  /// start trial sequence after intro trial
        }
        else{ /// if not on introductory trial
            setUpDrawing(); // set up the drawing canvas
        }
        $("#cueVideoDiv").html("<video id='cueVideo' class='video-js' playsinline> </video>");
    }, 125);
}
// video player functions
function playVideo(player){
    $('#cueVideoDiv').fadeIn(); // show video div
    player.ready(function(){ // need to wait until video is ready
        this.play();
        this.on('ended',function(){
            console.log('video ends and drawing starts');
            player.dispose(); //dispose the old video and related eventlistener. Add a new video
            fullDrawingSetup()
        });
    });
}

function loadNextVideo(){
    var player=videojs('cueVideo',{
        "controls": false,
        "preload":"auto"
    });
    player.pause();
    player.volume(1); // set volume to max 
    console.log(stimListTest[curTrial].video)
    player.src({ type: "video/mp4", src: "videos_smaller/" + stimListTest[curTrial].video });
    player.load();
    return player;
}

function setUpDrawing(){
    var imgSize = "80%";
    disableDrawing = false;
    $('#sketchpad').css({"background": "", "opacity":""});

    if (tracing){
        //for all tracing trials, show the tracing image on the canvas
        var imageurl = "url('" + stimListTest[curTrial].image + "')";
        $('#sketchpad').css("background-image", imageurl)
            .css("background-size",imgSize)
            .css("background-repeat", "no-repeat")
            .css("background-position","center center");
        $("#submit_div").show();
        $("#lastTrial").hide();

    }else if(stimListTest[curTrial].category == 'this square'){
        //for the circle trial, show the circle image for 1s and hide it.
        var imageurl = "url('" + stimListTest[curTrial].image + "')";
        $('#sketchpad').css("background-image", imageurl)
            .css("background-size",imgSize)
            .css("background-repeat", "no-repeat")
            .css("background-position","center center");

        setTimeout(function () {
            $('#sketchpad').css("background-image", "");
        }, 1000);

    }else if(curTrial == maxTrials-1){
        $("#submit_div").hide();
        $("#lastTrial").show();
    }

    $('#drawing').fadeIn()
    monitorProgress(); // start the timeout functino
};

function monitorProgress(){
    clickedSubmit=0;
    $(".progress").fadeIn();
    startTrialTime=Date.now()
    console.log('starting monitoring')
    progress(timeLimit, timeLimit, $('.progress')); // show progress bar
    $('.progress-bar').attr('aria-valuemax',timeLimit);
    $('.progress').show(); // don't show progress bar until we start monitorung
};

//  monitors the progress and changes the js elements associated with timeout bar
function progress(timeleft, timetotal, $element) {
    var progressBarWidth = timeleft * $element.width()/ timetotal;
    var totalBarWidth = $element.width();
    $element.find('.progress-bar').attr("aria-valuenow", timeleft).text(timeleft)
    $element.find('.progress-bar').animate({ width: progressBarWidth }, timeleft == timetotal ? 0 : 1000, "linear");
    console.log("clicked submit = " + clickedSubmit)
    console.log("time left = " + timeleft)

    if(timeleft > 0 & clickedSubmit==0) {
        setTimeout(function() {
            progress(timeleft - 1, timetotal, $element);
        }, 1000);
    }
    else if(timeleft == 0 & clickedSubmit==0){
        console.log("trial timed out")
        if(curTrial == maxTrials-1){
            $('.endGame').addClass('bounce')
        }else if (trialType == "drawing") {
            $('#keepGoing').addClass('bounce')
        }else {
            $('#keepGoingToDrawing').addClass('bounce')
        }
        let currentTrial = curTrial
        if (trialType == "drawing") {
            setTimeout(function () {
                // if the participant is still on the current trial
                if (timeleft == 0 & clickedSubmit == 0 & trialType == "drawing" & currentTrial == curTrial) {
                    console.log("graying out")
                    increaseTrial();
                    clickedSubmit = 1 // it's as if we clicked submit
                    disableDrawing = true // can't draw after trial timed out
                    $("#sketchpad").css({"background":"linear-gradient(#17a2b81f, #17a2b81f)", "opacity":"0.5"});    
                }
            }, 10000)
        }
        return; //  get out of here
    }
    else if (clickedSubmit==1){
        console.log("exiting out of progress function")
        $element.find('.progress-bar').width(totalBarWidth)
        return; //  get out of here, data being saved by other button
    }
};

function modeSpecificIDs() {
    let current_data = {}
    if (mode != "birch") {
        var age = $('.active').attr('id');
        current_data = {
            age: age
        }
    } else {
        var id = $("#participantID").val().trim();
        current_data = {
            participantID: id
        }
    }
    return current_data
}

async function saveAudioData() {
    console.log("Saving audio data")
    console.log(audioChunks)
    if (!audioChunks || audioChunks.length === 0) {
        console.warn("No audio data to save.");
    }
    const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
  // Convert to Base64
  let dataURL = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(audioBlob);
  });
  dataURL = dataURL.split(",")[1]
     // get critical trial variables
     var category = stimListTest[curTrial].category;
     current_data = modeSpecificIDs()
     // test stirng
     readable_date = new Date();
     current_data = {
                 dataType: 'knowledge',
                 sessionId: sessionId, // each child
                 audioData: dataURL,
                 category: category, // drawing category
                 dbname:'kiddraw',
                 colname: version, 
                 location: mode,
                 trialNum: curTrial,
                 endTrialTime: Date.now(), // when trial was complete, e.g., now
                 startTrialTime: startTrialTime, // when trial started, global variable
                 date: readable_date,
                 ...current_data};
    const jsonStr = JSON.stringify(current_data);
    console.log('Payload size:', new TextEncoder().encode(jsonStr).length, 'bytes');                 
     // send data to server to write to database
    await writeDataToMongo(current_data)
}

// saving data functions
function saveSketchData(){
    // saves data at the end of trial

    // downsamplesketchpad before saveing
    var canvas = document.getElementById("sketchpad"),
        ctx=canvas.getContext("2d");


    tmpCanvas = document.createElement("canvas");
    tmpCanvas.width=150;
    tmpCanvas.height=150;
    destCtx = tmpCanvas.getContext('2d');
    destCtx.drawImage(canvas, 0,0,150,150)

    var dataURL = tmpCanvas.toDataURL();
    dataURL = dataURL.replace('data:image/png;base64,','');

    // get critical trial variables
    var category = stimListTest[curTrial].category;
    current_data = modeSpecificIDs()
    // test stirng
    readable_date = new Date();
    current_data = {
                dataType: 'finalImage',
                sessionId: sessionId, // each child
                imgData: dataURL,
                category: category, // drawing category
                dbname:'kiddraw',
                colname: version, 
                location: mode,
                trialNum: curTrial,
                endTrialTime: Date.now(), // when trial was complete, e.g., now
                startTrialTime: startTrialTime, // when trial started, global variable
                date: readable_date,
                ...current_data};

    // send data to server to write to database
    socket.emit('current_data', current_data);
};


function setLanguage(lang){
    //If the user choose other langauges
    var filename = "language/"+lang +".json";
    $.getJSON(filename, function( data ) {
        $.each( data, function( key, val ) {
            var id = "#" + key;
            $(id).text(val);
        });
        checkBoxAlert = data["checkBoxAlert"];
        ageAlert = data["ageAlert"];
    });
}

// experiment navigation functions
function showConsentPage(){
    $("#landingPage").hide();
    $('#parentEmail').val('');
    $('#email-form').show();
    $('#emailSent').hide();
    $(consentPage).fadeIn();
}

function restartExperiment() {
   
   current_data = modeSpecificIDs()
   // send survey participation data
   var parent_drew = document.getElementById("survey_parent").checked
   var child_drew = document.getElementById("survey_child").checked
   var other_drew = document.getElementById("survey_else").checked

   current_data = {
   				parent_drew: parent_drew,
   				child_drew: child_drew,
   				other_drew: other_drew,
                dataType: 'survey',
                sessionId: sessionId, // each child
                dbname:'kiddraw',
                colname: version, 
                location: mode,
                date: readable_date,
                ...current_data};

    // send data to server to write to database
    socket.emit('current_data', current_data);
    console.log('sending survey data')
    window.location.href = defaultLocation;
    
}

function endExperiment(){
    $('#drawing').hide();
    $("#knowledge").hide();
    $(".progress").hide();
    document.querySelector(".cue").innerHTML = "Good job! You're all done!"
    $(".cue").fadeIn('fast');
    document.querySelector("#audioGif").style.maxWidth = "70vh";
    document.querySelector("#audioGif").src = "zorpie/zorpie_stars.gif"
    $("#gifContainer").fadeIn('fast');
    setTimeout(function() {
        $('#mainExp').hide();
        $(thanksPage).show();
    curTrial = -1;
    // wait for 1min and restart entire experiment
    setTimeout(function(){
        if(curTrial == -1) {
            console.log("restart after 60 seconds");
            restartExperiment()
        }
    }, 60000);
    }, 6000) 
}

function increaseTrial(){
    saveSketchData() // save first!
    curTrial=curTrial+1; // increase trial counter
}


//////////////////////////////////////////////////////////////////////////////

window.onload = function() {
    $.get("/kiddraw/mode", function(data){
        mode = data.mode;
        fetch(window.location.href).then(res => {
            let header_mode = res.headers.get('X-App-Mode');
            if (header_mode) {
                console.log("Client mode:", header_mode);
                mode = header_mode
            }
            if(mode=='Bing') {
                consentPage = '#consentBing';
                thanksPage = "#thanksBing";
                console.log(" mode Bing")
            }else if(mode=="CDM"){
                consentPage = '#consentCDM';
                thanksPage = "#thanksPage";
                console.log("mode CDM")
            } else if(mode == "birch"){
                document.querySelector('#landingPage .logo-text').textContent = "Visual Learning Lab";
                defaultLocation = "https://ucsdlearninglabs.org/kiddraw?mode=birch"
                consentPage = '#consentBirch';
                thanksPage = "#thanksBirch";
                version = "birch_run_v1"
                //$('.cue').attr('id', 'audioCue');
            }
            setupStim();
        });
    });
    

    /////////////// GENERAL BUTTON FUNCTIONS ///////////////
    document.ontouchmove = function(event){
        event.preventDefault();
    }

    $('#startConsent').bind('touchstart mousedown',function(e) {
        e.preventDefault();
        showConsentPage();
    });

    $('.langButton').bind('touchstart mousedown',function(e) {
        e.preventDefault()
        language = $(this).attr('id');
        setLanguage(language);
        $("#langChosen").text($(this).text());
        $("#langDrop").removeClass("show");
    });

    $('.startExp').bind('touchstart mousedown',function (e) {
        e.preventDefault()
        console.log('touched start button');

        if (mode == "Bing"){
            console.log("Bing");

            if ($("#firstName").val().trim().length==0 ) {
                alert("Please enter your first name.");
            }else if($("#lastName").val().trim().length==0){
                alert("Please enter your last name.");
            }else{
                startDrawing();
            }

        }else if (mode == "CDM"){
            console.log("CDM");
            console.log(mode)
            if ((!$("#checkConsent").is(':checked'))) {
                alert(checkBoxAlert)
            }else if($(".active").val()==undefined){
                alert(ageAlert)
            }
            else {
                startDrawing();
            }
        } else {
            console.log("Birch")
            var id = $("#participantID").val().trim();
            if (id === "" || !/^[A-Za-z]{2}\d{3}$/.test(id)) {
                alert(idAlert);
            } else {
                startDrawing()
            }
        }

    });

    // if child presses the "lets keep drawing" button....e.g.,  the SUBMIT button
    $('#keepGoing').bind('touchstart mousedown',function(e) {
        e.preventDefault()
        $('#keepGoing').removeClass('bounce')
        if (mode == "birch" && !tracing){ 
            trialType = "knowledge"
        }
        console.log('touched next trial button');
        if(clickedSubmit==0){// if the current trial has not timed out yet
            clickedSubmit=1; // indicate that we submitted - global variable
            increaseTrial(); // save data and increase trial counter
        }

        $('#drawing').hide(); // hide the canvas
        $(".progress").hide();
        project.activeLayer.removeChildren(); // clear the canvas
        startDrawing(); // start the new trial
    });

    $('#keepGoingToDrawing').bind('touchstart mousedown',async function(e) {
        e.preventDefault()
        $(".knowledgeButton").hide()
        $(".progress").hide();
        $(".knowledgeZorpie").attr("src", "zorpie/zorpie_stars.gif");
        console.log('touched next trial button after knowledge task');
        if (clickedSubmit == 0) {
            clickedSubmit=1;// if the current trial has not timed out yet
            await saveAudioData();// indicate that we submitted - global variable
        }
        trialType = "drawing"
        setTimeout(async function() {
            await stopAudio();
        setTimeout(function() {
            $('#keepGoingToDrawing').removeClass('bounce')
        
            $('#knowledge').hide(); // hide the canvas
            $('.knowledgeButton').fadeIn()
            startDrawing();
        }, 2000);
        }, 500)
    
    });

    $('.submitCue').bind('touchstart mousedown', async function(e) {
        e.preventDefault()
        $("#trialContinuer").fadeOut('fast');
        $("#gifContainer").fadeOut('fast');
        $(".cue").fadeOut('fast');
        await stopAudio()
        if (curTrial == 0 && mode == 'birch') {
            curTrial = curTrial + 1;
            setTimeout(async function() {await showAudioCheck()}, 150);
        } else if (trialType == "drawing") {
            setTimeout(function() {fullDrawingSetup()}, 150);
        } else {
            document.querySelector(".knowledgeZorpie").src = "zorpie/zorpie_happy_static.gif"
            setTimeout(function() {fullKnowledgeSetup()}, 150);
        } 
    });

    $('.allDone').bind('touchstart mousedown',function(e) {
        e.preventDefault()
        // if (isDoubleClicked($(this))) return;

        console.log('touched endExperiment  button');
        if(clickedSubmit==0){// if the current trial has not timed out yet
            clickedSubmit=1; // indicate that we submitted - global variable
            increaseTrial(); // save data and increase trial counter
        }
        //$('#mainExp').hide();
        $('#keepGoing').removeClass('bounce')
        endExperiment();

    });

    // last "end" button after child has completed all trials
    $('.endRestart').bind('touchstart mousedown',function(e){
        e.preventDefault()
        console.log('restart to the landing page')
        restartExperiment()
    });


    // email sending function
    $('#sendEmail').bind('touchstart mousedown',function(e){
        e.preventDefault()
        var email = $('#parentEmail').val()
        $.get("/send", {email:email}, function(data){
            if(data=="sent"){
                $('#email-form').hide()
                $('#emailSent').show()
            }else{
                alert('invalid email')
            }
        });
    });

    // for toggling between age b uttons
    $('.ageButton').bind('touchstart mousedown',function(e){
        e.preventDefault()
        $('.ageButton').removeClass('active')
        $(this).addClass('active')
    });

    /////////////// DRAWING PARAMETERS AND FUNCTIONS ///////////////
    var canvas = document.getElementById("sketchpad"),
        ctx=canvas.getContext("2d");
    //landscape mode 00 inne
    if (window.innerWidth > window.innerHeight){
        canvas.height = window.innerWidth*.625;
        canvas.width = canvas.height;
    }
    // portrait mode -- resize to height
    else if(window.innerWidth < window.innerHeight){ 
        canvas.height = window.innerHeight*.70;;
        canvas.width = canvas.height;
    }  


    // Initialize paper.js
    paper.setup('sketchpad');

    // Each time we send a stroke...
    function sendStrokeData(path) {
        path.selected = false

        var svgString = path.exportSVG({asString: true});
        var category = stimListTest[curTrial].category;
        var readable_date = new Date();
        stroke_data = modeSpecificIDs()
        
        console.log('time since we started the trial')
        console.log(endStrokeTime - startTrialTime)
        console.log("time of this stroke")
        console.log(endStrokeTime - startStrokeTime)

        stroke_data = {
            dataType: 'stroke',
            sessionId: sessionId,
            svg: svgString,
            category: category,
            dbname:'kiddraw',
            colname: version,
            location: mode,
            trialNum: curTrial,
            startTrialTime: startTrialTime,
            startStrokeTime: startStrokeTime,
            endStrokeTime: endStrokeTime,
            date: readable_date,
            ...stroke_data};

        // send stroke data to server
        console.log(stroke_data)
        socket.emit('stroke',stroke_data);
        
    }

    ///////////// TOUCH EVENT LISTENERS DEFINED HERE ///////////////

    function touchStart(ev) {
        if(disableDrawing){
            return;
        }

        startStrokeTime = Date.now()
        console.log("touch start");
        touches = ev.touches;
        if (touches.length>1){
            return; // don't do anything when simultaneous -- get out of this function
            console.log("detedcted multiple touches")
        }
        
        // Create new path 
        path = new Path();
        path.strokeColor = 'black';
        path.strokeCap = 'round'
        path.strokeWidth = 10;
        
        // add point to path
        var point = view.getEventPoint(ev); // should only ever be one
        path.add(point);
        view.draw();
    }

    function touchMove(ev) {
        if(disableDrawing){
            return;
        }
        //console.log("touch move");

        // don't do anything when simultaneous touches
        var touches = ev.touches;
        if (touches.length>1){
            return; 
        }
        // add point to path
        var point = view.getEventPoint(ev); 
        path.add(point);
        view.draw();
    }

    function touchEnd(ev){
        if(disableDrawing){
            return;
        }
	// get stroke end time
        endStrokeTime = Date.now();
        console.log("touch end");  

        // simplify path
        //console.log("raw path: ", path.exportSVG({asString: true}));        
        path.simplify(3);
        path.flatten(1);
        //console.log("simpler path: ", path.exportSVG({asString: true}));

        // only send data if above some minimum stroke length threshold      
        //console.log('path length = ',path.length);
        var currStrokeLength = path.length;
        if (currStrokeLength > strokeThresh) {
            sendStrokeData(path);
           }

    }

    targetSketch = document.getElementById("sketchpad");
    targetSketch.addEventListener('touchstart', touchStart, false);
    targetSketch.addEventListener('touchmove', touchMove, false);
    targetSketch.addEventListener('touchend', touchEnd, false);

    // Refresh if no user activities in 60 seconds
    var time = new Date().getTime();
    $(document.body).bind("touchstart touchmove touchend click", function(e) {
        time = new Date().getTime();
    });

    var refreshTime = 120000
    function refresh() {
        if (new Date().getTime() - time >= refreshTime) {
                window.location.href=defaultLocation
                console.log("No user activities. Reload.")
        } else {
            setTimeout(refresh, refreshTime);
        }

    }

    setTimeout(refresh, refreshTime);



} // on document load

 /////////////// AUDIO PARAMETERS AND FUNCTIONS ///////////////
 let audioChunks = [];
 let mediaRecorder;
 let analyzer, dataArray, audioContext;
 let audioStillGoing = true;
 let staticGifTimeout = null;
 let lastBarWidth = 0;
 let gifID = "#audioGif"

 async function setupAudio() {
     const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
     mediaRecorder = new MediaRecorder(stream);
     audioChunks = [];
     mediaRecorder.ondataavailable = (event) => {
         audioChunks.push(event.data);
         console.log(audioChunks)
     };
     audioContext = new AudioContext();
     const source = audioContext.createMediaStreamSource(stream);
     analyzer = audioContext.createAnalyser();
     analyzer.fftSize = 512;
     dataArray = new Uint8Array(analyzer.frequencyBinCount);
     source.connect(analyzer);
     detectSound();
 } 

 function detectSound() {
     analyzer.getByteTimeDomainData(dataArray);
     let sum = 0;
     for (let i = 0; i < dataArray.length; i++) {
       const val = dataArray[i] - 128;
       sum += val * val;
     }
     const volume = Math.sqrt(sum / dataArray.length);
     const volumeBar = document.querySelector("#volumeBar");
     const gifEl = document.querySelector(gifID);
     if (volume > 8 && !gifEl.src.includes("stars")) { // stars indicates that trial is over but data is still being saved
       console.log('🎙️ Sound Detected!');
       if (gifEl.src.includes("_static")) {
        gifEl.src = gifEl.src.replace("_static", "");
         }
        clearTimeout(staticGifTimeout);
            staticGifTimeout = setTimeout(() => {
                if (!gifEl.src.includes("stars")) {
                    gifEl.src = gifEl.src.replace(/\.gif$/, "_static.gif");
                }
            staticGifTimeout = null;
          }, 2000);
     } 
     const newBarWidth = Math.min(100, Math.round(volume * 3));
     const diff = Math.abs(newBarWidth - lastBarWidth);
     if (diff >= 10) {
        volumeBar.style.width = `${newBarWidth}%`;
        lastBarWidth = newBarWidth;
     }
     if (audioStillGoing) {
        requestAnimationFrame(detectSound);
     }
   }

 async function startAudio() {
    $("#volumeMeter").fadeIn()
    audioStillGoing = true;
    gifTimeout = null;
     await setupAudio();
     mediaRecorder.start(1000);
 }

 async function stopAudio() {
    $("#volumeMeter").fadeOut()
    audioStillGoing = false;
    if (mediaRecorder) {
        console.log("stopped audio")
        mediaRecorder.stop();
        console.log(audioChunks)
    }
 }
 const writeDataToMongo = async function(data) {
    try {
        const res = await fetch('/api/db/insert', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        const body = await res.text(); // or res.json() if expecting JSON

        if (res.ok) {
            console.log(`sent data to store`);
        } else {
            console.log(`error sending data to store: ${res.status} ${body}`);
        }
    } catch (error) {
        console.log(`network error: ${error}`);
    }
};




