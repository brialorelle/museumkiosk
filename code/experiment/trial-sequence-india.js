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
intro = {"category":"intro", "audio": "intro.mp3","image":"images/lab_logo_stanford.png"}
bonusPrompt =  {"category": "bonus", "audio": "bonus.mp3"}
donePrompt = {"category": "done", "audio": "good_job.mp3"}

var drawingTutorial = {"category": "tutorial", "audio": "tutorial.mp3", "gif": "videos_smaller/drawing_tutorial.gif"}

var traceList = [{"category":"line", "audio": "trace_line.mp3", "image":"images/line.png"},
    {"category":"two lines", "audio": "trace_two_lines.mp3", "image":"images/two_lines.png"},
    {"category":"three lines", "audio": "trace_three_lines.mp3", "image":"images/three_lines.png"},
    {"category":"square", "audio": "trace_four_lines.mp3", "image":"images/square.png"},
    {"category":"circle", "audio": "trace_circle.mp3", "image":"images/circle.png"},
    {"category":"shape", "audio": "trace_shapes.mp3","image":"images/shape.png"},
    {"category":"shapes", "audio": "trace_shapes.mp3", "image":"images/square_circle.png"}
]
var readable_date;
var stimListTestTD = [
    {"category": "an airplane", "audio": "airplane.mp3"},
    {"category": "a bike", "audio": "bike.mp3"},
    {"category": "a car", "audio": "car.mp3"},
    {"category": "a chair", "audio": "chair.mp3"},
    {"category": "a watch", "audio": "watch.mp3"},
    {"category": "a bird", "audio": "bird.mp3"},
    {"category": "a house", "audio": "house.mp3"},
    {"category": "a cat", "audio": "cat.mp3"},
    {"category": "a tree", "audio": "tree.mp3"},
    {"category": "a rabbit", "audio": "rabbit.mp3"},
    {"category": "a hat", "audio": "hat.mp3"},
    {"category": "a cup", "audio": "cup.mp3"}]

// sight restored
var stimListTest = [
     {"category": "a woman", "audio": "woman.mp3"},
    {"category": "a bus", "audio": "bus.mp3"},
    {"category": "a car", "audio": "car.mp3"},
    {"category": "a chair", "audio": "chair.mp3"},
    {"category": "a dog", "audio": "dog.mp3"},
    {"category": "a face", "audio": "face.mp3"},
    {"category": "a house", "audio": "house.mp3"},
    {"category": "a phone", "audio": "phone.mp3"},
    {"category": "a tree", "audio": "tree.mp3"},
    {"category": "a man", "audio": "man.mp3"},
    {"category": "a fish", "audio": "fish.mp3"},
    {"category": "a cup", "audio": "cup.mp3"}
]

var bonusListTD = [{"category": "a spoon", "audio": "spoon.mp3"},
     {"category": "a train", "audio": "train.mp3"},
     {"category": "a bus", "audio": "bus.mp3"},
     {"category": "a fish", "audio": "fish.mp3"},
     {"category": "a face", "audio": "face.mp3"},
     {"category": "a phone", "audio": "phone.mp3"},
     {"category": "eyeglasses", "audio": "eyeglasses.mp3"},
     {"category": "a man", "audio": "man.mp3"},
     {"category": "a woman", "audio": "woman.mp3"},
     {"category": "a toothbrush", "audio": "toothbrush.mp3"},
     {"category": "a key", "audio": "key.mp3"},
     {"category": "a dog", "audio": "dog.mp3"}]

var bonusList = [{"category": "a spoon", "audio": "spoon.mp3"},
     {"category": "a train", "audio": "train.mp3"},
     {"category": "a bird", "audio": "bird.mp3"},
     {"category": "a button", "audio": "button.mp3"},
     {"category": "a cat", "audio": "cat.mp3"},
     {"category": "eyeglasses", "audio": "eyeglasses.mp3"},
     {"category": "shoe", "audio": "shoe.mp3"},
     {"category": "a banana", "audio": "banana.mp3"},
     {"category": "a toothbrush", "audio": "toothbrush.mp3"},
     {"category": "a key", "audio": "key.mp3"},
     {"category": "a monkey", "audio": "monkey.mp3"}]

var stimListTest = shuffle(stimListTest)
var bonusList = shuffle(bonusList)
stimListTest.unshift(...traceList)
stimListTest.unshift(drawingTutorial)
stimListTest.push(bonusPrompt)

