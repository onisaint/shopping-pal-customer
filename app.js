// @ts-check
// please fix stub function
"use strict";
(function () {
    const TEXT = 'TEXT', IMG = "IMG";
    let __ISRECORDING__ = false;

    let __CONTEXT__;
    let __POLL_QUESTION_ID__;
    let __QUERY_INTERVAL_HOLDER__;

    const $eleChatWindowOutter = document.getElementById("i-sp-chatwindow");
    const $eleChatWindow = document.getElementById("i-sp-chatwindow-response");
    const $eleSendBtn = document.getElementById("i-sp-send-btn");
    const $eleInputField = document.getElementById("i-sp-input-box");
    const $eleLoading = document.getElementById("i-sp-loading");
    const $eleRecordBtn = document.getElementById("i-sp-record-btn");
    const $eleRecordBtnIcon = document.getElementById("i-sp-record-btn-icon");
    const $eleCameraBtnIcon = document.getElementById("i-sp-camera-icon");

    // header
    const $eleHeader = document.getElementById("i-sp-header");

    // RECORD STATE HANDLER
    const $eleRecordStateRecord = document.getElementById("i-sp-record-btn-click");
    const $eleRecordStateStop = document.getElementById("i-sp-stop-btn-click");

    // file-upload
    const $eleFileUpload = document.getElementById("i-sp-file-upload");

    /**
     * @description Initial Play of the app
     */
    (function initialPlay() {
        addBotResultToChat({
            type: TEXT,
            value: `Hi there, I am "Shopping Pal", your personal shopping buddy. Click a picture of any product of your interest and I can help you with your queries.
            To click a picture, tap on the "Camera" button below.`
        });
    })()


    $eleInputField.addEventListener(
        "keyup",
        function ($event) {
            // @ts-ignore
            if (this.value === "") {
                $eleRecordBtn.classList.contains("hidden") ? $eleRecordBtn.classList.remove("hidden") : null;
                !$eleSendBtn.classList.contains("hidden") ? $eleSendBtn.classList.add("hidden") : null;
            } else {
                !$eleRecordBtn.classList.contains("hidden") ? $eleRecordBtn.classList.add("hidden") : null;
                $eleSendBtn.classList.contains("hidden") ? $eleSendBtn.classList.remove("hidden") : null;
            }
        }
    )

    $eleSendBtn.addEventListener(
        "click",
        function ($event) {
            // @ts-ignore - not requires node value
            const query = $eleInputField.value;
            // @ts-ignore - not requires node value36            
            $eleInputField.value = '';
            $eleRecordBtn.classList.contains("hidden") ? $eleRecordBtn.classList.remove("hidden") : null;
            !$eleSendBtn.classList.contains("hidden") ? $eleSendBtn.classList.add("hidden") : null;
            if (!query) {
                return;
            } else {
                addUserQueryToChat(query);

                if (__CONTEXT__ === null) {
                    setTimeout(function () {
                        addBotResultToChat({
                            type: TEXT,
                            value: "I am sorry, I do not have info on this product!"
                        });
                    }, 500)
                    // @ts-ignore
                    $eleInputField.value = "";
                    return;
                };

                if (!__CONTEXT__) {
                    setTimeout(function () {
                        addBotResultToChat({
                            type: TEXT,
                            value: "I am sorry, I do not have a context yet!"
                        });
                    }, 500)
                    // @ts-ignore
                    $eleInputField.value = "";
                    return;
                };


                addBotLoadingToChat();

                fetch(`http://18.130.69.207:8080/cognitivelearning/queryProduct/query?question=${query}&product_name=${__CONTEXT__}`)
                    .then(res => res.json())
                    .then(res => {
                        console.log(res);
                        if (res.Answer.length > 1) {
                            addBotResultToChat({
                                type: TEXT,
                                value: res.Answer
                            });
                        } else {
                            addBotResultToChat({
                                type: TEXT,
                                value: "Sorry, I do not know the answer, \nPlease hold on while I check with our expert"
                            });

                            addBotLoadingToChat();

                            let expertQuestion = {
                                "Query": query,
                                "Product_name": __CONTEXT__
                            }

                            fetch(`http://18.130.69.207:8080/cognitivelearning/queryExpert/`, {
                                method: 'POST',
                                body: JSON.stringify(expertQuestion)
                            })
                                .then(res => res.json())
                                .then(res => {
                                    console.log(res);
                                    if (res.hasOwnProperty("Question_id")) {
                                        __POLL_QUESTION_ID__ = res.Question_id;
                                        addBotLoadingToChat();

                                        __QUERY_INTERVAL_HOLDER__ = setInterval(
                                            function () {
                                                queryForExpertAnswer();
                                            }, 15e3
                                        )

                                    }
                                })
                                .catch(err => handleNetworkErr());
                        }
                    })
            }
        }
    )

    /**
     * @description queries expert's answer
     * return void 
     */
    function queryForExpertAnswer() {
        console.log("querying expert");

        fetch(`http://18.130.69.207:8080/cognitivelearning/queryExpert/getAnswer?question_id=${__POLL_QUESTION_ID__}`)
            .then(res => res.json())
            .then(res => {
                console.log(res);
                if (res.hasOwnProperty("Answer") && res.Answer !== null) {
                    clearInterval(__QUERY_INTERVAL_HOLDER__);
                    __POLL_QUESTION_ID__ = "";

                    addBotResultToChat({
                        type: TEXT,
                        value: "Here is what our expert says,"
                    })

                    setTimeout(function () {
                        addBotResultToChat({
                            type: TEXT,
                            value: res.Answer
                        })
                    }, 5e2)
                }
            })
            .catch(err => handleNetworkErr());
    }

    $eleCameraBtnIcon.addEventListener(
        "click",
        function ($event) {
            $eleFileUpload.click();
        }
    )


    $eleFileUpload.addEventListener(
        "change",
        function ($event) {
            // @ts-ignore event target files has file
            const file = $event.target.files[0]


            var fr = new FileReader();
            fr.onload = function () {
                addUserImageToChat(fr.result);
                addBotLoadingToChat();
            }
            fr.readAsDataURL(file);

            const formData = new FormData();
            formData.append('file', file);

            fetch("http://18.130.69.207/imageTagger/execute", {
                method: 'POST',
                body: formData,
                mode: 'cors'
            })
                .then(res => res.text())
                .then(dict => {
                    if (!!dict.match(/ipod/i)) {
                        __CONTEXT__ = "iPhoneX";

                        addBotResultToChat({
                            type: TEXT,
                            value: "I see it's an " + "IPhoneX" + ".\nNow you can ask me any question regarding this product"
                        });
                    } else {
                        __CONTEXT__ = null;
                        addBotResultToChat({
                            type: TEXT,
                            value: "I am sorry, I could not identify the product. Please click another picture of your product."
                        });
                    }
                })
                .then(res => {

                })
                .catch(err => handleNetworkErr());
        }
    )


    function handleNetworkErr() {
        if (__QUERY_INTERVAL_HOLDER__) {
            clearInterval(__QUERY_INTERVAL_HOLDER__);
            __POLL_QUESTION_ID__ = "";
        }
        addBotResultToChat({
            type: TEXT,
            value: "Sorry, I Can't connect right now, seems your phone is offline."
        })
    }

    /**
     * @description adds input field value to chat window
     * @param {string} query 
     */
    function addUserQueryToChat(query) {
        const $newEleP = document.createElement("p");
        $newEleP.innerText = query;
        const $newUserChat = document.createElement("div");
        $newUserChat.className += "sp-chat sp-chat-by-user";
        $newUserChat.appendChild($newEleP);
        $newUserChat.setAttribute("data-aria-time", new Date().getTime().toString());
        $eleChatWindow.appendChild($newUserChat);
        scroll2Bottom();
    }

    function addUserImageToChat(base64) {
        const $eleImg = new Image();
        $eleImg.src = base64;
        $eleImg.className = "sp-thumbnail";
        const $newUserChat = document.createElement("div");
        $newUserChat.className += "sp-chat sp-chat-by-user";
        $newUserChat.appendChild($eleImg);
        $newUserChat.setAttribute("data-aria-time", new Date().getTime().toString());
        $eleChatWindow.appendChild($newUserChat);
        scroll2Bottom();
    }

    /**
     * @description adds loading to chat window
     */
    function addBotLoadingToChat() {
        $eleLoading.hidden = false;
        $eleLoading.classList.contains("hidden") ? $eleLoading.classList.remove("hidden") : null;
        scroll2Bottom();
    }

    /**
     * @description adds bot response to chat deleting the loading indicator; 
     * if img convert to base64 and send
     * @param {Object} result 
     * @requires Object {type:[TEXT|IMG], value:String}
     */
    function addBotResultToChat(result) {
        $eleLoading.hidden = true;
        $eleLoading.classList.contains("hidden") ? null : $eleLoading.classList.add("hidden");

        const $newUserChat = document.createElement("div");
        $newUserChat.className += "sp-chat sp-chat-by-bot";

        if (result.type == TEXT) {
            const $newEleP = document.createElement("p");
            $newEleP.innerText = result.value;
            speakToUser(result.value);
            $newUserChat.appendChild($newEleP);
            $newUserChat.setAttribute("data-aria-time", new Date().getTime().toString());
            $eleChatWindow.appendChild($newUserChat);
        }

        scroll2Bottom();
    }

    /**
     * @description scrolls the chat window to end
     */
    function scroll2Bottom() {
        setTimeout(function () {
            $eleChatWindowOutter.style.height += $eleChatWindowOutter.clientHeight + 50;
            $eleChatWindowOutter.scrollTop = $eleChatWindowOutter.scrollHeight + 20;
            checkOverFlow();
        }, 10);
    }

    /**
     * @description div overflow
     */
    function checkOverFlow() {
        if ($eleChatWindowOutter.scrollHeight > $eleChatWindowOutter.clientHeight) {
            $eleHeader.style.backgroundColor = "#26528a";
            document.getElementById("i-sp-header-text").style.color = "white";
        }
    }

    $eleChatWindowOutter.addEventListener(
        "scroll",
        function ($event) {
            if (this.scrollTop < 10) {
                $eleHeader.style.backgroundColor = "transparent";
                document.getElementById("i-sp-header-text").style.color = "white";
            } else {
                $eleHeader.style.backgroundColor = "#26528a";
                document.getElementById("i-sp-header-text").style.color = "white";
            }
        }
    )

    // record function
    // @ts-ignore speech recognition works and donot care an instance
    const recognition = new webkitSpeechRecognition();
    // listen to continous speech until the speech is stopped
    recognition.continuous = true;
    recognition.interimResults = true;

    $eleRecordBtn.addEventListener(
        "click",
        function ($event) {
            if (!__ISRECORDING__) {
                if (!('webkitSpeechRecognition' in window)) {
                    stopRecord("Speech recognition is not supported yet!", true);
                }
                else {
                    startRecord();
                    recognition.start();
                }
            } else {
                stopRecord(true);
                recognition.stop();
            }
        }
    )

    function startRecord() {
        __ISRECORDING__ = true;
        // @ts-ignore
        $eleInputField.value = "Recording...";
        $eleInputField.setAttribute("disabled", "true");
        $eleCameraBtnIcon.classList.add("hidden");
        const $eleRecordBtnClass = $eleRecordBtnIcon.classList;
        $eleRecordBtnClass.remove("hidden");
        $eleRecordBtnClass.add("sp-pulse");
        $eleRecordStateRecord.classList.add("hidden");
        $eleRecordStateStop.classList.remove("hidden");
    }

    function stopRecord(message, err) {
        __ISRECORDING__ = false;
        // @ts-ignore
        $eleInputField.value = "";
        $eleInputField.removeAttribute("disabled");
        $eleCameraBtnIcon.classList.remove("hidden");
        const $eleRecordBtnClass = $eleRecordBtnIcon.classList;
        $eleRecordBtnClass.add("hidden");
        $eleRecordBtnClass.remove("sp-pulse");
        $eleRecordStateRecord.classList.remove("hidden");
        $eleRecordStateStop.classList.add("hidden");

        // stub recording
        if (!err) {
            addUserQueryToChat(message);
        } else {
            addUserQueryToChat("Voice recognition is supported yet!");
        }
    }

    recognition.onstart = function ($event) { 
        startRecord();
    }
    
    recognition.onerror = function ($event) { 
        stopRecord("oh oh! I think I am in the wrong track", true)
    }

    recognition.onend = function ($event) { 

    }


})();