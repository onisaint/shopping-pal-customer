document.addEventListener("deviceready", onDeviceReady, false);

function id(element) {
    return document.getElementById(element);
}

function onDeviceReady() {
    cameraApp = new cameraApp();
    cameraApp.run();

    navigator.splashscreen.hide();

    //Initiate the plugin.
    ApiAIPlugin.init(
        {
            clientAccessToken: "7bdbecd6aae54b2a9ec02bfae94c2e3e", // insert your client access key here
            lang: "en" // set lang tag from list of supported languages
        },
        function (result) {
            console.log("Plugin initiated");
        },
        function (error) {
            console.log("Error initiating plugin");
        }
    );

}




function ispeak(texttospeak) {
    TTS
        .speak({
            text: texttospeak,
            locale: 'en-US',
            rate: 1
        }, function () {
            //call back function after success
        }, function (reason) {
            console.log("Speech error" + reason);
        });
}





//Requestion Voice.
function requestVoice() {
    try {
        ApiAIPlugin.setListeningStartCallback(function () {
            console.log("listening started");
        });

        ApiAIPlugin.setListeningFinishCallback(function () {
            console.log("listening stopped");
        });

        ApiAIPlugin.requestVoice(
            {}, // empty for simple requests, some optional parameters can be here
            function (response) {
                console.log(response.result.resolvedQuery);
                //You can perform your logic here.
            },
            function (error) {
                //Error goes here.
            });
    } catch (e) {
        console.log("Try catch error: " + e);
    }
}

const URL = "http://ctp.westus.cloudapp.azure.com/imageTagger/execute";
const cognitiveApi = "http://18.130.69.207:8080/cognitivelearning/queryProduct/tags?image_tags="



function cameraApp() { }

cameraApp.prototype = {
    _pictureSource: null,

    _destinationType: null,

    run: function () {
        var that = this;
        that._pictureSource = navigator.camera.PictureSourceType;
        that._destinationType = navigator.camera.DestinationType;
        id("i-sp-camera-icon").addEventListener("click", function () {
            that._capturePhoto.apply(that, arguments);
        });
        id("capturePhotoEditButton").addEventListener("click", function () {
            that._capturePhotoEdit.apply(that, arguments)
        });
        id("getPhotoFromLibraryButton").addEventListener("click", function () {
            that._getPhotoFromLibrary.apply(that, arguments)
        });
        id("getPhotoFromAlbumButton").addEventListener("click", function () {
            that._getPhotoFromAlbum.apply(that, arguments);
        });
    },

    _capturePhoto: function () {
        var that = this;

        // Take picture using device camera and retrieve image as base64-encoded string.
        navigator.camera.getPicture(function () {
            that._onPhotoDataSuccess.apply(that, arguments);
        }, function () {
            that._onFail.apply(that, arguments);
        }, {
                quality: 50,
                destinationType: that._destinationType.DATA_URL
            });
    },

    _capturePhotoEdit: function () {
        var that = this;
        // Take picture using device camera, allow edit, and retrieve image as base64-encoded string. 
        // The allowEdit property has no effect on Android devices.
        navigator.camera.getPicture(function () {
            that._onPhotoDataSuccess.apply(that, arguments);
        }, function () {
            that._onFail.apply(that, arguments);
        }, {
                quality: 20, allowEdit: true,
                destinationType: cameraApp._destinationType.DATA_URL
            });
    },

    _getPhotoFromLibrary: function () {
        var that = this;
        // On Android devices, pictureSource.PHOTOLIBRARY and
        // pictureSource.SAVEDPHOTOALBUM display the same photo album.
        that._getPhoto(that._pictureSource.PHOTOLIBRARY);
    },

    _getPhotoFromAlbum: function () {
        var that = this;
        // On Android devices, pictureSource.PHOTOLIBRARY and
        // pictureSource.SAVEDPHOTOALBUM display the same photo album.
        that._getPhoto(that._pictureSource.SAVEDPHOTOALBUM)
    },

    _getPhoto: function (source) {
        var that = this;
        // Retrieve image file location from specified source.
        navigator.camera.getPicture(function () {
            that._onPhotoURISuccess.apply(that, arguments);
        }, function () {
            cameraApp._onFail.apply(that, arguments);
        }, {
                quality: 50,
                destinationType: cameraApp._destinationType.FILE_URI,
                sourceType: source
            });
    },

    _onPhotoDataSuccess: function (imageData) {
        //var smallImage = document.getElementById('smallImage');
        //smallImage.style.display = 'block';
        console.log("Adding to Chat....");
        addUserImageToChat("data:image/jpeg;base64," + imageData);
        //ispeak("Calling Cognitive Framework");
        //postCognitive(imageData);
        getStubCognitive();

        ispeak("Cognitive Framework Call Ended");
        // Show the captured photo.
        //smallImage.src = "data:image/jpeg;base64," + imageData;
        // $('#smallImage').show();
        //  inspect_image = imageData;

        //var binaryImg = decode64(imageData);
        //callCognitiveAPI(binaryImg);
	    /*var result = {type:"IMG", model:"500", color:"white"};
	    addBotResultToChat(result);*/
    },

    _onPhotoURISuccess: function (imageURI) {
        var smallImage = document.getElementById('smallImage');
        smallImage.style.display = 'block';

        // Show the captured photo.
        smallImage.src = imageURI;
    },

    _onFail: function (message) {
        alert(message);
    }
}