var maxTrials = stimListTest.length; //
var bonusTrialsMax = stimListTest.length; 
var curTrial=0  // global variable, trial counter
console.log(bonusTrialsMax)
var stimLang = {
    "this square": "this square",
    "square": "square",
    "line": "line",
    "shape": "shape",
    "a crab": "a crab",
    "a crocodile": "a crocodile",
    "a duck": "a duck",
    "a giraffe": "a giraffe",
    "a lion": "a lion",
    "a monkey": "a monkey",
    "a panda": "a panda",
    "a truck": "a truck",
    "a bike": "a cycle",
    "an airplane": "an aeroplane",
    "a face": "a face",
    "a spoon": "a spoon",
    "a cup": "a cup",
    "a person": "a person",
    "a man": "a man",
    "a woman": "a woman",
    "a ball": "a ball",
    "museum": "the museum"}

var cuesLang = {
    "trace": "Can you trace the ",
    "copy": "Can you copy ",
    "draw": "Can you draw ",
    "endQuestion": " ?",
    "bonus": "You're all done! Click the button on the right to keep drawing!",
    "demo": "Ask Urvi to help you with this drawing!",
    "tutorial": "Try drawing anything with one finger!",
    "done": "Good job! The game is over."
}
var checkBoxAlert = "Can we use your child's drawings? If so, please click the box above to start drawing!";
var idAlert = "Please enter a correctly formatted ID (two letters followed by three digits)";

// set global variables
var clickedSubmit=0; // whether an image is submitted or not
var tracing = true; //whether the user is in tracing trials or not
var maxTraceTrial = traceList.length; //the max number of tracing trials
maxTraceTrial = maxTraceTrial + 1 // add one because the intro technically gets logged as a trial
var timeLimit=120; //30 for TD; todo add mode switch
var disableDrawing = false; //whether touch drawing is disabled or not
var language = "English";
var strokeThresh = 3; // each stroke needs to be at least this many pixels long to be sent

// current mode and session info
var mode = "CDM";
var version ="india_run_v1";
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

// for each time we start drawings
function startDrawing(){
    if (curTrial<maxTrials) {
        if (curTrial == 0) {
            $(consentPage).fadeOut('fast');
        }
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


function showIntroAudio(){
    var player = loadNextAudio(curTrial); // change video
    document.getElementById("audioCue").innerHTML = "This game is for only one person at a time. Please draw by yourself!";
    setTimeout(function() {showCue();},1000);
    setTimeout(function() {playAudio(player);},1000);
}


// for the start of each trial
function beginTrial(){
    //
    var player = loadNextAudio(curTrial); // change video
    if (curTrial < maxTrials) {
        var categoryKey = stimListTest[curTrial].category;
        var categoryName = stimLang[categoryKey] || categoryKey;    
    }
    if (curTrial == 0) {
        var cue = cuesLang["tutorial"];
        document.getElementById("audioCue").innerHTML = cue

        document.getElementById("drawingCue").innerHTML = "Anything!"
    } else if (curTrial == maxTrials) {
        document.getElementById("audioCue").innerHTML = cuesLang["done"];
    }
    else if (tracing){
        var traceCue = cuesLang["trace"] + categoryName + cuesLang["endQuestion"];
        document.getElementById("audioCue").innerHTML = traceCue;
        document.getElementById("drawingCue").innerHTML = traceCue;
    }else {
        if (stimListTest[curTrial].category == 'this square'){
            var circleCue = cuesLang["copy"]  + categoryName + cuesLang["endQuestion"];
            document.getElementById("audioCue").innerHTML = circleCue;
            document.getElementById("drawingCue").innerHTML = circleCue;
        } else if (stimListTest[curTrial].category == 'bonus'){
            document.getElementById("audioCue").innerHTML = cuesLang[stimListTest[curTrial].category];
        }
        else{
            document.getElementById("audioCue").innerHTML = cuesLang["draw"] + categoryName + cuesLang["endQuestion"]; // change cue
            console.log(document.getElementById("audioCue").innerHTML)
            document.getElementById("drawingCue").innerHTML = categoryName; // change drawing cue
        }

    }
    $("#audioRepeater").fadeOut();
    setTimeout(function() {showCue();},1000);
    setTimeout(function() {playAudio(player);},1000);
}

// show cue without drawing canvas
function showCue() {
    $('#mainExp').fadeIn('fast'); // fade in exp
    $('#audioCue').fadeIn('fast'); // text cue associated with trial
    if (stimListTest[curTrial].category == 'bonus') {
        $('#keepDrawing').fadeIn('fast');
    }
}

// video player functions
function playAudio(player){
    $("#cueAudioDiv").html("<audio id='cueAudio' class='video-js vjs-default-skin vjs-hidden-player'></audio>");
    $('#cueAudioDiv').fadeIn(); // show audio div (change the ID accordingly)
    if (curTrial == 0) {
        $("#gifContainer").fadeIn();
    }
    player.ready(function() {
        this.play();
        this.on('ended', function() {
            if (curTrial != bonusTrialsMax - 1 & curTrial != maxTrials){
                $("#gifContainer").fadeOut();
                $("#audioRepeater").fadeIn();
                player.dispose();
            } else if (curTrial == maxTrials) {
                restartExperiment();
            }
        });
    });
}

function startDrawingPostAudio() {
    console.log('video ends and drawing starts');
    $("#audioRepeater").fadeOut();
    $('#cueAudioDiv').fadeOut();
    $("#audioGif").fadeOut();
    setTimeout(function(){
        $('#audioCue').hide(); // fade out cue
        setUpDrawing(); // set up the drawing canvas
        $("#cueAudioDiv").html("<audio id='cueAudio' class='video-js vjs-default-skin vjs-hidden-player'></audio>");
    }, 500);
}

function loadNextAudio() {
    var player = videojs('cueAudio', {
        controls: false,
        preload: "auto"
    });
    player.pause();
    player.volume(1); // set volume to max
    if (curTrial < maxTrials) {
        var curAudio = stimListTest[curTrial].audio
    } else {
        var curAudio = donePrompt.audio
    }
    console.log(curAudio); // assuming you have an 'audio' key instead of 'video'
    player.src({ type: "audio/mp3", src: "audio/" + curAudio });
    player.load();
    return player;
}

function setUpDrawing(){
    var imgSize = "80%";
    disableDrawing = false;
    $('#sketchpad').css({"background": "", "opacity":""});
    console.log("setUpDrawing")
    if(curTrial == 0) {
        // Show tutorial GIF
        console.log(stimListTest[curTrial].gif)
        var tutorialGifUrl = `url('${stimListTest[curTrial].gif}')`; // Replace with your actual GIF path
        $('#sketchpad').css("background-image", tutorialGifUrl)
            .css("background-size", imgSize)
            .css("background-repeat", "no-repeat")
            .css("background-position", "center center");
        
        // Remove GIF when participant touches/clicks the canvas
        $('#sketchpad').one('mousedown touchstart', function() {
            $('#sketchpad').css("background-image", "");
        });
    }
    else if (tracing){
        //for all tracing trials, show the tracing image on the canvas
        var imageurl = "url('" + stimListTest[curTrial].image + "')";
        $('#sketchpad').css("background-image", imageurl)
            .css("background-size",imgSize)
            .css("background-repeat", "no-repeat")
            .css("background-position","center center");
        $("#submit_div").show();
        $("#bonusPrompt").hide();

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

    }else if(curTrial == bonusTrialsMax-1){
        $("#submit_div").hide();
        $("#bonusPrompt").show();
    }
    if (curTrial != bonusTrialsMax-1) {
        $('#drawing').fadeIn()
        monitorProgress(); // start the timeout functino
    }
};

function monitorProgress(){
    clickedSubmit=0;
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
        //disableDrawing = true // can't draw after trial timed out
        // Clicked submit will be set to 1 by triggering the function of the other buttons
        if(curTrial == maxTrials-1){
            $('.allDone').trigger('touchstart');
        }else {
            $('.keepGoing').trigger('touchstart');
        }
        $("#sketchpad").css({"background":"linear-gradient(#17a2b81f, #17a2b81f)", "opacity":"0.5"});
        return; //  get out of here
    }
    else if (clickedSubmit==1){
        console.log("exiting out of progress function")
        $element.find('.progress-bar').width(totalBarWidth)
        return; //  get out of here, data being saved by other button
    }
};

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
    var id = $("#participantID").val().trim();
    console.log(dataURL)
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
                participantID: id};

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
   
   var id = $("#participantID").val().trim(); // only active button from first page
   
   // send survey participation data
   var parent_drew = document.getElementById("survey_parent").checked
   var child_drew = document.getElementById("survey_child").checked
   var other_drew = document.getElementById("survey_else").checked
   readable_date = readable_date ?? new Date();
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
                participantID: id};

    // send data to server to write to database
    socket.emit('current_data', current_data);
    console.log('sending survey data')
    
    window.location.href="https://ucsdlearninglabs.org/kiddraw/india_draw.html" // load back to regular landing page
}

function endExperiment(){
    curTrial = maxTrials
    beginTrial()
}

function increaseTrial(){
    saveSketchData() // save first!
    curTrial=curTrial+1; // increase trial counter
}


//////////////////////////////////////////////////////////////////////////////

window.onload = function() {
    $.get("/mode", function(data){
        mode = data.mode;
        if(mode=='Bing') {
            consentPage = '#consentBing';
            thanksPage = "#thanksBing";
            console.log(" mode Bing")
        }else if(mode=="CDM"){
            consentPage = '#consentCDM';
            thanksPage = "#thanksPage";
            console.log("mode CDM")
        }
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

        }else{
            var id = $("#participantID").val().trim();
            if (id === "" || !/^[A-Za-z]{2}\d{3}$/.test(id)) {
                alert(idAlert);
            } else {
                startDrawing();
            }
        }

    });

    // if child presses the "lets keep drawing" button....e.g.,  the SUBMIT button
    $('.keepGoing').bind('touchstart mousedown',function(e) {
        e.preventDefault()
        $('.keepGoing').removeClass('bounce')

        console.log('touched next trial button');
        if (curTrial == bonusTrialsMax - 1) {
            stimListTest = stimListTest.concat(bonusList)
            maxTrials = stimListTest.length
            curTrial = curTrial + 1
            $('#keepDrawing').fadeOut('fast');
        }
        else if(clickedSubmit==0){// if the current trial has not timed out yet
            clickedSubmit=1; // indicate that we submitted - global variable
            if (curTrial != bonusTrialsMax - 1) {
                increaseTrial(); // save data and increase trial counter
            }
        }
        $('#drawing').hide(); // hide the canvas
        // if this is not the bonus trial prompt
        if (curTrial != bonusTrialsMax) {
            project.activeLayer.removeChildren(); // clear the canvas
        }
        startDrawing(); // start the new trial
    });

    $('.allDone').bind('touchstart mousedown',function(e) {
        e.preventDefault()
        // if (isDoubleClicked($(this))) return;

        console.log('touched endExperiment  button');
        if(clickedSubmit==0){// if the current trial has not timed out yet
            clickedSubmit=1; // indicate that we submitted - global variable
            increaseTrial(); // save data and increase trial counter
        }
        $('#mainExp').hide();
        $('#drawing').hide();
        $('.keepGoing').removeClass('bounce')
        $('#keepDrawing').fadeOut('fast');
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

    $('.replayCue').bind('touchstart mousedown', function(e){
        e.preventDefault()
        startDrawing()
    });

    $('.submitCue').bind('touchstart mousedown', function(e) {
        e.preventDefault()
        startDrawingPostAudio()
    });

    /////////////// DRAWING PARAMETERS AND FUNCTIONS ///////////////
    var canvas = document.getElementById("sketchpad"),
        ctx=canvas.getContext("2d");
    //landscape mode 00 inne
    if (window.innerWidth > window.innerHeight){
        canvas.height = window.innerWidth*.6;
        canvas.width = window.innerWidth*.63;
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
        var id = $("#participantID").val().trim();
        
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
            participantID: id};

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

    // Refresh if no user activities in 5 mins
    var time = new Date().getTime();
    $(document.body).bind("touchstart touchmove touchend click", function(e) {
        time = new Date().getTime();
    });

    var refreshTime = 300000 // 5 mins
    function refresh() {
        if (new Date().getTime() - time >= refreshTime) {
                window.location.href="https://ucsdlearninglabs.org/kiddraw/india_draw.html"
                console.log("No user activities. Reload.")
        } else {
            setTimeout(refresh, refreshTime);
        }
    }

    setTimeout(refresh, refreshTime);



} // on document load





